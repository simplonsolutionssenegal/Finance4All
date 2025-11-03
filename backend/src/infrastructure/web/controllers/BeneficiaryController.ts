import type { Request, Response, NextFunction } from 'express';
import type { CreateBeneficiaryUseCase } from '@/domain/use-cases/CreateBeneficiaryUseCase';
import { logger } from '@/infrastructure/utils/logger';

export class BeneficiaryController {
  constructor(private readonly createBeneficiaryUseCase: CreateBeneficiaryUseCase) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clerkUserId, name, email, phoneNumber } = req.body as {
        clerkUserId: string;
        name: string;
        email: string;
        phoneNumber: string;
      };

      logger.info('Tentative de création de bénéficiaire', { email, clerkUserId });

      const beneficiary = await this.createBeneficiaryUseCase.execute(
        clerkUserId,
        name,
        email,
        phoneNumber
      );

      logger.info('Bénéficiaire créé avec succès', { userId: beneficiary.id, email });

      res.status(201).json({
        success: true,
        data: {
          id: beneficiary.id,
          name: beneficiary.name,
          email: beneficiary.email,
          phoneNumber: beneficiary.phoneNumber,
          role: beneficiary.role,
        },
        message: 'Bénéficiaire créé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
}
