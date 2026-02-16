import type { Request, Response } from 'express';
import { BeneficiaryController } from '@/infrastructure/web/controllers/BeneficiaryController';
import type { CreateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/CreateBeneficiaryUseCase';
import type { UpdateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/UpdateBeneficiaryUseCase';
import type { GetBeneficiaireDashboardUseCase } from '@/domain/Beneficiary/ports/in/GetBeneficiaireDashboardUseCase';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
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
  let mockGetDashboardUC: jest.Mocked<GetBeneficiaireDashboardUseCase>;
  let mockRepo: jest.Mocked<BeneficiaryRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateUC = {
      execute: jest.fn(),
    };

    mockUpdateUC = {
      execute: jest.fn(),
    };

    mockGetDashboardUC = {
      execute: jest.fn(),
    };

    mockRepo = {
      findByClerkUserId: jest.fn(),
      findByOrgId: jest.fn(),
      findByOrgAndEmail: jest.fn(),
      findByIdInOrg: jest.fn(),
      create: jest.fn(),
      updateInOrg: jest.fn(),
      deleteByIdAndOrgId: jest.fn(),
    } as any;

    controller = new BeneficiaryController(
      mockCreateUC,
      mockUpdateUC,
      mockGetDashboardUC,
      mockRepo
    );

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

  describe('list', () => {
    beforeEach(() => {
      mockRequest.query = {};
    });

    describe('validation errors', () => {
      it('should return 400 when organizationId is missing', async () => {
        mockRequest.query = {};

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'organizationId manquant',
        });
        expect(mockRepo.findByOrgId).not.toHaveBeenCalled();
      });

      it('should return 400 when organizationId is undefined', async () => {
        mockRequest.query = { organizationId: undefined };

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'organizationId manquant',
        });
        expect(mockRepo.findByOrgId).not.toHaveBeenCalled();
      });

      it('should return 400 when organizationId is empty string', async () => {
        mockRequest.query = { organizationId: '' };

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'organizationId manquant',
        });
        expect(mockRepo.findByOrgId).not.toHaveBeenCalled();
      });
    });

    describe('successful list', () => {
      it('should return list of beneficiaries for organization', async () => {
        const now = new Date();
        mockRequest.query = { organizationId: 'org-123' };

        const mockBeneficiaries = [
          {
            id: 'ben-1',
            organizationId: 'org-123',
            clerkUserId: 'clerk-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+221771234567',
            status: BeneficiaryStatus.ACTIVE,
            progressPercent: 50,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'ben-2',
            organizationId: 'org-123',
            clerkUserId: 'clerk-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            phone: null,
            status: BeneficiaryStatus.INACTIVE,
            progressPercent: 75,
            createdAt: now,
            updatedAt: now,
          },
        ];

        mockRepo.findByOrgId.mockResolvedValue(mockBeneficiaries);

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.findByOrgId).toHaveBeenCalledWith('org-123');
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: [
            {
              id: 'ben-1',
              clerkUserId: 'clerk-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '+221771234567',
              status: BeneficiaryStatus.ACTIVE,
              progressPercent: 50,
              createdAt: now,
            },
            {
              id: 'ben-2',
              clerkUserId: 'clerk-2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              phone: null,
              status: BeneficiaryStatus.INACTIVE,
              progressPercent: 75,
              createdAt: now,
            },
          ],
        });
      });

      it('should return empty array when no beneficiaries found', async () => {
        mockRequest.query = { organizationId: 'org-456' };
        mockRepo.findByOrgId.mockResolvedValue([]);

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.findByOrgId).toHaveBeenCalledWith('org-456');
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          data: [],
        });
      });

      it('should exclude updatedAt from response', async () => {
        const now = new Date();
        mockRequest.query = { organizationId: 'org-789' };

        const mockBeneficiary = {
          id: 'ben-1',
          organizationId: 'org-789',
          clerkUserId: 'clerk-1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+221771234567',
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 30,
          createdAt: now,
          updatedAt: new Date('2024-12-09'),
        };

        mockRepo.findByOrgId.mockResolvedValue([mockBeneficiary]);

        await controller.list(mockRequest as Request, mockResponse as Response);

        const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(response.data[0]).not.toHaveProperty('updatedAt');
        expect(response.data[0].createdAt).toBe(now);
      });

      it('should handle multiple beneficiaries with different statuses', async () => {
        mockRequest.query = { organizationId: 'org-multi' };

        const mockBeneficiaries = [
          {
            id: 'ben-1',
            organizationId: 'org-multi',
            clerkUserId: 'clerk-1',
            firstName: 'Active',
            lastName: 'User',
            email: 'active@example.com',
            phone: '+221771111111',
            status: BeneficiaryStatus.ACTIVE,
            progressPercent: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'ben-2',
            organizationId: 'org-multi',
            clerkUserId: 'clerk-2',
            firstName: 'Inactive',
            lastName: 'User',
            email: 'inactive@example.com',
            phone: '+221772222222',
            status: BeneficiaryStatus.INACTIVE,
            progressPercent: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockRepo.findByOrgId.mockResolvedValue(mockBeneficiaries);

        await controller.list(mockRequest as Request, mockResponse as Response);

        const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(response.data).toHaveLength(2);
        expect(response.data[0].status).toBe(BeneficiaryStatus.ACTIVE);
        expect(response.data[1].status).toBe(BeneficiaryStatus.INACTIVE);
      });
    });

    describe('error handling', () => {
      it('should return 500 when repository throws error', async () => {
        mockRequest.query = { organizationId: 'org-error' };
        const error = new Error('Database connection failed');
        mockRepo.findByOrgId.mockRejectedValue(error);

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Database connection failed',
        });
      });

      it('should return 500 with generic message for unknown error type', async () => {
        mockRequest.query = { organizationId: 'org-unknown' };
        mockRepo.findByOrgId.mockRejectedValue('String error');

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Erreur serveur',
        });
      });

      it('should return 500 when repository throws timeout error', async () => {
        mockRequest.query = { organizationId: 'org-timeout' };
        const error = new Error('Query timeout exceeded');
        mockRepo.findByOrgId.mockRejectedValue(error);

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Query timeout exceeded',
        });
      });

      it('should log error to console when repository fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockRequest.query = { organizationId: 'org-log' };
        const error = new Error('Repository error');
        mockRepo.findByOrgId.mockRejectedValue(error);

        await controller.list(mockRequest as Request, mockResponse as Response);

        expect(consoleErrorSpy).toHaveBeenCalledWith('  - Erreur:', error);
        consoleErrorSpy.mockRestore();
      });
    });
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
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          organizationId: 'org-123',
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

      it('should return 400 when organizationId is missing', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          firstName: 'Test',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            firstName: 'Test',
          },
        });

        await controller.update(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'organizationId manquant',
        });
        expect(mockUpdateUC.execute).not.toHaveBeenCalled();
      });
    });

    describe('successful update', () => {
      it('should update beneficiary with partial data', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          organizationId: 'org-123',
          firstName: 'Updated',
          lastName: 'Name',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            organizationId: 'org-123',
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
          beneficiaryId: 'ben-456',
        };
        mockRequest.body = {
          organizationId: 'org-456',
          status: 'INACTIVE',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            organizationId: 'org-456',
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
          beneficiaryId: 'ben-789',
        };
        mockRequest.body = {
          organizationId: 'org-789',
          phone: null,
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            organizationId: 'org-789',
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
          beneficiaryId: 'ben-all',
        };
        mockRequest.body = {
          organizationId: 'org-all',
          firstName: 'All',
          lastName: 'Updated',
          phone: '+221775555555',
          status: 'INACTIVE',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            organizationId: 'org-all',
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
          beneficiaryId: 'ben-error',
        };
        mockRequest.body = {
          organizationId: 'org-error',
          firstName: 'Error',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            organizationId: 'org-error',
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
          beneficiaryId: 'ben-unknown',
        };
        mockRequest.body = {
          organizationId: 'org-unknown',
          firstName: 'Unknown',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            organizationId: 'org-unknown',
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
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          organizationId: 'org-wrong',
          firstName: 'Denied',
        };

        (updateBeneficiarySchema.safeParse as jest.Mock).mockReturnValue({
          success: true,
          data: {
            organizationId: 'org-wrong',
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

  describe('delete', () => {
    beforeEach(() => {
      mockResponse.send = jest.fn().mockReturnThis();
    });

    describe('validation errors', () => {
      it('should return 400 when beneficiaryId is missing', async () => {
        mockRequest.params = {};
        mockRequest.body = {
          organizationId: 'org-123',
        };

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'beneficiaryId manquant',
        });
        expect(mockRepo.deleteByIdAndOrgId).not.toHaveBeenCalled();
      });

      it('should return 400 when organizationId is missing from body and query', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {};
        mockRequest.query = {};

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'organizationId manquant',
        });
        expect(mockRepo.deleteByIdAndOrgId).not.toHaveBeenCalled();
      });

      it('should return 400 when organizationId is empty string', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          organizationId: '',
        };

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'organizationId manquant',
        });
        expect(mockRepo.deleteByIdAndOrgId).not.toHaveBeenCalled();
      });

      it('should return 400 when organizationId is whitespace only', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          organizationId: '   ',
        };

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'organizationId manquant',
        });
        expect(mockRepo.deleteByIdAndOrgId).not.toHaveBeenCalled();
      });
    });

    describe('successful deletion', () => {
      it('should delete beneficiary from body organizationId', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          organizationId: 'org-123',
        };

        mockRepo.deleteByIdAndOrgId.mockResolvedValue(true);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-123', 'org-123');
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.send).toHaveBeenCalled();
      });

      it('should delete beneficiary from query organizationId', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-456',
        };
        mockRequest.body = {};
        mockRequest.query = {
          organizationId: 'org-456',
        };

        mockRepo.deleteByIdAndOrgId.mockResolvedValue(true);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-456', 'org-456');
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.send).toHaveBeenCalled();
      });

      it('should prioritize body organizationId over query', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-789',
        };
        mockRequest.body = {
          organizationId: 'org-body',
        };
        mockRequest.query = {
          organizationId: 'org-query',
        };

        mockRepo.deleteByIdAndOrgId.mockResolvedValue(true);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-789', 'org-body');
      });

      it('should trim organizationId from body', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-trim',
        };
        mockRequest.body = {
          organizationId: '  org-trimmed  ',
        };

        mockRepo.deleteByIdAndOrgId.mockResolvedValue(true);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-trim', 'org-trimmed');
        expect(mockResponse.status).toHaveBeenCalledWith(204);
      });

      it('should trim organizationId from query', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-query',
        };
        mockRequest.body = {};
        mockRequest.query = {
          organizationId: '  org-query-trimmed  ',
        };

        mockRepo.deleteByIdAndOrgId.mockResolvedValue(true);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-query', 'org-query-trimmed');
      });
    });

    describe('not found handling', () => {
      it('should return 404 when beneficiary not found', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-nonexistent',
        };
        mockRequest.body = {
          organizationId: 'org-123',
        };

        mockRepo.deleteByIdAndOrgId.mockResolvedValue(false);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Bénéficiaire introuvable pour cette organisation',
        });
        expect(mockResponse.send).not.toHaveBeenCalled();
      });

      it('should return 404 when beneficiary belongs to different organization', async () => {
        mockRequest.params = {
          beneficiaryId: 'ben-123',
        };
        mockRequest.body = {
          organizationId: 'org-wrong',
        };

        mockRepo.deleteByIdAndOrgId.mockResolvedValue(false);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockRepo.deleteByIdAndOrgId).toHaveBeenCalledWith('ben-123', 'org-wrong');
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Bénéficiaire introuvable pour cette organisation',
        });
      });
    });

    describe('error handling', () => {
      it('should return 500 when repository throws error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockRequest.params = {
          beneficiaryId: 'ben-error',
        };
        mockRequest.body = {
          organizationId: 'org-error',
        };

        const error = new Error('Database connection failed');
        mockRepo.deleteByIdAndOrgId.mockRejectedValue(error);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Database connection failed',
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur suppression bénéficiaire', error);
        consoleErrorSpy.mockRestore();
      });

      it('should return 500 with generic message for unknown error type', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockRequest.params = {
          beneficiaryId: 'ben-unknown',
        };
        mockRequest.body = {
          organizationId: 'org-unknown',
        };

        mockRepo.deleteByIdAndOrgId.mockRejectedValue('String error');

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Erreur serveur',
        });
        consoleErrorSpy.mockRestore();
      });

      it('should return 500 when repository throws timeout error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockRequest.params = {
          beneficiaryId: 'ben-timeout',
        };
        mockRequest.body = {
          organizationId: 'org-timeout',
        };

        const error = new Error('Query timeout exceeded');
        mockRepo.deleteByIdAndOrgId.mockRejectedValue(error);

        await controller.delete(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Query timeout exceeded',
        });
        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe('getDashboard', () => {
    it('should return 400 when userId is missing', async () => {
      mockRequest.query = {};

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockGetDashboardUC.execute).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'userId (clerkUserId) manquant',
      });
    });

    it('should return 400 when userId is empty string', async () => {
      mockRequest.query = { userId: '' };

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockGetDashboardUC.execute).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'userId (clerkUserId) manquant',
      });
    });

    it('should return 400 when userId is only whitespace', async () => {
      mockRequest.query = { userId: '   ' };

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockGetDashboardUC.execute).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'userId (clerkUserId) manquant',
      });
    });

    it('should return empty dashboard when beneficiary not found', async () => {
      mockRequest.query = { userId: 'clerk-123' };
      const emptyDashboard = {
        stats: {
          modulesCompleted: { current: 0, total: 0 },
          learningTime: '0m',
          quizzesPassed: { current: 0, total: 0 },
          globalProgress: 0,
          videosWatched: { current: 0, total: 0 },
          averageSessionTime: '0m',
          learningStreakDays: 0,
        },
        moduleStats: { completed: 0, inProgress: 0, notStarted: 0, total: 0 },
        monthlyProgress: [],
        recentActivity: [],
        timeByModule: [],
      };
      mockGetDashboardUC.execute.mockResolvedValue(emptyDashboard);

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockGetDashboardUC.execute).toHaveBeenCalledWith({ clerkUserId: 'clerk-123' });
      expect(mockResponse.json).toHaveBeenCalledWith(emptyDashboard);
    });

    it('should return dashboard data when beneficiary exists', async () => {
      mockRequest.query = { userId: 'clerk-456' };
      const dashboardData = {
        stats: {
          modulesCompleted: { current: 2, total: 10 },
          learningTime: '1h 30m',
          quizzesPassed: { current: 0, total: 0 },
          globalProgress: 20,
          videosWatched: { current: 0, total: 0 },
          averageSessionTime: '30m',
          learningStreakDays: 0,
        },
        moduleStats: { completed: 2, inProgress: 1, notStarted: 7, total: 10 },
        monthlyProgress: [{ month: 'Jan', progress: 1, totalMinutes: 0, sessions: 0 }],
        recentActivity: [],
        timeByModule: [],
      };
      mockGetDashboardUC.execute.mockResolvedValue(dashboardData);

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockGetDashboardUC.execute).toHaveBeenCalledWith({ clerkUserId: 'clerk-456' });
      expect(mockResponse.json).toHaveBeenCalledWith(dashboardData);
    });

    it('should return 500 when use case throws', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRequest.query = { userId: 'clerk-789' };
      mockGetDashboardUC.execute.mockRejectedValue(new Error('DB error'));

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'DB error',
      });
      consoleErrorSpy.mockRestore();
    });
  });
});
