import type {
  GetServicesUseCase,
  GetServicesQuery,
} from '@/domain/institutions/ports/in/GetServicesUseCase';
import type { ServiceRepository } from '@/domain/institutions/ports/out/ServiceRepository';
import type { PaginatedResult } from '@/domain/shared/Pagination';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';

export class GetServicesUseCaseImpl implements GetServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(query: GetServicesQuery): Promise<PaginatedResult<ComparedServiceDTO>> {
    // Récupérer tous les services paginés avec leurs institutions
    // Passer directement le query au repository pour que le filtrage
    // soit effectué côté base de données (meilleure performance)
    const servicesResult = await this.serviceRepository.findAll(query as any);

    return {
      data: servicesResult.data,
      pagination: servicesResult.pagination,
    };
  }
}
