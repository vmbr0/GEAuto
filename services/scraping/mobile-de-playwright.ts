import { chromium, Browser, Page } from "playwright";
import { FuelType, Transmission } from "@prisma/client";
import { torProxyManager } from "../proxy/tor-manager";

export interface MobileDeSearchParams {
  brand: string;
  model: string;
  year?: number;
  mileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  maxResults?: number;
  useProxy?: boolean;
}

export interface ScrapedVehicle {
  title: string;
  price: number | null;
  mileage: number | null;
  location: string | null;
  images: string[];
  link: string;
}

export class ScraperBlockedError extends Error {
  constructor(message: string = "Scraper blocked or captcha detected") {
    super(message);
    this.name = "ScraperBlockedError";
  }
}

const DEFAULT_MAX_RESULTS = 100;
const RESULTS_PER_PAGE = 20;
const MAX_ATTEMPTS = 3;
const THROTTLE_MS = 2500;
const PAGE_LOAD_TIMEOUT = 30000;
const SELECTOR_TIMEOUT = 12000;

/** Detect captcha or block page (mobile.de may show German messages). */
async function isBlockedOrCaptcha(page: Page): Promise<boolean> {
  const body = await page.locator("body").textContent().catch(() => "");
  const lower = (body || "").toLowerCase();
  const blockedIndicators = [
    "captcha",
    "robot",
    "zugriff verweigert",
    "access denied",
    "blocked",
    "unusual traffic",
    "recaptcha",
    "please verify",
    "bitte bestätigen",
    "cookie consent",
  ];
  const hasBlock = blockedIndicators.some((s) => lower.includes(s));
  if (hasBlock) return true;
  const captchaFrame = await page.$('iframe[src*="recaptcha"], [class*="captcha"]').catch(() => null);
  return !!captchaFrame;
}

function extractPrice(text: string): number | null {
  if (!text) return null;
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  const cleaned = match[0].replace(/[.,]/g, "");
  const price = parseInt(cleaned, 10);
  return isNaN(price) ? null : price;
}

function extractMileage(text: string): number | null {
  if (!text) return null;
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  const cleaned = match[0].replace(/[.,]/g, "");
  const mileage = parseInt(cleaned, 10);
  return isNaN(mileage) ? null : mileage;
}

async function extractVehiclesFromPage(page: Page, baseUrl: string): Promise<ScrapedVehicle[]> {
  const vehicles: ScrapedVehicle[] = [];
  const selectors = [
    '[data-testid="search-result"]',
    ".cBox-body--resultitem",
    '[class*="result-item"]',
    '[class*="vehicle-item"]',
  ];
  let listings: Awaited<ReturnType<Page["$$"]>> = [];
  for (const selector of selectors) {
    listings = await page.$$(selector).catch(() => []);
    if (listings.length > 0) break;
  }
  if (listings.length === 0) return vehicles;

  for (const listing of listings) {
    try {
      let title = "";
      for (const sel of ['h3', '[class*="title"]', 'a[href*="/fahrzeuge/details"]']) {
        try {
          title = await listing.$eval(sel, (el) => el.textContent?.trim() || "");
          if (title) break;
        } catch {
          continue;
        }
      }
      let priceText = "";
      for (const sel of ['[class*="price"]', '[data-testid="price"]']) {
        try {
          priceText = await listing.$eval(sel, (el) => el.textContent?.trim() || "");
          if (priceText) break;
        } catch {
          continue;
        }
      }
      let mileageText = "";
      for (const sel of ['[class*="mileage"]', '[class*="km"]']) {
        try {
          mileageText = await listing.$eval(sel, (el) => el.textContent?.trim() || "");
          if (mileageText) break;
        } catch {
          continue;
        }
      }
      let location = "";
      for (const sel of ['[class*="location"]', '[class*="city"]']) {
        try {
          location = await listing.$eval(sel, (el) => el.textContent?.trim() || "");
          if (location) break;
        } catch {
          continue;
        }
      }
      const linkEl = await listing.$('a[href*="/fahrzeuge/details"]').catch(() => null);
      const href = linkEl ? await linkEl.getAttribute("href") : "";
      const fullLink = href && href.startsWith("http") ? href : `${baseUrl}${href || ""}`;
      const images: string[] = [];
      const imgs = await listing.$$("img").catch(() => []);
      for (const img of imgs.slice(0, 5)) {
        const src = await img.getAttribute("src").catch(() => "");
        const dataSrc = await img.getAttribute("data-src").catch(() => "");
        const url = src || dataSrc;
        if (url && !url.includes("placeholder") && !url.includes("logo")) {
          images.push(url.startsWith("http") ? url : `${baseUrl}${url}`);
        }
      }
      if (title) {
        vehicles.push({
          title,
          price: extractPrice(priceText),
          mileage: extractMileage(mileageText),
          location: location || null,
          images,
          link: fullLink,
        });
      }
    } catch {
      continue;
    }
  }
  return vehicles;
}

