/**
 * Validate a URL (http/https only) with reasonable length protection.
 * Additional checks:
 * - Must have a hostname (avoids accepting strings like "http:/foo")
 * - Rejects URLs with whitespace
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.length > 2048) return false;
  if (/\s/.test(url)) return false;
  // Quick reject for malformed protocol usage like 'http:/domain'
  if (/^https?:\/[^/]/i.test(url)) return false;
  try {
    const parsed = new URL(url);
    if (!(parsed.protocol === 'http:' || parsed.protocol === 'https:')) return false;
    if (!parsed.hostname) return false;
    return true;
  } catch {
    return false;
  }
}
