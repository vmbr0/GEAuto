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
  maxResults?: number; // Nombre maximum de résultats à récupérer
  useProxy?: boolean; // Utiliser les proxies Tor
}

export interface ScrapedVehicle {
  title: string;
  price: number | null;
  mileage: number | null;
  location: string | null;
  images: string[];
  link: string;
}

const DEFAULT_MAX_RESULTS = 100; // Par défaut, récupérer jusqu'à 100 résultats
const RESULTS_PER_PAGE = 20; // Nombre de résultats par page sur mobile.de

/**
 * Scrape mobile.de avec support des proxies Tor et pagination
 */
export async function scrapeMobileDeEnhanced(
  params: MobileDeSearchParams
): Promise<ScrapedVehicle[]> {
  const useProxy = params.useProxy !== false; // Par défaut, utiliser les proxies
  const maxResults = params.maxResults || DEFAULT_MAX_RESULTS;
  
  let browser: Browser | null = null;
  let proxy = useProxy ? torProxyManager.getNextProxy() : null;

  try {
    // Configuration du navigateur avec ou sans proxy
    const launchOptions: any = {
      headless: true,
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    };

    if (useProxy && proxy) {
      launchOptions.args.push(`--proxy-server=socks5://127.0.0.1:${proxy.port}`);
      console.log(`Using Tor proxy on port ${proxy.port}`);
    }

    browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    let page = await context.newPage();

    // Build search URL
    const baseUrl = "https://www.mobile.de";
    const searchParams = new URLSearchParams();
    
    // Brand and model
    searchParams.append("makeModelVariant1.makeId", params.brand);
    searchParams.append("makeModelVariant1.modelId", params.model);
    
    if (params.year) {
      searchParams.append("minFirstRegistrationDate", `${params.year}-01-01`);
      searchParams.append("maxFirstRegistrationDate", `${params.year}-12-31`);
    }
    
    if (params.mileage) {
      searchParams.append("maxMileage", params.mileage.toString());
    }
    
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
      const transmissionMap: Record<Transmission, string> = {
        MANUAL: "MANUAL",
        AUTOMATIC: "AUTOMATIC",
        CVT: "AUTOMATIC",
      };
      searchParams.append("transmission", transmissionMap[params.transmission] || "");
    }

    const allVehicles: ScrapedVehicle[] = [];
    let currentPage = 1;
    const maxPages = Math.ceil(maxResults / RESULTS_PER_PAGE);

    while (allVehicles.length < maxResults && currentPage <= maxPages) {
      try {
        // Ajouter le numéro de page à l'URL
        const pageParams = new URLSearchParams(searchParams.toString());
        if (currentPage > 1) {
          pageParams.append("pageNumber", currentPage.toString());
        }

        const searchUrl = `${baseUrl}/suchen/auto?${pageParams.toString()}`;
        
        console.log(`Scraping page ${currentPage}: ${searchUrl}`);

        // Naviguer vers la page avec retry
        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
          try {
            await page.goto(searchUrl, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            // Attendre que les résultats se chargent
            await page.waitForSelector('[data-testid="search-result"], .cBox-body--resultitem', {
              timeout: 15000,
            }).catch(() => {
              console.log(`No results found on page ${currentPage}`);
            });

            success = true;
          } catch (error: any) {
            retries--;
            console.log(`Retry ${3 - retries}/3 for page ${currentPage}`);
            
            if (retries === 0) {
              // Si échec après retries, changer de proxy si disponible
              if (useProxy && proxy) {
                console.log(`Renewing Tor identity for proxy ${proxy.port}`);
                await torProxyManager.renewIdentity(proxy);
                proxy = torProxyManager.getNextProxy();
                await browser.close();
                browser = await chromium.launch({
                  ...launchOptions,
                  args: [
                    ...launchOptions.args.slice(0, -1),
                    `--proxy-server=socks5://127.0.0.1:${proxy.port}`,
                  ],
                });
                const newContext = await browser.newContext({
                  viewport: { width: 1920, height: 1080 },
                  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                });
                const newPage = await newContext.newPage();
                await page.close();
                page = newPage;
                retries = 3; // Réessayer avec le nouveau proxy
              } else {
                throw error;
              }
            } else {
              // Attendre avant de réessayer
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          }
        }

        // Extraire les véhicules de la page
        const pageVehicles = await extractVehiclesFromPage(page, baseUrl);
        
        if (pageVehicles.length === 0) {
          console.log(`No vehicles found on page ${currentPage}, stopping pagination`);
          break;
        }

        allVehicles.push(...pageVehicles);
        console.log(`Found ${pageVehicles.length} vehicles on page ${currentPage} (total: ${allVehicles.length})`);

        // Attendre un peu avant la page suivante pour éviter d'être bloqué
        if (currentPage < maxPages && allVehicles.length < maxResults) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        currentPage++;
      } catch (error) {
        console.error(`Error scraping page ${currentPage}:`, error);
        // Si erreur, passer à la page suivante ou arrêter
        if (allVehicles.length === 0) {
          throw error;
        }
        break;
      }
    }

    await browser.close();
    return allVehicles.slice(0, maxResults);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error("Scraping error:", error);
    throw error;
  }
}

