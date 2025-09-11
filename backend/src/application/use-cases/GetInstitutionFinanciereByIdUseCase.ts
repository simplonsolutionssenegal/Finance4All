import { InstitutionFinanciere } from '../../domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '../../domain/repositories/InstitutionFinanciereRepository';

export class GetInstitutionFinanciereByIdUseCase {
  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

  async execute(id: string): Promise<InstitutionFinanciere | null> {
    if (!id) {
      throw new Error('ID de l\'institution financière requis');
    }

    const institution = await this.institutionFinanciereRepository.findById(id);

    if (!institution) {
      throw new Error('Institution financière non trouvée');
    }

    return institution;
  }
}
