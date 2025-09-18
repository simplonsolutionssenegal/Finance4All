import { Request, Response } from 'express';
import { CreateInstitutionFinanciereUseCase } from '@/application/use-cases/CreateInstitutionFinanciereUseCase';
import { GetAllInstitutionsFinancieresUseCase } from '@/application/use-cases/GetAllInstitutionsFinancieresUseCase';
import { GetPaginatedInstitutionsFinancieresUseCase } from '@/application/use-cases/GetPaginatedInstitutionsFinancieresUseCase';
import { GetInstitutionFinanciereByIdUseCase } from '@/application/use-cases/GetInstitutionFinanciereByIdUseCase';
import { DeleteInstitutionFinanciereUseCase } from '@/application/use-cases/DeleteInstitutionFinanciereUseCase';
import { CreateInstitutionFinanciereDTO } from '@/application/dto/CreateInstitutionFinanciereDTO';
import { InstitutionFinancierePresenter } from '@/infrastructure/web/presenters/InstitutionFinancierePresenter';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError';

export class InstitutionFinanciereController {
  constructor(
    private readonly createInstitutionFinanciereUseCase: CreateInstitutionFinanciereUseCase,
    private readonly getAllInstitutionsFinancieresUseCase: GetAllInstitutionsFinancieresUseCase,
    private readonly getPaginatedInstitutionsFinancieresUseCase?: GetPaginatedInstitutionsFinancieresUseCase,
    private readonly getInstitutionFinanciereByIdUseCase?: GetInstitutionFinanciereByIdUseCase,
    private readonly deleteInstitutionFinanciereUseCase?: DeleteInstitutionFinanciereUseCase,
  ) { }

  async create(req: Request, res: Response): Promise<void> {
    try {
      // Log des données reçues
      console.warn('[DEBUG] Données reçues pour création institution:', JSON.stringify(req.body, null, 2));
      const dto: CreateInstitutionFinanciereDTO = req.body as CreateInstitutionFinanciereDTO; // Explicitly cast to DTO type
      const newInstitution = await this.createInstitutionFinanciereUseCase.execute(dto); // Use case expects validated DTO
      const response = InstitutionFinancierePresenter.toResponse(newInstitution);
      res.status(201).json({ success: true, data: response, message: 'Institution financière créée avec succès' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur',
        });
      }
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const pageParam = req.query.page as string | undefined;
      const limitParam = req.query.limit as string | undefined;
      const page = pageParam ? parseInt(pageParam, 10) : undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;

      if (this.getPaginatedInstitutionsFinancieresUseCase && (pageParam !== undefined || limitParam !== undefined)) {
        const result = await this.getPaginatedInstitutionsFinancieresUseCase.execute({ page, limit });
        res.status(200).json({
          success: true,
          ...result,
          message: 'Institutions financières récupérées avec succès (pagination)',
        });
        return;
      }

      const institutions = await this.getAllInstitutionsFinancieresUseCase.execute();
      res.status(200).json({
        success: true,
        data: institutions,
        message: 'Institutions financières récupérées avec succès',
        count: institutions.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des institutions financières',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!this.getInstitutionFinanciereByIdUseCase) {
        throw new Error('Use case not initialized');
      }

      const institution = await this.getInstitutionFinanciereByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: institution,
        message: 'Institution financière récupérée avec succès',
      });
    } catch (error) {
      if (error instanceof InstitutionNotFoundError) {
        res.status(404).json({
          success: false,
          message: 'Institution financière non trouvée',
        });
      } else if (error instanceof Error) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération de l\'institution financière',
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération de l\'institution financière',
          error: 'Erreur inconnue',
        });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || !id.trim()) {
        res.status(400).json({
          success: false,
          message: 'Identifiant manquant',
        });
        return;
      }

      if (!this.deleteInstitutionFinanciereUseCase) {
        throw new Error('Use case not initialized');
      }

      await this.deleteInstitutionFinanciereUseCase.execute(id.trim());

     res.status(204).json({ success: true, message: 'Institution financière supprimée avec succès', });
    } catch (error) {
      // 404 attendu par le test quand l’institution n’existe pas
      if (error instanceof InstitutionNotFoundError) {
        res.status(404).json({
          success: false,
          message: 'Institution financière non trouvée',
        });
        return;
      }

      // Autres erreurs => 500
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'institution financière",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
