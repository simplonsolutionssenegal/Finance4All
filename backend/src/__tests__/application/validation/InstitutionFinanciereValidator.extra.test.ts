// src/__tests__/application/validation/InstitutionFinanciereValidator.extra.test.ts
import { InstitutionFinanciereValidator } from '@/application/validation/InstitutionFinanciereValidator';
import type { CreateInstitutionFinanciereData } from '@/domain/entities/InstitutionFinanciere';
import { isValidUrl } from '@/utils/isValidUrl';

jest.mock('@/utils/isValidUrl', () => ({
  isValidUrl: jest.fn(),
}));

const validator = new InstitutionFinanciereValidator();

const baseValidInput: CreateInstitutionFinanciereData = {
  nom: 'Banque X',
  type: 'Banque',
  description: 'Une description valide de plus de 10 caractères',
  siteWeb: 'https://exemple.com',
  regionsDesservies: ['Dakar'],
  contact: { nom: 'Alice', email: 'alice@example.com', telephone: '12345678' },
  logo: null,
};

describe('InstitutionFinanciereValidator — couvertures complémentaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Par défaut : toute URL http(s) est valide
    (isValidUrl as jest.Mock).mockImplementation((u: string) => /^https?:\/\//.test(u));
  });

  it("L11: input undefined → 'Les données de l'institution financière sont requises'", () => {
    // @ts-expect-error test volontaire
    expect(() => validator.validate(undefined)).toThrow("Les données de l'institution financière sont requises");
  });

  it('L81: contact totalement vide → contact null', () => {
    const input: CreateInstitutionFinanciereData = {
      ...baseValidInput,
      contact: { nom: '', email: '', telephone: '' },
    };
    const res = validator.validate(input);
    expect(res.contact).toBeNull();
  });

  it('L99: logo URL http(s) valide → accepté tel quel', () => {
    (isValidUrl as jest.Mock).mockReturnValue(true);
    const input: CreateInstitutionFinanciereData = {
      ...baseValidInput,
      logo: 'https://logo.example.com/img.png',
    };
    const res = validator.validate(input);
    expect(res.logo).toBe('https://logo.example.com/img.png');
  });

  it("L104: logo http(s) avec URL invalide ⇒ 'L'URL du logo n'est pas valide'", () => {
    // siteWeb OK
    (isValidUrl as jest.Mock).mockImplementation((u: string) => {
      if (u === 'https://pas-valide.example') return false; // invalide pour le logo
      return true; // tout le reste (dont siteWeb) reste valide
    });

    const input: CreateInstitutionFinanciereData = {
      ...baseValidInput,
      logo: 'https://pas-valide.example',
    };

    expect(() => validator.validate(input)).toThrow("L'URL du logo n'est pas valide");
  });

  it("L104: logo non http/https & non data:image/* ⇒ 'Le logo doit être une image en format base64 valide'", () => {
    const input: CreateInstitutionFinanciereData = {
      ...baseValidInput,
      logo: 'ftp://wrong-format/logo.png',
    };
    expect(() => validator.validate(input)).toThrow('Le logo doit être une image en format base64 valide');
  });

  it("L110: logo base64 > 5MB ⇒ 'Le logo est trop volumineux (max 5MB)'", () => {
    const bigBase64 = 'data:image/png;base64,' + 'a'.repeat(7_000_001); // > 7,000,000
    const input: CreateInstitutionFinanciereData = {
      ...baseValidInput,
      logo: bigBase64,
    };
    expect(() => validator.validate(input)).toThrow('Le logo est trop volumineux (max 5MB)');
  });

  it('L114: logo base64 petit/valide ⇒ accepté', () => {
    const smallBase64 = 'data:image/png;base64,abcd1234';
    const input: CreateInstitutionFinanciereData = {
      ...baseValidInput,
      logo: smallBase64,
    };
    const res = validator.validate(input);
    expect(res.logo).toBe(smallBase64);
  });
});
