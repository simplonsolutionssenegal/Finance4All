import type { Request, Response } from 'express';
import type { CreateInstitutionFinanciereUseCase } from '@/application/use-cases/CreateInstitutionFinanciereUseCase';
import type { GetAllInstitutionsFinancieresUseCase } from '@/application/use-cases/GetAllInstitutionsFinancieresUseCase';
import type { GetPaginatedInstitutionsFinancieresUseCase } from '@/application/use-cases/GetPaginatedInstitutionsFinancieresUseCase';
import type { GetInstitutionFinanciereByIdUseCase } from '@/application/use-cases/GetInstitutionFinanciereByIdUseCase';
import type { DeleteInstitutionFinanciereUseCase } from '@/application/use-cases/DeleteInstitutionFinanciereUseCase';
import type { CreateInstitutionFinanciereDTO } from '@/application/dto/CreateInstitutionFinanciereDTO';
import { InstitutionFinancierePresenter } from '@/infrastructure/web/presenters/InstitutionFinancierePresenter';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError';
import { handlePaginationRequest } from '@/utils/controller-pagination';

export class InstitutionFinanciereController {
  constructor(
    private readonly createInstitutionFinanciereUseCase: CreateInstitutionFinanciereUseCase,
    private readonly getAllInstitutionsFinancieresUseCase: GetAllInstitutionsFinancieresUseCase,
    private readonly getPaginatedInstitutionsFinancieresUseCase?: GetPaginatedInstitutionsFinancieresUseCase,
    private readonly getInstitutionFinanciereByIdUseCase?: GetInstitutionFinanciereByIdUseCase,
    private readonly deleteInstitutionFinanciereUseCase?: DeleteInstitutionFinanciereUseCase,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateInstitutionFinanciereDTO = req.body as CreateInstitutionFinanciereDTO;
      const newInstitution = await this.createInstitutionFinanciereUseCase.execute(dto);
      const response = InstitutionFinancierePresenter.toResponse(newInstitution);

      res.status(201).json({
        success: true,
        data: response,
        message: 'Institution financière créée avec succès',
      });
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
      const pagination = handlePaginationRequest(req);

      // Utiliser la pagination si des paramètres sont fournis et que le use case est disponible
      if (pagination.hasPagination && this.getPaginatedInstitutionsFinancieresUseCase?.execute) {
        const result = await this.getPaginatedInstitutionsFinancieresUseCase.execute(
          pagination.input,
        );
        res.status(200).json({
          success: true,
          ...result,
          message: 'Institutions financières récupérées avec succès (pagination)',
        });
        return;
      }

      // Sinon, récupérer toutes les institutions
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

      if (!this.deleteInstitutionFinanciereUseCase) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression de l\'institution financière',
          error: 'Use case not initialized',
        });
        return;
      }

      await this.deleteInstitutionFinanciereUseCase.execute(id);

      // Le test attend: status 204 + body JSON
      res.status(204).json({
        success: true,
        message: 'Institution financière supprimée avec succès',
      });
    } catch (error) {
      if (error instanceof InstitutionNotFoundError) {
        res.status(404).json({
          success: false,
          message: 'Institution financière non trouvée',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'institution financière',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
