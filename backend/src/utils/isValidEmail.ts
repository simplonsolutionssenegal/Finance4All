/**
 * Email validation using a safe, broad regex with extra post checks:
 * - No leading/trailing hyphen in any domain label
 * - No consecutive dots
 */
const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9.-]+$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  if (email.includes('..')) return false;
  if (!EMAIL_REGEX.test(email)) return false;
  const [, domain] = email.split('@');
  if (!domain) return false;
  const labels = domain.split('.');
  for (const label of labels) {
    if (!label) return false; // empty label (e.g., consecutive dot or leading/trailing dot)
    if (label.startsWith('-') || label.endsWith('-')) return false;
  }
  return true;
}
