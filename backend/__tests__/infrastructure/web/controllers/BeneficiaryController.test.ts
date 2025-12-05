import type { Request, Response } from 'express';
import { BeneficiaryController } from '@/infrastructure/web/controllers/BeneficiaryController';
import type { CreateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/CreateBeneficiaryUseCase';
import type { UpdateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/UpdateBeneficiaryUseCase';
import { BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from '@/infrastructure/web/validators/beneficiary.validator';

// Mock validators
jest.mock('@/infrastructure/web/validators/beneficiary.validator', () => ({
  createBeneficiarySchema: {
    safeParse: jest.fn(),
  },
  updateBeneficiarySchema: {
    safeParse: jest.fn(),
  },
}));

describe('BeneficiaryController', () => {
  let controller: BeneficiaryController;
  let mockCreateUC: jest.Mocked<CreateBeneficiaryUseCase>;
  let mockUpdateUC: jest.Mocked<UpdateBeneficiaryUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateUC = {
      execute: jest.fn(),
    };

    mockUpdateUC = {
      execute: jest.fn(),
    };

    controller = new BeneficiaryController(mockCreateUC, mockUpdateUC);

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('validation errors', () => {
      it('should return 400 when organizationId is missing', async () => {
        mockRequest.body = {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
        };

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Paramètres manquants',
          message: 'organizationId manquant',
        });
        expect(mockCreateUC.execute).not.toHaveBeenCalled();
      });

      it('should return 400 when schema validation fails', async () => {
        mockRequest.body = {
          organizationId: 'org-123',
          firstName: '',
          lastName: 'Dupont',
          email: 'invalid-email',
        };

        (createBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: false,
          error: {
            message: 'Validation failed',
            issues: [
              {
                message: 'Le prénom est requis',
                path: ['firstName'],
              },
            ],
          },
        });

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation error',
          message: 'Le prénom est requis',
          details: [
            {
              message: 'Le prénom est requis',
              path: ['firstName'],
            },
          ],
        });
        expect(mockCreateUC.execute).not.toHaveBeenCalled();
      });

      it('should return error message when issues array is empty', async () => {
        mockRequest.body = {
          organizationId: 'org-123',
          firstName: 'Jean',
        };

        (createBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: false,
          error: {
            message: 'Invalid data',
            issues: [],
          },
        });

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation error',
          message: 'Invalid data',
          details: [],
        });
      });
    });

    describe('successful creation', () => {
      it('should create beneficiary with all fields', async () => {
        const now = new Date();
        mockRequest.body = {
          organizationId: 'org-123',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          phone: '+221771234567',
          generateTempPassword: true,
        };

        (createBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@example.com',
            phone: '+221771234567',
            generateTempPassword: true,
          },
        });

        const mockResult = {
          beneficiary: {
            id: 'ben-123',
            organizationId: 'org-123',
            clerkUserId: 'clerk-123',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@example.com',
            phone: '+221771234567',
            status: BeneficiaryStatus.ACTIVE,
            progressPercent: 0,
            createdAt: now,
            updatedAt: now,
          },
          tempPassword: 'temp123456',
        };

        mockCreateUC.execute.mockResolvedValue(mockResult);

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(createBeneficiarySchema.safeParse).toHaveBeenCalledWith(mockRequest.body);
        expect(mockCreateUC.execute).toHaveBeenCalledWith({
          organizationId: 'org-123',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          phone: '+221771234567',
          generateTempPassword: true,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          message: 'Bénéficiaire créé avec succès',
          data: mockResult.beneficiary,
          tempPassword: 'temp123456',
        });
      });

      it('should create beneficiary without phone', async () => {
        mockRequest.body = {
          organizationId: 'org-456',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie@example.com',
          generateTempPassword: false,
        };

        (createBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie@example.com',
            generateTempPassword: false,
          },
        });

        const mockResult = {
          beneficiary: {
            id: 'ben-456',
            organizationId: 'org-456',
            clerkUserId: 'clerk-456',
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie@example.com',
            phone: null,
            status: BeneficiaryStatus.ACTIVE,
            progressPercent: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          tempPassword: undefined,
        };

        mockCreateUC.execute.mockResolvedValue(mockResult);

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(mockCreateUC.execute).toHaveBeenCalledWith({
          organizationId: 'org-456',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie@example.com',
          phone: undefined,
          generateTempPassword: false,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          message: 'Bénéficiaire créé avec succès',
          data: mockResult.beneficiary,
          tempPassword: undefined,
        });
      });

      it('should default generateTempPassword to true when not provided', async () => {
        mockRequest.body = {
          organizationId: 'org-789',
          firstName: 'Paul',
          lastName: 'Diop',
          email: 'paul@example.com',
        };

        (createBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Paul',
            lastName: 'Diop',
            email: 'paul@example.com',
            // generateTempPassword not provided
          },
        });

        const mockResult = {
          beneficiary: {
            id: 'ben-789',
            organizationId: 'org-789',
            clerkUserId: 'clerk-789',
            firstName: 'Paul',
            lastName: 'Diop',
            email: 'paul@example.com',
            phone: null,
            status: BeneficiaryStatus.ACTIVE,
            progressPercent: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          tempPassword: 'auto-generated',
        };

        mockCreateUC.execute.mockResolvedValue(mockResult);

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(mockCreateUC.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            generateTempPassword: true,
          })
        );
      });
    });

    describe('error handling', () => {
      it('should return 400 when use case throws error', async () => {
        mockRequest.body = {
          organizationId: 'org-error',
          firstName: 'Error',
          lastName: 'Case',
          email: 'error@example.com',
        };

        (createBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Error',
            lastName: 'Case',
            email: 'error@example.com',
          },
        });

        mockCreateUC.execute.mockRejectedValue(new Error('User already exists'));

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Erreur lors de la création du bénéficiaire',
          message: 'User already exists',
        });
      });

      it('should handle unknown error type', async () => {
        mockRequest.body = {
          organizationId: 'org-unknown',
          firstName: 'Unknown',
          lastName: 'Error',
          email: 'unknown@example.com',
        };

        (createBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Unknown',
            lastName: 'Error',
            email: 'unknown@example.com',
          },
        });

        mockCreateUC.execute.mockRejectedValue('String error');

        await controller.create(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Erreur lors de la création du bénéficiaire',
          message: 'Erreur inconnue',
        });
      });
    });
  });

  describe('update', () => {
    describe('validation errors', () => {
      it('should return 400 when schema validation fails', async () => {
        mockRequest.params = {
          organizationId: 'org-123',
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          firstName: '',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: false,
          error: {
            message: 'Validation failed',
          },
        });

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
        });
        expect(mockUpdateUC.execute).not.toHaveBeenCalled();
      });
    });

    describe('successful update', () => {
      it('should update beneficiary with partial data', async () => {
        mockRequest.params = {
          organizationId: 'org-123',
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          firstName: 'Updated',
          lastName: 'Name',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Updated',
            lastName: 'Name',
          },
        });

        const mockUpdated = {
          id: 'ben-123',
          organizationId: 'org-123',
          clerkUserId: 'clerk-123',
          firstName: 'Updated',
          lastName: 'Name',
          email: 'test@example.com',
          phone: '+221771234567',
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 50,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        };

        mockUpdateUC.execute.mockResolvedValue(mockUpdated);

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(updateBeneficiarySchema.safeParse).toHaveBeenCalledWith(mockRequest.body);
        expect(mockUpdateUC.execute).toHaveBeenCalledWith({
          organizationId: 'org-123',
          beneficiaryId: 'ben-123',
          firstName: 'Updated',
          lastName: 'Name',
        });
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: {
            id: 'ben-123',
            firstName: 'Updated',
            lastName: 'Name',
            email: 'test@example.com',
            phone: '+221771234567',
            status: BeneficiaryStatus.ACTIVE,
            progressPercent: 50,
            createdAt: mockUpdated.createdAt,
          },
        });
      });

      it('should update only status field', async () => {
        mockRequest.params = {
          organizationId: 'org-456',
          beneficiaryId: 'ben-456',
        };
        mockRequest.body = {
          status: 'INACTIVE',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            status: 'INACTIVE',
          },
        });

        const mockUpdated = {
          id: 'ben-456',
          organizationId: 'org-456',
          clerkUserId: 'clerk-456',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: null,
          status: BeneficiaryStatus.INACTIVE,
          progressPercent: 80,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        };

        mockUpdateUC.execute.mockResolvedValue(mockUpdated);

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockUpdateUC.execute).toHaveBeenCalledWith({
          organizationId: 'org-456',
          beneficiaryId: 'ben-456',
          status: 'INACTIVE',
        });
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: expect.objectContaining({
            status: BeneficiaryStatus.INACTIVE,
          }),
        });
      });

      it('should update phone to null', async () => {
        mockRequest.params = {
          organizationId: 'org-789',
          beneficiaryId: 'ben-789',
        };
        mockRequest.body = {
          phone: null,
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            phone: null,
          },
        });

        const mockUpdated = {
          id: 'ben-789',
          organizationId: 'org-789',
          clerkUserId: 'clerk-789',
          firstName: 'No',
          lastName: 'Phone',
          email: 'nophone@example.com',
          phone: null,
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 60,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        };

        mockUpdateUC.execute.mockResolvedValue(mockUpdated);

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: expect.objectContaining({
            phone: null,
          }),
        });
      });

      it('should update all fields together', async () => {
        mockRequest.params = {
          organizationId: 'org-all',
          beneficiaryId: 'ben-all',
        };
        mockRequest.body = {
          firstName: 'All',
          lastName: 'Updated',
          phone: '+221775555555',
          status: 'INACTIVE',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'All',
            lastName: 'Updated',
            phone: '+221775555555',
            status: 'INACTIVE',
          },
        });

        const mockUpdated = {
          id: 'ben-all',
          organizationId: 'org-all',
          clerkUserId: 'clerk-all',
          firstName: 'All',
          lastName: 'Updated',
          email: 'all@example.com',
          phone: '+221775555555',
          status: BeneficiaryStatus.INACTIVE,
          progressPercent: 100,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        };

        mockUpdateUC.execute.mockResolvedValue(mockUpdated);

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockUpdateUC.execute).toHaveBeenCalledWith({
          organizationId: 'org-all',
          beneficiaryId: 'ben-all',
          firstName: 'All',
          lastName: 'Updated',
          phone: '+221775555555',
          status: 'INACTIVE',
        });
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: {
            id: 'ben-all',
            firstName: 'All',
            lastName: 'Updated',
            email: 'all@example.com',
            phone: '+221775555555',
            status: BeneficiaryStatus.INACTIVE,
            progressPercent: 100,
            createdAt: mockUpdated.createdAt,
          },
        });
      });
    });

    describe('error handling', () => {
      it('should return 400 when use case throws error', async () => {
        mockRequest.params = {
          organizationId: 'org-error',
          beneficiaryId: 'ben-error',
        };
        mockRequest.body = {
          firstName: 'Error',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Error',
          },
        });

        mockUpdateUC.execute.mockRejectedValue(new Error('Beneficiary not found'));

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Beneficiary not found',
        });
      });

      it('should handle unknown error type', async () => {
        mockRequest.params = {
          organizationId: 'org-unknown',
          beneficiaryId: 'ben-unknown',
        };
        mockRequest.body = {
          firstName: 'Unknown',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Unknown',
          },
        });

        mockUpdateUC.execute.mockRejectedValue('String error');

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Erreur update',
        });
      });

      it('should handle access denied error', async () => {
        mockRequest.params = {
          organizationId: 'org-wrong',
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          firstName: 'Denied',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Denied',
          },
        });

        mockUpdateUC.execute.mockRejectedValue(
          new Error('Accès refusé (organisation) ou bénéficiaire introuvable.')
        );

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Accès refusé (organisation) ou bénéficiaire introuvable.',
        });
      });
    });
  });
});
