import type { Request, Response, NextFunction } from 'express';
import type { CreateModuleUseCase } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { GetModulesUseCase } from '@/domain/formations/ports/in/GetModulesUseCase';
import {
  DomainException,
  DuplicateTitleException,
  ValidationException,
} from '@/domain/shared/exceptions/FormationDomainException';
import type { GetModuleByIdUseCase } from '@/domain/formations/ports/in/GetModuleByIdUseCase';
import type { AddLessonUseCase } from '@/domain/formations/ports/in/AddLessonUseCase';
import type { AddQuizUseCase } from '@/domain/formations/ports/in/AddQuizUseCase';

export class ModuleController {
  constructor(
    private readonly createModuleUseCase: CreateModuleUseCase,
    private readonly getModulesUseCase: GetModulesUseCase,
    private readonly getModuleByIdUseCase: GetModuleByIdUseCase,
    private readonly addLessonUseCase: AddLessonUseCase,
    private readonly addQuizUseCase: AddQuizUseCase
  ) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const dto = req.body;
      const result = await this.createModuleUseCase.execute(dto);

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Module créé avec succès',
      });
    } catch (error) {
      // Gestion des erreurs métier
      if (error instanceof DuplicateTitleException) {
        return res.status(409).json({
          success: false,
          error: 'DUPLICATE_TITLE',
          message: error.message,
        });
      }

      if (error instanceof ValidationException) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.message,
        });
      }

      if (error instanceof DomainException) {
        return res.status(400).json({
          success: false,
          error: 'DOMAIN_ERROR',
          message: error.message,
        });
      }

      // Erreur inattendue
      console.error('Unexpected error in create module:', error);
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue lors de la création du module',
      });
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.getModulesUseCase.execute({ page, limit });
      res.status(200).json({
        success: true,
        ...result,
        message: 'Modules récupérés avec succès',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.getModuleByIdUseCase.execute({ id });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.addLessonUseCase.execute({
        moduleId: id,
        ...req.body,
        duration: Number(req.body.duration),
        order: Number(req.body.order ?? 0),
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await this.addQuizUseCase.execute({
        moduleId: id,
        ...req.body,
        scoreMinimum: Number(req.body.scoreMinimum),
        nombreTentatives: Number(req.body.nombreTentatives ?? 3),
        duree:
          req.body.duree === undefined || req.body.duree === null
            ? undefined
            : Number(req.body.duree),
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }
}
