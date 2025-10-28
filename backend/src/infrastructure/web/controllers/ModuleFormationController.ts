import type { Request, Response, NextFunction } from 'express';
import type { CreateModuleUseCase } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { GetModulesUseCase } from '@/domain/formations/ports/in/GetModulesUseCase';

export class ModuleController {
  constructor(
    private readonly createModuleUseCase: CreateModuleUseCase,
    private readonly getModulesUseCase: GetModulesUseCase
  ) {}

  /**
   * POST /modules
   * Créer un nouveau module de formation
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const moduleData = req.body;
      const result = await this.createModuleUseCase.execute(moduleData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Module créé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /modules
   * Récupérer la liste de tous les modules
   */
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getModulesUseCase.execute();
      res.status(200).json({
        success: true,
        data: result,
        message: 'Modules récupérés avec succès',
      });
    } catch (error) {
      next(error);
    }
  };
}
