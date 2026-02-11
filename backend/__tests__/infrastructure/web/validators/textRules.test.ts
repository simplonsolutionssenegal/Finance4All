import { assertMaxLength, assertNotBlank } from '@/infrastructure/web/validators/textRules';

describe('textRules', () => {
  describe('assertNotBlank', () => {
    it('ne lance pas d’erreur pour une chaîne non vide', () => {
      expect(() => assertNotBlank('Hello', 'error')).not.toThrow();
    });

    it('lance une erreur si value est une chaîne vide', () => {
      expect(() => assertNotBlank('', 'Le champ est obligatoire')).toThrow(
        'Le champ est obligatoire'
      );
    });

    it('lance une erreur si value ne contient que des espaces', () => {
      expect(() => assertNotBlank('   ', 'Le champ est obligatoire')).toThrow(
        'Le champ est obligatoire'
      );
    });

    it('lance une erreur si value est undefined (via cast)', () => {
      expect(() =>
        assertNotBlank(undefined as unknown as string, 'Le champ est obligatoire')
      ).toThrow('Le champ est obligatoire');
    });

    it('lance une erreur si value est null (via cast)', () => {
      expect(() => assertNotBlank(null as unknown as string, 'Le champ est obligatoire')).toThrow(
        'Le champ est obligatoire'
      );
    });
  });

  describe('assertMaxLength', () => {
    it('ne lance pas d’erreur si la longueur est égale au max', () => {
      expect(() => assertMaxLength('abcd', 4, 'Trop long')).not.toThrow();
    });

    it('ne lance pas d’erreur si la longueur est inférieure au max', () => {
      expect(() => assertMaxLength('abc', 4, 'Trop long')).not.toThrow();
    });

    it('lance une erreur si la longueur dépasse le max', () => {
      expect(() => assertMaxLength('abcde', 4, 'Trop long')).toThrow('Trop long');
    });
  });
});
