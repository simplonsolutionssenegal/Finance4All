// __tests__/lib/validation.test.ts
import { validateEmail, validatePassword, validateOTPCode } from '@/lib/validation';

describe('validateEmail', () => {
  it('retourne une erreur si vide', () => {
    expect(validateEmail('')).toMatch(/email est requise/i);
    expect(validateEmail('   ')).toMatch(/email est requise/i);
  });

  it('rejette les doubles points consécutifs', () => {
    expect(validateEmail('a..b@example.com')).toMatch(/adresse email valide/i);
  });

  it('rejette un format invalide (pas de TLD)', () => {
    expect(validateEmail('user@domain')).toMatch(/adresse email valide/i);
  });

  it('rejette une adresse > 254 caractères', () => {
    const local = 'a'.repeat(245); // 245 + "@a.com" (6) = 251 → encore valide
    const almostTooLong = `${'a'.repeat(248)}@a.com`; // 248 + 6 = 254 pile
    const tooLong = `${'a'.repeat(249)}@a.com`; // 249 + 6 = 255 > 254
    expect(validateEmail(almostTooLong)).toBe(''); // limite haute acceptée
    expect(validateEmail(tooLong)).toMatch(/trop longue/i);
  });

  it('accepte un email valide', () => {
    expect(validateEmail('john.doe+test@example.co')).toBe('');
  });
});

describe('validatePassword', () => {
  it('retourne une erreur si vide', () => {
    expect(validatePassword('')).toMatch(/mot de passe est requis/i);
  });

  it('retourne une erreur si < 8 caractères', () => {
    expect(validatePassword('Abc12!')).toMatch(/au moins 8 caractères/i);
  });

  it('retourne une erreur si > 128 caractères', () => {
    const longPwd = 'A' + 'a'.repeat(128) + '1!'; // > 128
    expect(validatePassword(longPwd)).toMatch(/trop long/i);
  });

  it('retourne une erreur si complexité < 3 critères', () => {
    // minuscules + chiffres uniquement (2 critères)
    expect(validatePassword('abcdefg1')).toMatch(/au moins 3 des éléments/i);
    // majuscules + minuscules uniquement (2 critères)
    expect(validatePassword('Abcdefgh')).toMatch(/au moins 3 des éléments/i);
  });

  it('accepte un mot de passe valide (≥ 3 critères)', () => {
    // majuscules + minuscules + chiffres (3 critères), longueur OK
    expect(validatePassword('Abcdef12')).toBe('');
    // 4 critères aussi OK
    expect(validatePassword('Abcdef1!')).toBe('');
  });
});

describe('validateOTPCode', () => {
  it('retourne une erreur si vide', () => {
    expect(validateOTPCode('')).toMatch(/code est requis/i);
  });

  it('retourne une erreur si longueur < minLength (par défaut 6)', () => {
    expect(validateOTPCode('12345')).toMatch(/au moins 6 caractères/i);
  });

  it('accepte un code valide (exactement minLength)', () => {
    expect(validateOTPCode('123456')).toBe('');
  });

  it('accepte un code valide avec minLength personnalisé', () => {
    expect(validateOTPCode('1234', 4)).toBe('');
  });
});
