import type { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import type { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError';

export class GetInstitutionFinanciereByIdUseCase {
  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

  async execute(id: string): Promise<InstitutionFinanciere> {
    const institution = await this.institutionFinanciereRepository.findById(id);
    if (!institution) {
      throw new InstitutionNotFoundError(id);
    }
    return institution;
  }
}
