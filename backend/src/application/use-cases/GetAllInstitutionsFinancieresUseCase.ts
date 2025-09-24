import type { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import type { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';

export class GetAllInstitutionsFinancieresUseCase {
  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

  async execute(): Promise<InstitutionFinanciere[]> {
    return this.institutionFinanciereRepository.findAll();
  }
}
