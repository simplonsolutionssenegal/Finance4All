import { OrganizationRepository, OrganizationSearchParams, PaginatedOrganizationsResult } from '../../domain/repositories/OrganizationRepository';

export class SearchOrganizationsUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(params: OrganizationSearchParams): Promise<PaginatedOrganizationsResult> {
    // Validation des paramètres
    const validatedParams = this.validateParams(params);
    
    return await this.organizationRepository.searchOrganizations(validatedParams);
  }

  private validateParams(params: OrganizationSearchParams): OrganizationSearchParams {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = params;

    // Validation de la pagination
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items par page

    // Validation du tri
    const validSortFields = ['name', 'type', 'createdAt'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const validatedSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc';

    return {
      ...params,
      page: validatedPage,
      limit: validatedLimit,
      sortBy: validatedSortBy,
      sortOrder: validatedSortOrder,
    };
  }
}
