/**
 * Normalize a website URL to always have a protocol prefix.
 * Accepts: "example.com", "www.example.com", "http://example.com", "https://example.com"
 * Returns: "https://example.com" (always with https:// prefix)
 */
export function normalizeWebsiteUrl(url: string): string {
  if (!url || !url.trim()) return "";
  let trimmed = url.trim();

  // Already has a protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Has protocol-like prefix without slashes (e.g. "http:example.com")
  if (/^https?:/i.test(trimmed)) {
    trimmed = trimmed.replace(/^https?:/i, "");
  }

  // Remove leading slashes
  trimmed = trimmed.replace(/^\/+/, "");

  return `https://${trimmed}`;
}

/**
 * Validate that a string looks like a plausible website URL.
 * Very permissive - accepts bare domains, with/without www, with/without protocol.
 */
export function isPlausibleWebsiteUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const trimmed = url.trim();

  // Strip protocol if present
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");

  // Must have at least one dot and no spaces
  if (!withoutProtocol.includes(".") || withoutProtocol.includes(" ")) return false;

  // Basic domain pattern: something.something
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/;
  return domainPattern.test(withoutProtocol);
}
