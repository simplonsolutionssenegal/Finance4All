import { FraisFactory } from '@/domain/institutions/factories/FraisFactory';
import {
  FraisGratuit,
  FraisFixes,
  FraisPourcentage,
  TypeCalculation,
} from '@/domain/institutions/entities/Frais';
import type { FraisDTO } from '@/domain/institutions/ports/in/AddServiceUseCase';

describe('FraisFactory', () => {
  describe('createFromDTO - FraisGratuit', () => {
    it('should create FraisGratuit when DTO is empty', () => {
      const dto: Partial<FraisDTO> = {};
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should create FraisGratuit when montantFixe is zero', () => {
      const dto: Partial<FraisDTO> = { montantFixe: 0 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should create FraisGratuit when pourcentage is zero', () => {
      const dto: Partial<FraisDTO> = { pourcentage: 0 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should create FraisGratuit when both are zero', () => {
      const dto: Partial<FraisDTO> = { montantFixe: 0, pourcentage: 0 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });
  });

  describe('createFromDTO - FraisFixes', () => {
    it('should create FraisFixes with montantFixe only', () => {
      const dto: Partial<FraisDTO> = { montantFixe: 100 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisFixes);
      expect(result._typeCalculation).toBe(TypeCalculation.FIX);

      const resultDTO = result.toDTO();
      expect(resultDTO.montantFixe).toBe(100);
      expect(resultDTO.pourcentage).toBeUndefined();
    });

    it('should create FraisFixes with montantFixe and pourcentage', () => {
      const dto: Partial<FraisDTO> = { montantFixe: 100, pourcentage: 0.5 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisFixes);
      expect(result._typeCalculation).toBe(TypeCalculation.FIX);

      const resultDTO = result.toDTO();
      expect(resultDTO.montantFixe).toBe(100);
      expect(resultDTO.pourcentage).toBe(0.005);
    });

    it('should prioritize montantFixe over pourcentage', () => {
      const dto: Partial<FraisDTO> = { montantFixe: 50, pourcentage: 2 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisFixes);
      expect(result._typeCalculation).toBe(TypeCalculation.FIX);
    });
  });

  describe('createFromDTO - FraisChange', () => {
    it('should create FraisFixes with fraisChange when provided', () => {
      const dto: Partial<FraisDTO> = {
        fraisChange: {
          fxSurcharge: 1.5,
          devise: 'USD',
        },
      };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisFixes);
      expect(result._typeCalculation).toBe(TypeCalculation.FIX);

      const resultDTO = result.toDTO();
      expect(resultDTO.fraisChange).toEqual({
        fxSurcharge: 1.5,
        devise: 'USD',
      });
    });

    it('should ignore fraisChange when fxSurcharge is zero', () => {
      const dto: Partial<FraisDTO> = {
        fraisChange: {
          fxSurcharge: 0,
          devise: 'USD',
        },
      };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should ignore fraisChange when devise is empty', () => {
      const dto: Partial<FraisDTO> = {
        fraisChange: {
          fxSurcharge: 1.5,
          devise: '',
        },
      };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should prioritize montantFixe over fraisChange', () => {
      const dto: Partial<FraisDTO> = {
        montantFixe: 100,
        fraisChange: {
          fxSurcharge: 1.5,
          devise: 'USD',
        },
      };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisFixes);

      const resultDTO = result.toDTO();
      expect(resultDTO.montantFixe).toBe(100);
      expect(resultDTO.fraisChange).toBeUndefined();
    });
  });

  describe('createFromDTO - FraisPourcentage', () => {
    it('should create FraisPourcentage with pourcentage only', () => {
      const dto: Partial<FraisDTO> = { pourcentage: 1.5 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisPourcentage);
      expect(result._typeCalculation).toBe(TypeCalculation.POURCENTAGE);

      const resultDTO = result.toDTO();
      expect(resultDTO.pourcentage).toBe(0.015);
    });

    it('should create FraisPourcentage with minimum', () => {
      const dto: Partial<FraisDTO> = { pourcentage: 2, minimum: 50 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisPourcentage);

      const resultDTO = result.toDTO();
      expect(resultDTO.pourcentage).toBe(0.02);
      expect(resultDTO.minimum).toBe(50);
    });

    it('should create FraisPourcentage with maximum', () => {
      const dto: Partial<FraisDTO> = { pourcentage: 2, maximum: 1000 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisPourcentage);

      const resultDTO = result.toDTO();
      expect(resultDTO.pourcentage).toBe(0.02);
      expect(resultDTO.maximum).toBe(1000);
    });

    it('should create FraisPourcentage with minimum and maximum', () => {
      const dto: Partial<FraisDTO> = { pourcentage: 1, minimum: 50, maximum: 1000 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisPourcentage);

      const resultDTO = result.toDTO();
      expect(resultDTO.pourcentage).toBe(0.01);
      expect(resultDTO.minimum).toBe(50);
      expect(resultDTO.maximum).toBe(1000);
    });
  });

  describe('Priority logic', () => {
    it('should follow correct priority: montantFixe > fraisChange > pourcentage', () => {
      // Test 1: Tout est présent, montantFixe doit gagner
      const dto1: Partial<FraisDTO> = {
        montantFixe: 100,
        pourcentage: 2,
        fraisChange: { fxSurcharge: 1.5, devise: 'USD' },
      };
      const result1 = FraisFactory.createFromDTO(dto1 as FraisDTO);
      expect(result1).toBeInstanceOf(FraisFixes);
      expect(result1.toDTO().montantFixe).toBe(100);

      // Test 2: fraisChange et pourcentage, fraisChange doit gagner
      const dto2: Partial<FraisDTO> = {
        pourcentage: 2,
        fraisChange: { fxSurcharge: 1.5, devise: 'USD' },
      };
      const result2 = FraisFactory.createFromDTO(dto2 as FraisDTO);
      expect(result2).toBeInstanceOf(FraisFixes);
      expect(result2.toDTO().fraisChange).toBeDefined();

      // Test 3: Seulement pourcentage
      const dto3: Partial<FraisDTO> = { pourcentage: 2 };
      const result3 = FraisFactory.createFromDTO(dto3 as FraisDTO);
      expect(result3).toBeInstanceOf(FraisPourcentage);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative montantFixe as gratuit', () => {
      const dto: Partial<FraisDTO> = { montantFixe: -100 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should handle negative pourcentage as gratuit', () => {
      const dto: Partial<FraisDTO> = { pourcentage: -1 };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should handle undefined values correctly', () => {
      const dto: Partial<FraisDTO> = {
        montantFixe: undefined,
        pourcentage: undefined,
      };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisGratuit);
      expect(result._typeCalculation).toBe(TypeCalculation.FREE);
    });

    it('should handle missing fraisChange correctly', () => {
      const dto: Partial<FraisDTO> = {
        pourcentage: 1,
      };
      const result = FraisFactory.createFromDTO(dto as FraisDTO);

      expect(result).toBeInstanceOf(FraisPourcentage);
      expect(result._typeCalculation).toBe(TypeCalculation.POURCENTAGE);
    });
  });
});
