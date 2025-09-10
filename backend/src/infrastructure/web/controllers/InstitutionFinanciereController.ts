import { Request, Response } from 'express';
import { CreateInstitutionFinanciereUseCase } from '../../../application/use-cases/CreateInstitutionFinanciereUseCase';
import { GetAllInstitutionsFinancieresUseCase } from '../../../application/use-cases/GetAllInstitutionsFinancieresUseCase';
import { GetInstitutionFinanciereByIdUseCase } from '../../../application/use-cases/GetInstitutionFinanciereByIdUseCase';
import { DeleteInstitutionFinanciereUseCase } from '../../../application/use-cases/DeleteInstitutionFinanciereUseCase';
import { InstitutionFinanciere } from '../../../domain/entities/InstitutionFinanciere';

export class InstitutionFinanciereController {
  constructor(
    private readonly createInstitutionFinanciereUseCase: CreateInstitutionFinanciereUseCase,
  private readonly getAllInstitutionsFinancieresUseCase: GetAllInstitutionsFinancieresUseCase,
  private readonly getInstitutionFinanciereByIdUseCase?: GetInstitutionFinanciereByIdUseCase,
  private readonly deleteInstitutionFinanciereUseCase?: DeleteInstitutionFinanciereUseCase,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const institutionData = req.body as InstitutionFinanciere;
      const newInstitution = await this.createInstitutionFinanciereUseCase.execute(institutionData);

      res.status(201).json({
        success: true,
        data: newInstitution,
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
      if (error instanceof Error && error.message === 'Institution financière non trouvée') {
        res.status(404).json({
          success: false,
          message: 'Institution financière non trouvée',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération de l\'institution financière',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!this.deleteInstitutionFinanciereUseCase) {
        throw new Error('Use case not initialized');
      }

      await this.deleteInstitutionFinanciereUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Institution financière supprimée avec succès',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution financière non trouvée') {
        res.status(404).json({
          success: false,
          message: 'Institution financière non trouvée',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression de l\'institution financière',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }
  }
}
