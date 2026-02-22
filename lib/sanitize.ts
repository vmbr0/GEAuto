/**
 * Simple sanitization to prevent XSS in user-generated content.
 * Strip HTML tags and limit length.
 */
export function sanitizeMessage(input: string | null | undefined, maxLength = 10000): string {
  if (input == null || typeof input !== "string") return "";
  let s = input.slice(0, maxLength);
  s = s.replace(/<[^>]*>/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
