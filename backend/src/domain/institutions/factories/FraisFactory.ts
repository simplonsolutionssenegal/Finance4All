import {
  FraisGratuit,
  FraisFixes,
  FraisPourcentage,
  type Frais,
} from '@/domain/institutions/entities/Frais';
import type { FraisDTO } from '@/domain/institutions/ports/in/AddServiceUseCase';

/**
 * Factory pour créer des instances de Frais à partir d'un DTO
 */
export class FraisFactory {
  /**
   * Crée une instance de Frais basée sur le DTO fourni
   * Ordre de priorité:
   * 1. Frais fixes (avec ou sans pourcentage additionnel)
   * 2. Frais de change
   * 3. Frais en pourcentage (avec plafonds optionnels)
   * 4. Gratuit (par défaut)
   */
  static createFromDTO(dto: FraisDTO): Frais {
    if (this.hasMontantFixe(dto)) {
      return this.createFraisFixes(dto);
    }

    if (this.hasFraisChange(dto)) {
      return this.createFraisChange(dto);
    }

    if (this.hasPourcentage(dto)) {
      return this.createFraisPourcentage(dto);
    }

    return new FraisGratuit();
  }

  private static hasMontantFixe(dto: FraisDTO): boolean {
    return dto.montantFixe !== undefined && dto.montantFixe > 0;
  }

  private static hasFraisChange(dto: FraisDTO): boolean {
    return (
      dto.fraisChange !== undefined && dto.fraisChange.fxSurcharge > 0 && !!dto.fraisChange.devise
    );
  }

  private static hasPourcentage(dto: FraisDTO): boolean {
    return dto.pourcentage !== undefined && dto.pourcentage > 0;
  }

  private static createFraisFixes(dto: FraisDTO): FraisFixes {
    const montantFixe = dto.montantFixe ?? 0;
    const rate = dto.pourcentage ? dto.pourcentage / 100 : undefined;
    return new FraisFixes(montantFixe, rate);
  }

  private static createFraisChange(dto: FraisDTO): FraisFixes {
    return new FraisFixes(0, undefined, dto.fraisChange);
  }

  private static createFraisPourcentage(dto: FraisDTO): FraisPourcentage {
    const rate = (dto.pourcentage ?? 0) / 100;
    return new FraisPourcentage(rate, dto.maximum, dto.minimum);
  }
}
