import { Request, Response } from 'express';
import { GetAllOrganizationsUseCase } from '../../../application/use-cases/GetAllOrganizationsUseCase';
import { SearchOrganizationsUseCase } from '../../../application/use-cases/SearchOrganizationsUseCase';
import { GetOrganizationTypesUseCase } from '../../../application/use-cases/GetOrganizationTypesUseCase';
import { OrganizationSearchParamsSchema } from '../schemas/organization.schemas';
import { logger } from '../../../utils/logger';

export class OrganizationController {
  constructor(
    private readonly getAllOrganizationsUseCase: GetAllOrganizationsUseCase,
    private readonly searchOrganizationsUseCase: SearchOrganizationsUseCase,
    private readonly getOrganizationTypesUseCase: GetOrganizationTypesUseCase,
  ) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const organizations = await this.getAllOrganizationsUseCase.execute();
      res.status(200).json(organizations);
    } catch (error) {
      logger.error('Error fetching all organizations', { error });
      res.status(500).json({
        error: 'Erreur lors de la récupération des organisations',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      // Validation des paramètres de recherche
      const validationResult = OrganizationSearchParamsSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Paramètres de recherche invalides',
          details: validationResult.error.issues,
        });
        return;
      }

      const searchParams = validationResult.data;
      logger.info('Searching organizations with params', { searchParams });

      const result = await this.searchOrganizationsUseCase.execute(searchParams);
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error searching organizations', { error, query: req.query });
      res.status(500).json({
        error: 'Erreur lors de la recherche des organisations',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  async getTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await this.getOrganizationTypesUseCase.execute();
      res.status(200).json(types);
    } catch (error) {
      logger.error('Error fetching organization types', { error });
      res.status(500).json({
        error: 'Erreur lors de la récupération des types d\'organisations',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
