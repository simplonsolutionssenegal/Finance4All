import type { Request, Response } from 'express';

import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from '../validators/beneficiary.validator';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type { CreateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/CreateBeneficiaryUseCase';
import type { UpdateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/UpdateBeneficiaryUseCase';

export class BeneficiaryController {
  constructor(
    private readonly createUC: CreateBeneficiaryUseCase,
    private readonly updateUC: UpdateBeneficiaryUseCase,
    private readonly repo: BeneficiaryRepository
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
    const { beneficiaryId } = req.params;

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
}
