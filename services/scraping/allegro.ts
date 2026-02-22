import { chromium, Browser, Page } from "playwright";

export interface ScrapedPart {
  title: string;
  price: number | null;
  seller: string | null;
  images: string[];
  link: string;
}

export async function scrapeAllegro(query: string): Promise<ScrapedPart[]> {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();

  try {
    // Build search URL
    const baseUrl = "https://allegro.pl";
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `${baseUrl}/listing?string=${encodedQuery}`;
    
    console.log(`Scraping Allegro: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: "networkidle" });
    
    // Wait for results to load
    await page.waitForSelector('[data-box-name="allegro.listing"]', { timeout: 10000 }).catch(() => {
      console.log("No results found or timeout");
    });

    // Extract parts data
    const parts: ScrapedPart[] = [];
    
    const listings = await page.$$('[data-box-name="allegro.listing"] article, [data-testid="listing-item"]');
    
    for (const listing of listings.slice(0, 20)) { // Limit to 20 results
      try {
        const title = await listing.$eval('h2, [class*="title"], [data-testid="title"]', (el) => 
          el.textContent?.trim() || ""
        ).catch(() => "");
        
        const priceText = await listing.$eval('[class*="price"], [data-testid="price"]', (el) => 
          el.textContent?.trim() || ""
        ).catch(() => "");
        
        const price = extractPrice(priceText);
        
        const seller = await listing.$eval('[class*="seller"], [data-testid="seller"]', (el) => 
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
          parts.push({
            title,
            price,
            seller: seller || null,
            images,
            link: fullLink,
          });
        }
      } catch (err) {
        console.error("Error extracting part data:", err);
        continue;
      }
    }

    await browser.close();
    return parts;
  } catch (error) {
    await browser.close();
    console.error("Scraping error:", error);
    throw error;
  }
}

function extractPrice(text: string): number | null {
  // Remove currency symbols and extract number
  const cleaned = text.replace(/[^\d,]/g, "").replace(",", ".");
  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
}
