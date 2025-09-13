/**
 * Validate a URL (http/https only) with reasonable length protection.
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
