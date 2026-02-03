import type { NextFunction, Request, Response } from 'express';

import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from '../validators/beneficiary.validator';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type { CreateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/CreateBeneficiaryUseCase';
import type { UpdateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/UpdateBeneficiaryUseCase';
import type { GetBeneficiariesAssignmentSummaryUseCaseImpl } from '@/application/formations/use-cases/GetBeneficiariesAssignmentSummaryUsecase';
import type { GetModulesForBeneficiaryUseCaseImpl } from '@/application/formations/use-cases/GetModulesForBeneficiaryUsecase';
import type { AssignModulesToBeneficiaryUseCaseImpl } from '@/application/formations/use-cases/AssignModulesToBeneficiaryUsecase';
export class BeneficiaryController {
  [x: string]: any;
  constructor(
    private readonly createUC: CreateBeneficiaryUseCase,
    private readonly updateUC: UpdateBeneficiaryUseCase,
    private readonly repo: BeneficiaryRepository,
    private readonly getAssignmentSummaryUseCase: GetBeneficiariesAssignmentSummaryUseCaseImpl,
    private readonly getModulesForBeneficiaryUseCase: GetModulesForBeneficiaryUseCaseImpl,
    private readonly assignModulesUseCase: AssignModulesToBeneficiaryUseCaseImpl
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.query.organizationId as string | undefined;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'organizationId manquant',
        });
        return;
      }
      const beneficiaries = await this.repo.findByOrgId(organizationId);

      res.json({
        success: true,
        data: beneficiaries.map(b => ({
          id: b.id,
          clerkUserId: b.clerkUserId,
          firstName: b.firstName,
          lastName: b.lastName,
          email: b.email,
          phone: b.phone,
          status: b.status,
          progressPercent: b.progressPercent,
          createdAt: b.createdAt,
        })),
      });
    } catch (error: unknown) {
      console.error('  - Erreur:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur serveur',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const { organizationId } = req.body as { organizationId?: string };

    try {
      if (!organizationId) {
        res.status(400).json({
          success: false,
          error: 'Paramètres manquants',
          message: 'organizationId manquant',
        });
        return;
      }

      const parsed = createBeneficiarySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: parsed.error.issues?.[0]?.message ?? parsed.error.message,
          details: parsed.error.issues ?? [],
        });
        return;
      }

      const result = await this.createUC.execute({
        organizationId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        generateTempPassword: parsed.data.generateTempPassword ?? true,
      });

      res.status(201).json({
        success: true,
        message: 'Bénéficiaire créé avec succès',
        data: result.beneficiary,
        tempPassword: result.tempPassword,
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: 'Erreur lors de la création du bénéficiaire',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  async update(req: Request, res: Response) {
    const beneficiaryId = req.params.beneficiaryId as string;

    const parsed = updateBeneficiarySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.message });
    }

    const { organizationId, firstName, lastName, phone, status } = parsed.data;
    if (!organizationId) {
      return res.status(400).json({ success: false, message: 'organizationId manquant' });
    }

    try {
      const updated = await this.updateUC.execute({
        organizationId,
        beneficiaryId,
        firstName,
        lastName,
        phone,
        status,
      });

      return res.json({
        success: true,
        data: {
          id: updated.id,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          phone: updated.phone,
          status: updated.status,
          progressPercent: updated.progressPercent,
          createdAt: updated.createdAt,
        },
      });
    } catch (e: unknown) {
      return res
        .status(400)
        .json({ success: false, message: e instanceof Error ? e.message : 'Erreur update' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const beneficiaryId = req.params.beneficiaryId as string;

    const organizationId = String(
      (req.body?.organizationId ?? req.query?.organizationId ?? '') || ''
    ).trim();

    if (!beneficiaryId) {
      res.status(400).json({ success: false, message: 'beneficiaryId manquant' });
      return;
    }

    if (!organizationId) {
      res.status(400).json({ success: false, message: 'organizationId manquant' });
      return;
    }

    try {
      const deleted = await this.repo.deleteByIdAndOrgId(beneficiaryId, organizationId);

      if (!deleted) {
        res
          .status(404)
          .json({ success: false, message: 'Bénéficiaire introuvable pour cette organisation' });
        return;
      }

      // pas de contenu, juste 204
      res.status(204).send();
    } catch (error: unknown) {
      console.error('Erreur suppression bénéficiaire', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur serveur',
      });
    }
  }
  // ✅ GET /beneficiaries/assignments/summary
  async assignmentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = String(req.query.organizationId ?? '').trim();
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'organizationId manquant' });
      }

      const data = await this.getAssignmentSummaryUseCase.execute({ organizationId });
      return res.status(200).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
  // ✅ GET /beneficiaries/:beneficiaryId/modules
  async modulesForBeneficiary(req: Request, res: Response, next: NextFunction) {
    try {
      const beneficiaryId = req.params.beneficiaryId;

      const organizationId = String(req.query.organizationId ?? '').trim();
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'organizationId manquant' });
      }

      const data = await this.getModulesForBeneficiaryUseCase.execute({
        beneficiaryId,
        organizationId,
      });

      return res.status(200).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  // ✅ POST /beneficiaries/:beneficiaryId/assignments
  async assignModules(req: Request, res: Response, next: NextFunction) {
    try {
      const beneficiaryId = req.params.beneficiaryId;

      const organizationId = String(req.body?.organizationId ?? '').trim();
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'organizationId manquant' });
      }

      const moduleIds = req.body?.moduleIds ?? [];

      const result = await this.assignModulesUseCase.execute({
        beneficiaryId,
        organizationId,
        moduleIds,
      });

      return res.status(200).json({ success: true, data: result, message: 'Modules assignés' });
    } catch (e) {
      next(e);
    }
  }

  // ✅ DELETE /beneficiaries/:beneficiaryId/assignments
  async removeModules(req: Request, res: Response, next: NextFunction) {
    try {
      const beneficiaryId = req.params.beneficiaryId;

      const organizationId = String(req.body?.organizationId ?? '').trim();
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'organizationId manquant' });
      }

      const moduleIds = req.body?.moduleIds ?? [];

      const result = await this.RemoveModulesFromBeneficiaryUseCaseImpl.execute({
        beneficiaryId,
        organizationId,
        moduleIds,
      });

      return res.status(200).json({ success: true, data: result, message: 'Modules retirés' });
    } catch (e) {
      next(e);
    }
  }
}