/**
 * Run mobile.de scrape with Playwright: retries (3), throttling, optional proxy, captcha/block detection.
 */
export async function runMobileDeScrape(params: MobileDeSearchParams): Promise<ScrapedVehicle[]> {
  const useProxy = params.useProxy === true;
  const maxResults = params.maxResults ?? DEFAULT_MAX_RESULTS;
  const maxPages = Math.ceil(maxResults / RESULTS_PER_PAGE);
  const baseUrl = "https://www.mobile.de";

  let browser: Browser | null = null;
  const residentialProxy = process.env.RESIDENTIAL_PROXY_URL;
  const proxy = useProxy ? torProxyManager.getNextProxy() : null;

  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ],
  };
  if (residentialProxy) {
    launchOptions.proxy = { server: residentialProxy };
  } else if (useProxy && proxy) {
    launchOptions.args!.push(`--proxy-server=socks5://127.0.0.1:${proxy.port}`);
  }
  // Sinon pas de proxy : connexion directe (évite ERR_PROXY_CONNECTION_FAILED si Tor non installé)

  try {
    browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    const searchParams = new URLSearchParams();
    searchParams.append("makeModelVariant1.makeId", params.brand);
    searchParams.append("makeModelVariant1.modelId", params.model);
    if (params.year) {
      searchParams.append("minFirstRegistrationDate", `${params.year}-01-01`);
      searchParams.append("maxFirstRegistrationDate", `${params.year}-12-31`);
    }
    if (params.mileage) searchParams.append("maxMileage", String(params.mileage));
    if (params.fuelType) {
      const fuelMap: Record<FuelType, string> = {
        PETROL: "BENZIN",
        DIESEL: "DIESEL",
        ELECTRIC: "ELEKTRO",
        HYBRID: "HYBRID",
        PLUGIN_HYBRID: "PLUGIN_HYBRID",
      };
      searchParams.append("fuel", fuelMap[params.fuelType] || "");
    }
    if (params.transmission) {
      const transMap: Record<Transmission, string> = {
        MANUAL: "MANUAL",
        AUTOMATIC: "AUTOMATIC",
        CVT: "AUTOMATIC",
      };
      searchParams.append("transmission", transMap[params.transmission] || "");
    }

    const allVehicles: ScrapedVehicle[] = [];
    let currentPage = 1;

    while (allVehicles.length < maxResults && currentPage <= maxPages) {
      const pageParams = new URLSearchParams(searchParams.toString());
      if (currentPage > 1) pageParams.append("pageNumber", String(currentPage));
      const searchUrl = `${baseUrl}/suchen/auto?${pageParams.toString()}`;

      let attempt = 0;
      let success = false;

      while (attempt < MAX_ATTEMPTS && !success) {
        attempt++;
        try {
          await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT });
          await new Promise((r) => setTimeout(r, 1500));

          if (await isBlockedOrCaptcha(page)) {
            throw new ScraperBlockedError("Captcha or block detected");
          }

          await page
            .waitForSelector('[data-testid="search-result"], .cBox-body--resultitem', { timeout: SELECTOR_TIMEOUT })
            .catch(() => null);

          const pageVehicles = await extractVehiclesFromPage(page, baseUrl);
          if (pageVehicles.length === 0 && allVehicles.length === 0) {
            break;
          }
          allVehicles.push(...pageVehicles);
          success = true;
        } catch (e) {
          if (e instanceof ScraperBlockedError) {
            await browser?.close();
            throw e;
          }
          if (attempt >= MAX_ATTEMPTS) {
            if (allVehicles.length > 0) break;
            throw e;
          }
          await new Promise((r) => setTimeout(r, THROTTLE_MS));
        }
      }

      currentPage++;
      if (currentPage <= maxPages && allVehicles.length < maxResults) {
        await new Promise((r) => setTimeout(r, THROTTLE_MS));
      }
    }

    await browser.close();
    return allVehicles.slice(0, maxResults);
  } catch (e) {
    await browser?.close().catch(() => {});
    throw e;
  }
}
