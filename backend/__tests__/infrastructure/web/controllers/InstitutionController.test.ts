import { InstitutionController } from '@/infrastructure/web/controllers/InstitutionController';
import type { CreateInstitutionUseCase } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import type { Request, Response, NextFunction } from 'express';
import { InstitutionStatus } from '@/domain/institutions/entities/Institution';

describe('InstitutionController', () => {
  let controller: InstitutionController;
  let mockCreateInstitutionUseCase: jest.Mocked<CreateInstitutionUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCreateInstitutionUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new InstitutionController(mockCreateInstitutionUseCase);

    mockRequest = {
      body: {},
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
});
