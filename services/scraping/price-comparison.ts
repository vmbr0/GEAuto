import { chromium, Browser, Page } from "playwright";
import { torProxyManager } from "../proxy/tor-manager";
import { PriceComparisonResult } from "@/types/inventory";

export interface PriceComparisonParams {
  brand: string;
  model: string;
  year?: number;
  useProxy?: boolean;
}

/**
 * Service de comparaison de prix entre différents sites
 */
export class PriceComparisonService {
  /**
   * Scrape mobile.de pour obtenir le prix moyen en Allemagne
   */
  private async scrapeMobileDe(params: PriceComparisonParams): Promise<number | null> {
    const useProxy = params.useProxy !== false;
    let browser: Browser | null = null;
    let proxy = useProxy ? torProxyManager.getNextProxy() : null;

    try {
      const launchOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ],
      };
      if (process.env.CHROMIUM_PATH) {
        launchOptions.executablePath = process.env.CHROMIUM_PATH;
      }

      if (useProxy && proxy) {
        launchOptions.args.push(`--proxy-server=socks5://127.0.0.1:${proxy.port}`);
      }

      browser = await chromium.launch(launchOptions);
      const page = await browser.newPage();

      const searchParams = new URLSearchParams();
      searchParams.append("makeModelVariant1.makeId", params.brand);
      searchParams.append("makeModelVariant1.modelId", params.model);
      
      if (params.year) {
        searchParams.append("minFirstRegistrationDate", `${params.year}-01-01`);
        searchParams.append("maxFirstRegistrationDate", `${params.year}-12-31`);
      }

