import { InstitutionController } from '@/infrastructure/web/controllers/InstitutionController';
import type { CreateInstitutionUseCase } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import type { GetInstitutionsUseCase } from '@/domain/institutions/ports/in/GetInstitutionsUseCase';
import type { Request, Response, NextFunction } from 'express';
import { InstitutionStatus } from '@/domain/institutions/entities/Institution';

describe('InstitutionController', () => {
  let controller: InstitutionController;
  let mockCreateInstitutionUseCase: jest.Mocked<CreateInstitutionUseCase>;
  let mockGetInstitutionsUseCase: jest.Mocked<GetInstitutionsUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCreateInstitutionUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetInstitutionsUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new InstitutionController(
      mockCreateInstitutionUseCase,
      mockGetInstitutionsUseCase
    );

    mockRequest = {
      body: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an institution successfully', async () => {
      const requestBody = {
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://test.com',
        geographicZones: ['EURO', 'USD'],
        logoUrl: 'https://test.com/logo.png',
      };

      const institutionDTO = {
        id: 'inst_123',
        name: requestBody.name,
        description: requestBody.description,
        website: requestBody.website,
        geographicZones: requestBody.geographicZones,
        logoUrl: requestBody.logoUrl,
        status: InstitutionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = requestBody;
      mockCreateInstitutionUseCase.execute.mockResolvedValue(institutionDTO);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCreateInstitutionUseCase.execute).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: institutionDTO,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should create an institution without optional fields', async () => {
      const requestBody = {
        name: 'Test Institution',
        description: 'Test Description',
        geographicZones: ['EURO'],
      };

      const institutionDTO = {
        id: 'inst_456',
        name: requestBody.name,
        description: requestBody.description,
        website: null,
        geographicZones: requestBody.geographicZones,
        logoUrl: null,
        status: InstitutionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = requestBody;
      mockCreateInstitutionUseCase.execute.mockResolvedValue(institutionDTO);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCreateInstitutionUseCase.execute).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: institutionDTO,
      });
    });

    it('should handle errors and call next middleware', async () => {
      const requestBody = {
        name: 'Test Institution',
        description: 'Test Description',
        geographicZones: ['EURO'],
      };

      const error = new Error('Use case error');
      mockRequest.body = requestBody;
      mockCreateInstitutionUseCase.execute.mockRejectedValue(error);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCreateInstitutionUseCase.execute).toHaveBeenCalledWith(requestBody);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const requestBody = {
        name: 'Test Institution',
        description: 'Test Description',
        geographicZones: ['EURO'],
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      mockRequest.body = requestBody;
      mockCreateInstitutionUseCase.execute.mockRejectedValue(validationError);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('should handle duplicate errors', async () => {
      const requestBody = {
        name: 'Existing Institution',
        description: 'Test Description',
        geographicZones: ['EURO'],
      };

      const duplicateError = new Error(
        'Entity institution with name Existing Institution already exists'
      );
      mockRequest.body = requestBody;
      mockCreateInstitutionUseCase.execute.mockRejectedValue(duplicateError);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(duplicateError);
    });

    it('should pass request body to use case without modification', async () => {
      const requestBody = {
        name: 'Test Institution',
        description: 'Test Description',
        website: 'https://example.com',
        geographicZones: ['USD', 'EURO', 'GBP'],
        logoUrl: 'https://example.com/logo.png',
        extraField: 'should be passed through',
      };

      const institutionDTO = {
        id: 'inst_789',
        name: requestBody.name,
        description: requestBody.description,
        website: requestBody.website,
        geographicZones: requestBody.geographicZones,
        logoUrl: requestBody.logoUrl,
        status: InstitutionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = requestBody;
      mockCreateInstitutionUseCase.execute.mockResolvedValue(institutionDTO);

      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCreateInstitutionUseCase.execute).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('getAll', () => {
    it('should get all institutions with default pagination', async () => {
      const paginatedResult = {
        data: [
          {
            id: 'inst_1',
            name: 'Institution 1',
            description: 'Description 1',
            website: 'https://test1.com',
            geographicZones: ['USD'],
            logoUrl: 'https://test1.com/logo.png',
            status: InstitutionStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'inst_2',
            name: 'Institution 2',
            description: 'Description 2',
            website: 'https://test2.com',
            geographicZones: ['EURO'],
            logoUrl: 'https://test2.com/logo.png',
            status: InstitutionStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockRequest.query = {};
      mockGetInstitutionsUseCase.execute.mockResolvedValue(paginatedResult);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetInstitutionsUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        ...paginatedResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get all institutions with custom pagination', async () => {
      const paginatedResult = {
        data: [
          {
            id: 'inst_3',
            name: 'Institution 3',
            description: 'Description 3',
            website: 'https://test3.com',
            geographicZones: ['GBP'],
            logoUrl: 'https://test3.com/logo.png',
            status: InstitutionStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          totalPages: 2,
        },
      };

      mockRequest.query = { page: '2', limit: '5' };
      mockGetInstitutionsUseCase.execute.mockResolvedValue(paginatedResult);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetInstitutionsUseCase.execute).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        ...paginatedResult,
      });
    });

    it('should handle errors and call next middleware', async () => {
      const error = new Error('Use case error');
      mockRequest.query = {};
      mockGetInstitutionsUseCase.execute.mockRejectedValue(error);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetInstitutionsUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle invalid pagination parameters with defaults', async () => {
      const paginatedResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockRequest.query = { page: 'invalid', limit: 'invalid' };
      mockGetInstitutionsUseCase.execute.mockResolvedValue(paginatedResult);

      await controller.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetInstitutionsUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
