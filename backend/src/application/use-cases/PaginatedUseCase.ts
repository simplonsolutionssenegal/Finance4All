import {
  validatePaginationInput,
  createPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
  type PaginatedRepository,
} from '@/utils/pagination';

/**
 * Use case générique pour la pagination
 * Peut être utilisé avec n'importe quel type d'entité et repository
 */
export class PaginatedUseCase<T> {
  constructor(private readonly repository: PaginatedRepository<T>) {}

  async execute(input: PaginationInput): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = validatePaginationInput(input);

    const { data, total } = await this.repository.findPaginated(skip, limit);

    return createPaginatedResult(data, page, limit, total);
  }
}
