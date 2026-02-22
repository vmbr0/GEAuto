import { chromium, Browser, Page } from "playwright";
import { FuelType, Transmission } from "@prisma/client";

export interface MobileDeSearchParams {
  brand: string;
  model: string;
  year?: number;
  mileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
}

export interface ScrapedVehicle {
  title: string;
  price: number | null;
  mileage: number | null;
  location: string | null;
  images: string[];
  link: string;
}

export async function scrapeMobileDe(params: MobileDeSearchParams): Promise<ScrapedVehicle[]> {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();

  try {
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
        CVT: "AUTOMATIC", // CVT is treated as automatic on mobile.de
      };
      searchParams.append("transmission", transmissionMap[params.transmission] || "");
    }

    const searchUrl = `${baseUrl}/suchen/auto?${searchParams.toString()}`;
    
    console.log(`Scraping: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: "networkidle" });
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="search-result"]', { timeout: 10000 }).catch(() => {
      console.log("No results found or timeout");
    });

    // Extract vehicle data
    const vehicles: ScrapedVehicle[] = [];
    
    const listings = await page.$$('[data-testid="search-result"]');
    
    for (const listing of listings.slice(0, 20)) { // Limit to 20 results
      try {
        const title = await listing.$eval('h3, [class*="title"]', (el) => el.textContent?.trim() || "").catch(() => "");
        
        const priceText = await listing.$eval('[class*="price"], [data-testid="price"]', (el) => 
          el.textContent?.trim() || ""
        ).catch(() => "");
        
        const price = extractPrice(priceText);
        
        const mileageText = await listing.$eval('[class*="mileage"], [data-testid="mileage"]', (el) => 
          el.textContent?.trim() || ""
        ).catch(() => "");
        
        const mileage = extractMileage(mileageText);
        
        const location = await listing.$eval('[class*="location"], [data-testid="location"]', (el) => 
          el.textContent?.trim() || ""
        ).catch(() => "");
        
        const linkElement = await listing.$('a').catch(() => null);
        const link = linkElement ? await linkElement.getAttribute("href") || "" : "";
        const fullLink = link.startsWith("http") ? link : `${baseUrl}${link}`;
        
        const images: string[] = [];
        const imageElements = await listing.$$('img').catch(() => []);
        for (const img of imageElements.slice(0, 3)) {
          const src = await img.getAttribute("src").catch(() => "");
          if (src && !src.includes("placeholder")) {
            images.push(src);
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

    await browser.close();
    return vehicles;
  } catch (error) {
    await browser.close();
    console.error("Scraping error:", error);
    throw error;
  }
}

function extractPrice(text: string): number | null {
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  
  const cleaned = match[0].replace(/[.,]/g, "");
  const price = parseInt(cleaned);
  return isNaN(price) ? null : price;
}

function extractMileage(text: string): number | null {
  const match = text.match(/[\d.,]+/);
  if (!match) return null;
  
  const cleaned = match[0].replace(/[.,]/g, "");
  const mileage = parseInt(cleaned);
  return isNaN(mileage) ? null : mileage;
}
