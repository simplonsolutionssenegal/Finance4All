import { UserRepository, UserSearchParams, PaginatedUsersResult } from '../../domain/repositories/UserRepository';

export class SearchUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params: UserSearchParams): Promise<PaginatedUsersResult> {
    // Validation des paramètres
    const validatedParams = this.validateParams(params);
    
    return await this.userRepository.searchUsers(validatedParams);
  }

  private validateParams(params: UserSearchParams): UserSearchParams {
    const { page = 1, limit = 10, sortBy = 'firstName', sortOrder = 'asc' } = params;

    // Validation de la pagination
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items par page

    // Validation du tri
    const validSortFields = ['username', 'firstName', 'lastName', 'email', 'createdAt'];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : 'firstName';
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
