// import type {
//   AddServiceCommand,
//   AddServiceUseCase,
//   FraisDTO,
// } from '@/domain/institutions/ports/in/AddServiceUseCase';
// import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
// import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
// import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
// import { Service, TypeCalculation } from '@/domain/institutions/entities/Service';
// import { EntityId } from '@/domain/shared/EntityId';
// import {
//   FraisGratuit,
//   FraisFixes,
//   FraisPourcentage,
//   type Frais,
// } from '@/domain/institutions/entities/Frais';

// export class AddServiceUseCaseImpl implements AddServiceUseCase {
//   constructor(private readonly institutionRepository: InstitutionRepository) {}

//   async execute(command: AddServiceCommand): Promise<InstitutionDTO> {
//     const existingInstitution = await this.institutionRepository.findById(command.idInstitution);

//     if (!existingInstitution) {
//       throw new NotFoundError(`Institution with id ${command.idInstitution} not found`);
//     }

//     const frais = this.mapFraisFromDTO(command.frais, command.typeFrais);

//     const service = new Service({
//       id: EntityId.generate(),
//       name: command.name,
//       longName: command.longName,
//       type: command.type,
//       montantMin: command.montantMin,
//       montantMax: command.montantMax,
//       typeFrais: command.typeFrais,
//       frais,
//       conditionAccess: command.conditionAccess,
//       plafonds: command.plafonds,
//       infrastructureAccess: command.infrastructureAccess,
//     });

//     existingInstitution.addService(service);

//     const savedInstitution = await this.institutionRepository.update(existingInstitution);

//     return savedInstitution.toDTO();
//   }

//   private mapFraisFromDTO(fraisDTO: FraisDTO, typeCalculation: TypeCalculation): Frais {
//     // Utiliser le typeCalculation pour déterminer le type de frais
//     switch (typeCalculation) {
//       case TypeCalculation.FREE:
//         return new FraisGratuit();

//       case TypeCalculation.FIX:
//         // Si on a un montant fixe et éventuellement un pourcentage
//         if (fraisDTO.montantFixe !== undefined && fraisDTO.montantFixe > 0) {
//           const rate = fraisDTO.pourcentage ? fraisDTO.pourcentage / 100 : undefined;
//           return new FraisFixes(fraisDTO.montantFixe, rate);
//         }
//         throw new Error('Le montant fixe est requis pour les frais fixes');

//       case TypeCalculation.POURCENTAGE:
//         // Si on a un pourcentage avec ou sans plafonds
//         if (fraisDTO.pourcentage !== undefined && fraisDTO.pourcentage > 0) {
//           const rate = fraisDTO.pourcentage / 100;
//           return new FraisPourcentage(rate, fraisDTO.maximum, fraisDTO.minimum);
//         }
//         throw new Error('Le pourcentage est requis pour les frais en pourcentage');

//       default:
//         // Par défaut, gratuit
//         return new FraisGratuit();
//     }
//   }
// }

import type {
  AddServiceCommand,
  AddServiceUseCase,
  FraisDTO,
} from '@/domain/institutions/ports/in/AddServiceUseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { Service } from '@/domain/institutions/entities/Service';
import { EntityId } from '@/domain/shared/EntityId';
import {
  FraisGratuit,
  FraisFixes,
  FraisPourcentage,
  type Frais,
} from '@/domain/institutions/entities/Frais';

export class AddServiceUseCaseImpl implements AddServiceUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(command: AddServiceCommand): Promise<InstitutionDTO> {
    const existingInstitution = await this.institutionRepository.findById(command.idInstitution);

    if (!existingInstitution) {
      throw new NotFoundError(`Institution with id ${command.idInstitution} not found`);
    }

    const frais = this.mapFraisFromDTO(command.frais);

    const service = new Service({
      id: EntityId.generate(),
      name: command.name,
      longName: command.longName,
      type: command.type,
      montantMin: command.montantMin,
      montantMax: command.montantMax,
      frais,
      conditionAccess: command.conditionAccess,
      plafonds: command.plafonds,
      infrastructureAccess: command.infrastructureAccess,
    });

    existingInstitution.addService(service);

    const savedInstitution = await this.institutionRepository.update(existingInstitution);

    return savedInstitution.toDTO();
  }

  private mapFraisFromDTO(fraisDTO: FraisDTO): Frais {
    // Si on a un montant fixe et éventuellement un pourcentage
    if (fraisDTO.montantFixe !== undefined && fraisDTO.montantFixe > 0) {
      const rate = fraisDTO.pourcentage ? fraisDTO.pourcentage / 100 : undefined;
      return new FraisFixes(fraisDTO.montantFixe, rate);
    }

    if (fraisDTO.fraisChange !== undefined && fraisDTO.fraisChange > 0) {
      return new FraisFixes(0, undefined, fraisDTO.fraisChange, fraisDTO.devise);
    }
    // Si on a un pourcentage avec ou sans plafonds
    if (fraisDTO.pourcentage !== undefined && fraisDTO.pourcentage > 0) {
      const rate = fraisDTO.pourcentage / 100;
      return new FraisPourcentage(rate, fraisDTO.maximum, fraisDTO.minimum);
    }

    // Par défaut, gratuit
    return new FraisGratuit();
  }
}
