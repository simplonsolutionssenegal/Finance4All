import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';

interface PaginationInput {
  page?: number; // 1-based
  limit?: number; // items per page
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedInstitutionsResult {
  data: InstitutionFinanciere[];
  meta: PaginationMeta;
}

// On étend le repo avec la méthode réellement utilisée, sans `any`.
type PaginatedRepo = InstitutionFinanciereRepository & {
  findPaginated(
    skip: number,
    limit: number
  ): Promise<{ data: InstitutionFinanciere[]; total: number }>;
};

export class GetPaginatedInstitutionsFinancieresUseCase {
  constructor(
    private readonly institutionFinanciereRepository: PaginatedRepo,
  ) {}

  async execute(input: PaginationInput): Promise<PaginatedInstitutionsResult> {
    const page = !input.page || input.page < 1 ? 1 : input.page;
    const limit = !input.limit || input.limit < 1 || input.limit > 100 ? 10 : input.limit;
    const skip = (page - 1) * limit;

    const { data, total } = await this.institutionFinanciereRepository.findPaginated(skip, limit);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
