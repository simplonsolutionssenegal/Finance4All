// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciereValidator } from '@/application/validation/InstitutionFinanciereValidator';

const validator = new InstitutionFinanciereValidator();

const baseValid = {
  nom: 'Banque Test',
  type: 'BANQUE',
  description: 'Une description valide avec plus de 10 caractères',
  siteWeb: 'https://www.banquetest.com',
  regionsDesservies: ['Île-de-France'],
  contact: { nom: 'Contact Test', email: 'contact@banquetest.com', telephone: '+33123456789' },
  logo: null,
};

describe('InstitutionFinanciereValidator', () => {
  it('returns normalized data for valid input', () => {
    const result = validator.validate(baseValid);
    expect(result.nom).toBe(baseValid.nom);
    expect(result.contact).toEqual(expect.objectContaining({ email: 'contact@banquetest.com' }));
  });

  it('allows absence of contact', () => {
    const input = { ...baseValid, contact: undefined };
    const result = validator.validate(input);
    expect(result.contact).toBeNull();
  });

  it('throws on invalid email', () => {
    const input = { ...baseValid, contact: { ...baseValid.contact, email: 'bad' } };
    expect(() => validator.validate(input)).toThrow("L'adresse email du contact n'est pas valide");
  });

  it('throws on short nom', () => {
    const input = { ...baseValid, nom: 'A' };
    expect(() => validator.validate(input)).toThrow("Le nom de l'institution doit contenir entre 2 et 100 caractères");
  });

  it('throws on too many regions', () => {
    const input = { ...baseValid, regionsDesservies: Array(21).fill('R') };
    expect(() => validator.validate(input)).toThrow('Entre 1 et 20 régions desservies doivent être spécifiées');
  });
});
