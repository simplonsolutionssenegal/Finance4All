import type { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError';

export class DeleteInstitutionFinanciereUseCase {
  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

  async execute(id: string): Promise<boolean> {
    // Vérifier si l'institution existe avant de la supprimer
    const existingInstitution = await this.institutionFinanciereRepository.findById(id);
    if (!existingInstitution) {
      throw new InstitutionNotFoundError(id);
    }

    const deleted = await this.institutionFinanciereRepository.delete(id);

    if (!deleted) {
      throw new Error('Erreur lors de la suppression de l\'institution financière');
    }

    return deleted;
  }
}
