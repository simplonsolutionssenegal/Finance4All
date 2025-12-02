// application/institutions/usecases/CompareServicesUseCaseImpl.ts
import type {
  CompareServicesUseCase,
  CompareServicesQuery,
} from '@/domain/institutions/ports/in/CompareServicesUseCase';
import type { ServiceRepository } from '@/domain/institutions/ports/out/ServiceRepository';
import { ServiceComparisonError } from '@/domain/institutions/errors/ServiceComparisonError';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';

export class CompareServicesUseCaseImpl implements CompareServicesUseCase {
  constructor(private readonly serviceReadRepo: ServiceRepository) {}

  async execute(query: CompareServicesQuery): Promise<ComparedServiceDTO[]> {
    const { ids } = query;

    // 🔹 Validation: au moins 2 services
    if (!ids || ids.length < 2) {
      throw new ServiceComparisonError(
        'Vous devez sélectionner au moins 2 services pour effectuer une comparaison'
      );
    }

    // 🔹 Validation: maximum 5 services
    if (ids.length > 3) {
      throw new ServiceComparisonError('Vous ne pouvez pas comparer plus de 3 services à la fois');
    }

    // 🔹 Récupérer les services
    const services = await this.serviceReadRepo.findForComparison(ids);

    // 🔹 Vérifier que tous les services existent
    if (services.length === 0) {
      throw new ServiceComparisonError('Aucun service trouvé avec les IDs fournis');
    }

    if (services.length !== ids.length) {
      const foundIds = services.map(s => s.id);
      const missingIds = ids.filter(id => !foundIds.includes(id));
      throw new ServiceComparisonError(
        `Les services suivants n'existent pas : ${missingIds.join(', ')}`
      );
    }

    // 🔹 VALIDATION IMPORTANTE: tous les services doivent être du même type
    const firstServiceType = services[0].type;
    const allSameType = services.every(service => service.type === firstServiceType);

    if (!allSameType) {
      const types = [...new Set(services.map(s => s.type))];
      throw new ServiceComparisonError(
        `Impossible de comparer des services de types différents. Types détectés : ${types.join(', ')}. Veuillez sélectionner uniquement des services du même type.`
      );
    }

    // 🔹 Retourner les services validés
    return services;
  }
}
