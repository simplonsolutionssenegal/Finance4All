import { InstitutionFinanciereRepository } from '../../domain/repositories/InstitutionFinanciereRepository';

export class DeleteInstitutionFinanciereUseCase {
  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

  async execute(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('ID de l\'institution financière requis');
    }

    // Vérifier si l'institution existe avant de la supprimer
    const existingInstitution = await this.institutionFinanciereRepository.findById(id);
    if (!existingInstitution) {
      throw new Error('Institution financière non trouvée');
    }

    const deleted = await this.institutionFinanciereRepository.delete(id);

    if (!deleted) {
      throw new Error('Erreur lors de la suppression de l\'institution financière');
    }

    return deleted;
  }
}
