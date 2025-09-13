import { isValidUrl } from '@/utils/isValidUrl';
import { isValidEmail } from '@/utils/isValidEmail';

/**
 * Unit tests for validators (explicit coverage beyond indirect usage in other tests)
 */

describe('isValidUrl', () => {
  it('accepts a standard https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('accepts a URL with path and query', () => {
    expect(isValidUrl('http://example.com/path/to/resource?x=1&y=2')).toBe(true);
  });

  it('rejects non-http protocols', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('mailto:test@example.com')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('http:/bad.com')).toBe(false);
    expect(isValidUrl('https//missing-colon.com')).toBe(false);
  });

  it('rejects empty or overly long strings', () => {
    expect(isValidUrl('')).toBe(false);
    const long = 'https://example.com/' + 'a'.repeat(2050);
    expect(isValidUrl(long)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts a simple valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts email with allowed special chars', () => {
    expect(isValidEmail("user.name+alias_o'ref@example-domain.co.uk")).toBe(true);
  });

  it('rejects missing @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects multiple @', () => {
    expect(isValidEmail('user@@example.com')).toBe(false);
  });

  it('rejects invalid domain parts', () => {
    expect(isValidEmail('user@-example.com')).toBe(false);
    expect(isValidEmail('user@example..com')).toBe(false);
  });

  it('rejects empty and overly long email', () => {
    expect(isValidEmail('')).toBe(false);
    const local = 'a'.repeat(200);
    const domain = 'b'.repeat(60) + '.com';
    const longEmail = `${local}@${domain}`; // length > 254
    expect(longEmail.length).toBeGreaterThan(254);
    expect(isValidEmail(longEmail)).toBe(false);
  });
});
