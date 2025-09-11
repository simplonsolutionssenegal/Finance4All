import { OrganizationRepository } from '@/domain/repositories/OrganizationRepository';

/**
 * Use case for retrieving all organizations.
 */

export class GetAllOrganizationsUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}
  
  async execute() {
    return this.organizationRepository.getAllOrganizations();
  }
}