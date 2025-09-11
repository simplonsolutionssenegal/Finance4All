import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';

export class GetOrganizationTypesUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(): Promise<string[]> {
    return await this.organizationRepository.getOrganizationTypes();
  }
}