/**
 * Extrait les véhicules d'une page
 */
async function extractVehiclesFromPage(
  page: Page,
  baseUrl: string
): Promise<ScrapedVehicle[]> {
  const vehicles: ScrapedVehicle[] = [];

  // Sélecteurs possibles pour les résultats
  const selectors = [
    '[data-testid="search-result"]',
    '.cBox-body--resultitem',
    '[class*="result-item"]',
    '[class*="vehicle-item"]',
  ];

  let listings: any[] = [];
  for (const selector of selectors) {
    try {
      listings = await page.$$(selector);
      if (listings.length > 0) {
        console.log(`Found ${listings.length} listings with selector: ${selector}`);
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (listings.length === 0) {
    console.log("No listings found with any selector");
    return vehicles;
  }

  for (const listing of listings) {
    try {
      // Titre
      const titleSelectors = ['h3', '[class*="title"]', '[data-testid="title"]', 'a[href*="/fahrzeuge/details"]'];
      let title = "";
      for (const selector of titleSelectors) {
        try {
          title = await listing.$eval(selector, (el: Element) => el.textContent?.trim() || "");
          if (title) break;
        } catch (e) {
          continue;
        }
      }

      // Prix
      const priceSelectors = ['[class*="price"]', '[data-testid="price"]', '[class*="amount"]'];
      let priceText = "";
      for (const selector of priceSelectors) {
        try {
          priceText = await listing.$eval(selector, (el) => el.textContent?.trim() || "");
          if (priceText) break;
        } catch (e) {
          continue;
        }
      }
      const price = extractPrice(priceText);

      // Kilométrage
      const mileageSelectors = ['[class*="mileage"]', '[data-testid="mileage"]', '[class*="km"]'];
      let mileageText = "";
      for (const mileageSelector of mileageSelectors) {
        try {
          mileageText = await listing.$eval(mileageSelector, (el) => el.textContent?.trim() || "");
          if (mileageText) break;
        } catch (e) {
          continue;
        }
      }
      const mileage = extractMileage(mileageText);

      // Localisation
      const locationSelectors = ['[class*="location"]', '[data-testid="location"]', '[class*="city"]'];
      let location = "";
      for (const locationSelector of locationSelectors) {
        try {
          location = await listing.$eval(locationSelector, (el) => el.textContent?.trim() || "");
          if (location) break;
        } catch (e) {
          continue;
        }
      }

      // Lien
      const linkElement = await listing.$('a[href*="/fahrzeuge/details"]').catch(() => null);
      const link = linkElement ? await linkElement.getAttribute("href") || "" : "";
      const fullLink = link.startsWith("http") ? link : `${baseUrl}${link}`;

      // Images
      const images: string[] = [];
      const imageElements = await listing.$$('img').catch(() => []);
      for (const img of imageElements.slice(0, 5)) {
        const src = await img.getAttribute("src").catch(() => "");
        const dataSrc = await img.getAttribute("data-src").catch(() => "");
        const imageUrl = src || dataSrc;
        if (imageUrl && !imageUrl.includes("placeholder") && !imageUrl.includes("logo")) {
          images.push(imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`);
        }
      }

      if (title) {
        vehicles.push({
          title,
          price,
          mileage,
          location,
          images,
          link: fullLink,
        });
      }
    } catch (err) {
      console.error("Error extracting vehicle data:", err);
      continue;
    }
  }

  return vehicles;
}

function extractPrice(text: string): number | null {
  if (!text) return null;
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  
  const cleaned = match[0].replace(/[.,]/g, "");
  const price = parseInt(cleaned);
  return isNaN(price) ? null : price;
}

function extractMileage(text: string): number | null {
  if (!text) return null;
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  
  const cleaned = match[0].replace(/[.,]/g, "");
  const mileage = parseInt(cleaned);
  return isNaN(mileage) ? null : mileage;
}
