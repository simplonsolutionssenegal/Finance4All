import { GetAllOrganizationsUseCase } from '@/application/use-cases/GetAllOrganizationsUseCase';
import { OrganizationRepository } from '../repositories/OrganizationRepository';

/**
 * Implémentation concrète du cas d'utilisation de création d'Organization
 */
export class GetAllOrganizationsUseCaseImpl implements GetAllOrganizationsUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute() {
    return this.organizationRepository.getAllOrganizations();
  }
}
