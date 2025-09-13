/**
 * Email validation using a safe, broad regex. Length guard to avoid ReDoS.
 * Combines stricter local-part rules with general domain pattern.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}
