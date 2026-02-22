/**
 * Scraper: fetch page with Playwright. No parsing here.
 * - waitUntil: "networkidle", wait for result container, 30s timeout.
 * - Block/captcha detection; do not return invalid content.
 * - DEV_MODE: save raw HTML snapshot and log size / first 500 chars.
 */
import { chromium, Browser, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { logSearchEvent, logSearchError, logSearchWarn } from "@/lib/logger";

const PAGE_LOAD_TIMEOUT_MS = 30_000;
const RESULT_SELECTORS = [
  '[data-testid="search-result"]',
  ".cBox-body--resultitem",
  '[class*="result-item"]',
  '[class*="vehicle-item"]',
];

const BLOCK_INDICATORS = [
  "access denied",
  "zugriff verweigert",
  "captcha",
  "recaptcha",
  "robot",
  "blocked",
  "unusual traffic",
  "please verify",
  "bitte bestätigen",
];

export class ScraperBlockedError extends Error {
  constructor(message: string = "Page blocked or captcha detected") {
    super(message);
    this.name = "ScraperBlockedError";
  }
}

export interface ScrapeResult {
  html: string;
  url: string;
}

const DEV_MODE = process.env.DEV_MODE === "true" || process.env.NODE_ENV !== "production";

function isBlocked(html: string): boolean {
  const lower = html.toLowerCase();
  if (BLOCK_INDICATORS.some((s) => lower.includes(s))) return true;
  return !!html.match(/iframe[^>]*recaptcha|class="[^"]*captcha/);
}

export async function fetchSearchPage(searchUrl: string): Promise<ScrapeResult> {
  let browser: Browser | null = null;
  const start = Date.now();
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    await page.goto(searchUrl, {
      waitUntil: "networkidle",
      timeout: PAGE_LOAD_TIMEOUT_MS,
    });

    // Wait for at least one result container or empty-state
    let found = false;
    for (const sel of RESULT_SELECTORS) {
      try {
        await page.waitForSelector(sel, { timeout: 8000 });
        found = true;
        break;
      } catch {
        continue;
      }
    }
    if (!found) {
      const body = await page.locator("body").innerHTML().catch(() => "");
      if (isBlocked(body)) throw new ScraperBlockedError("Block/captcha detected");
      logSearchWarn("scraper", "Result container not found; page may be empty or changed", { url: searchUrl });
    }

    const html = await page.content();
    const durationMs = Date.now() - start;

    if (isBlocked(html)) throw new ScraperBlockedError("Block/captcha detected in response");

    if (DEV_MODE) {
      const snapshotDir = path.join(process.cwd(), "tmp", "scraper-snapshots");
      try {
        fs.mkdirSync(snapshotDir, { recursive: true });
        const filename = path.join(snapshotDir, `snapshot-${Date.now()}.html`);
        fs.writeFileSync(filename, html, "utf8");
        logSearchEvent("scraper", "HTML snapshot saved", {
          durationMs,
          htmlSize: html.length,
          htmlPreview: html.slice(0, 500),
          snapshotPath: filename,
        });
      } catch (e) {
        logSearchWarn("scraper", "Could not save HTML snapshot", { error: String(e) });
      }
    } else {
      logSearchEvent("scraper", "Page fetched", { durationMs, htmlSize: html.length, url: searchUrl });
    }

    return { html, url: searchUrl };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