      const url = `https://www.mobile.de/suchen/auto?${searchParams.toString()}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

      // Extraire les prix
      const prices = await page.$$eval(
        '[class*="price"], [data-testid="price"]',
        (elements) => {
          return elements
            .map((el) => {
              const text = el.textContent || "";
              const match = text.match(/[\d.,]+/);
              if (match) {
                return parseInt(match[0].replace(/[.,]/g, ""));
              }
              return null;
            })
            .filter((p): p is number => p !== null);
        }
      );

      await browser.close();

      if (prices.length === 0) return null;

      // Calculer la moyenne
      const sum = prices.reduce((a, b) => a + b, 0);
      return sum / prices.length;
    } catch (error) {
      console.error("Error scraping mobile.de:", error);
      if (browser) await browser.close();
      return null;
    }
  }

  /**
   * Scrape Leboncoin pour obtenir le prix moyen en France
   */
  private async scrapeLeboncoin(params: PriceComparisonParams): Promise<number | null> {
    const useProxy = params.useProxy !== false;
    let browser: Browser | null = null;
    let proxy = useProxy ? torProxyManager.getNextProxy() : null;

    try {
      const launchOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ],
      };
      if (process.env.CHROMIUM_PATH) {
        launchOptions.executablePath = process.env.CHROMIUM_PATH;
      }

      if (useProxy && proxy) {
        launchOptions.args.push(`--proxy-server=socks5://127.0.0.1:${proxy.port}`);
      }

      browser = await chromium.launch(launchOptions);
      const page = await browser.newPage();

      const query = `${params.brand} ${params.model}${params.year ? ` ${params.year}` : ""}`;
      const url = `https://www.leboncoin.fr/recherche?text=${encodeURIComponent(query)}&category=2`;
      
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

      // Extraire les prix (sélecteurs Leboncoin)
      const prices = await page.$$eval(
        '[data-qa-id="aditem_price"], .price',
        (elements) => {
          return elements
            .map((el) => {
              const text = el.textContent || "";
              const match = text.match(/[\d.,]+/);
              if (match) {
                return parseInt(match[0].replace(/[.,]/g, ""));
              }
              return null;
            })
            .filter((p): p is number => p !== null);
        }
      );

      await browser.close();

      if (prices.length === 0) return null;

      const sum = prices.reduce((a, b) => a + b, 0);
      return sum / prices.length;
    } catch (error) {
      console.error("Error scraping Leboncoin:", error);
      if (browser) await browser.close();
      return null;
    }
  }

  /**
   * Scrape LaCentrale pour obtenir le prix moyen en France
   */
  private async scrapeLaCentrale(params: PriceComparisonParams): Promise<number | null> {
    const useProxy = params.useProxy !== false;
    let browser: Browser | null = null;
    let proxy = useProxy ? torProxyManager.getNextProxy() : null;

    try {
      const launchOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ],
      };
      if (process.env.CHROMIUM_PATH) {
        launchOptions.executablePath = process.env.CHROMIUM_PATH;
      }

      if (useProxy && proxy) {
        launchOptions.args.push(`--proxy-server=socks5://127.0.0.1:${proxy.port}`);
      }

      browser = await chromium.launch(launchOptions);
      const page = await browser.newPage();

      const searchParams = new URLSearchParams();
      searchParams.append("makesCommercialNames", params.brand);
      searchParams.append("modelsCommercialNames", params.model);
      
      if (params.year) {
        searchParams.append("firstRegistrationDates", params.year.toString());
      }

      const url = `https://www.lacentrale.fr/listing?${searchParams.toString()}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

      // Extraire les prix (sélecteurs LaCentrale)
      const prices = await page.$$eval(
        '.price, [class*="Price"]',
        (elements) => {
          return elements
            .map((el) => {
              const text = el.textContent || "";
              const match = text.match(/[\d.,]+/);
              if (match) {
                return parseInt(match[0].replace(/[.,]/g, ""));
              }
              return null;
            })
            .filter((p): p is number => p !== null);
        }
      );

      await browser.close();

      if (prices.length === 0) return null;

      const sum = prices.reduce((a, b) => a + b, 0);
      return sum / prices.length;
    } catch (error) {
      console.error("Error scraping LaCentrale:", error);
      if (browser) await browser.close();
      return null;
    }
  }

  /**
   * Scrape uniquement Leboncoin et LaCentrale (même caractéristiques: marque, modèle, année).
   * Utilisé au moment de la création d'une annonce pour remplir les prix moyens marché.
   */
  async scrapeFranceOnly(params: PriceComparisonParams): Promise<{
    avgPriceLeboncoin: number | null;
    avgPriceLaCentrale: number | null;
  }> {
    try {
      const [avgPriceLeboncoin, avgPriceLaCentrale] = await Promise.all([
        this.scrapeLeboncoin(params),
        new Promise<number | null>((resolve) =>
          setTimeout(() => resolve(this.scrapeLaCentrale(params)), 2000)
        ),
      ]);
      return {
        avgPriceLeboncoin: avgPriceLeboncoin ?? null,
        avgPriceLaCentrale: avgPriceLaCentrale ?? null,
      };
    } catch (error) {
      console.error("Error scraping France (LBC/LaCentrale):", error);
      return { avgPriceLeboncoin: null, avgPriceLaCentrale: null };
    }
  }

  /**
   * Compare les prix sur tous les sites
   */
  async compareVehicleMarket(params: PriceComparisonParams): Promise<PriceComparisonResult> {
    console.log(`Comparing prices for ${params.brand} ${params.model}...`);

    // Scraper en parallèle avec délais pour éviter les blocages
    const [avgPriceGermany, avgPriceLeboncoin, avgPriceLaCentrale] = await Promise.all([
      this.scrapeMobileDe(params),
      new Promise<number | null>((resolve) =>
        setTimeout(() => resolve(this.scrapeLeboncoin(params)), 2000)
      ),
      new Promise<number | null>((resolve) =>
        setTimeout(() => resolve(this.scrapeLaCentrale(params)), 4000)
      ),
    ]);

    // Calculer le prix moyen en France
    const francePrices = [avgPriceLeboncoin, avgPriceLaCentrale].filter(
      (p): p is number => p !== null
    );
    const avgPriceFrance =
      francePrices.length > 0
        ? francePrices.reduce((a, b) => a + b, 0) / francePrices.length
        : null;

    // Calculer la différence
    const difference =
      avgPriceGermany && avgPriceFrance ? avgPriceFrance - avgPriceGermany : null;

    return {
      avgPriceGermany: avgPriceGermany || undefined,
      avgPriceFrance: avgPriceFrance || undefined,
      avgPriceLeboncoin: avgPriceLeboncoin || undefined,
      avgPriceLaCentrale: avgPriceLaCentrale || undefined,
      difference: difference || undefined,
    };
  }
}

export const priceComparisonService = new PriceComparisonService();
