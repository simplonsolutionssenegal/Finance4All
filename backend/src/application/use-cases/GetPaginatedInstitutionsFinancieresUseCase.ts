import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';
import { PaginatedUseCase } from './PaginatedUseCase';
import { PaginationInput, PaginatedResult, PaginatedRepository } from '@/utils/pagination';

export type PaginatedInstitutionsResult = PaginatedResult<InstitutionFinanciere>;

// Extension du repository spécifique avec les capacités de pagination
type PaginatedInstitutionRepository = InstitutionFinanciereRepository &
  PaginatedRepository<InstitutionFinanciere>;

export class GetPaginatedInstitutionsFinancieresUseCase extends PaginatedUseCase<InstitutionFinanciere> {
  constructor(private readonly institutionFinanciereRepository: PaginatedInstitutionRepository) {
    super(institutionFinanciereRepository);
  }

  async execute(input: PaginationInput): Promise<PaginatedInstitutionsResult> {
    return super.execute(input);
  }
}
