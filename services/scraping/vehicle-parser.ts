/**
 * Parsing layer: extract vehicle data from HTML.
 * Separate from scraping. Validates: price required; flag if fewer than 3 valid entries.
 */
import { logSearchWarn } from "@/lib/logger";

export interface ParsedVehicle {
  title: string;
  price: number | null;
  mileage: number | null;
  year: number | null;
  fuel: string | null;
  transmission: string | null;
  url: string;
  imageUrl: string | null;
}

const MIN_VALID_ENTRIES = 3;

function extractNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".").match(/[\d.]+/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return isNaN(n) ? null : n;
}

/**
 * Parse listing HTML fragment or use DOM-like structure.
 * In practice we receive the full page HTML and use regex/string extraction for stability,
 * or we can receive a list of serialized node data from the scraper.
 */
export function parseVehicleListFromHtml(html: string, baseUrl: string): ParsedVehicle[] {
  const vehicles: ParsedVehicle[] = [];
  // Selectors / patterns for mobile.de-style markup (align with existing selectors)
  const listingBlocks = html.split(/cBox-body--resultitem|data-testid="search-result"/).filter((_, i) => i > 0);
  for (const block of listingBlocks) {
    const titleMatch = block.match(/<h3[^>]*>([^<]+)<\/h3>|class="[^"]*title[^"]*"[^>]*>([^<]+)</);
    const title = (titleMatch && (titleMatch[1] || titleMatch[2])) ? (titleMatch[1] || titleMatch[2]).trim() : "";
    const priceMatch = block.match(/(\d[\d.\s]*)\s*€|€\s*(\d[\d.\s]*)/);
    const price = extractNumber(priceMatch ? (priceMatch[1] || priceMatch[2]) : null);
    const mileageMatch = block.match(/(\d[\d.\s]*)\s*km|km\s*(\d[\d.\s]*)/i);
    const mileage = extractNumber(mileageMatch ? (mileageMatch[1] || mileageMatch[2]) : null);
    const linkMatch = block.match(/href="(\/fahrzeuge\/details[^"]+)"/);
    const path = linkMatch ? linkMatch[1] : "";
    const url = path ? (baseUrl.startsWith("http") ? new URL(path, baseUrl).href : baseUrl + path) : "";
    const imgMatch = block.match(/src="([^"]+)"|data-src="([^"]+)"/);
    const imageUrl = (imgMatch && (imgMatch[1] || imgMatch[2])) ? (imgMatch[1] || imgMatch[2]).trim() : null;
    const yearMatch = block.match(/\b(20\d{2}|19\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
    if (!title && !url) continue;
    // Discard entry if price missing (per spec)
    if (price === null) continue;
    vehicles.push({
      title: title || "Untitled",
      price,
      mileage,
      year,
      fuel: null,
      transmission: null,
      url: url || "#",
      imageUrl,
    });
  }
  if (vehicles.length > 0 && vehicles.length < MIN_VALID_ENTRIES) {
    logSearchWarn("parser", "Fewer than 3 valid entries; result may be suspicious", { resultCount: vehicles.length });
  }
  return vehicles;
}

/**
 * Validate parsed list: do not store empty array unless confirmed valid.
 * Returns { valid: true, vehicles } or { valid: false, reason }.
 */
export function validateParsedResults(vehicles: ParsedVehicle[]): { valid: true; vehicles: ParsedVehicle[] } | { valid: false; reason: string } {
  if (vehicles.length === 0) return { valid: false, reason: "no_results" };
  const withPrice = vehicles.filter((v) => v.price != null);
  if (withPrice.length < MIN_VALID_ENTRIES) {
    return { valid: false, reason: `fewer_than_${MIN_VALID_ENTRIES}_valid_entries` };
  }
  return { valid: true, vehicles: withPrice };
}
