import { UserController } from '@/infrastructure/web/controllers/UserController';
import { UserService } from '@/infrastructure/web/services/user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockService: Partial<UserService>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockService = {
      getUsersByOrganisation: jest.fn(),
      getUsersByOrganisationAndStatus: jest.fn(),
    };
    controller = new UserController(mockService as UserService);

    mockReq = { params: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getUsersByOrganisation', () => {
    it('retourne 400 si organisationId invalide', async () => {
      mockReq.params.organisationId = 'abc';

      await controller.getUsersByOrganisation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID organisation invalide',
      });
    });

    it('retourne la liste des utilisateurs', async () => {
      mockReq.params.organisationId = '42';
      const fakeUsers = [{ toJSON: () => ({ id: 1 }) }];
      (mockService.getUsersByOrganisation as jest.Mock).mockResolvedValue(fakeUsers);

      await controller.getUsersByOrganisation(mockReq, mockRes);

      expect(mockService.getUsersByOrganisation).toHaveBeenCalledWith(42);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: [{ id: 1 }],
      });
    });

    it('retourne 400 si service throw', async () => {
      mockReq.params.organisationId = '42';
      (mockService.getUsersByOrganisation as jest.Mock).mockRejectedValue(new Error('oops'));

      await controller.getUsersByOrganisation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Une erreur est survenue lors du filtrage des utilisateurs',
        message: 'Erreur inconnue',
      });
    });
  });

  describe('getUsersByOrganisationFilter', () => {
    it('retourne 400 si organisationId invalide', async () => {
      mockReq.params.organisationId = 'abc';

      await controller.getUsersByOrganisationFilter(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID organisation invalide',
      });
    });

    it('appelle le service avec status, roles et lastLoginFilter', async () => {
      mockReq.params.organisationId = '42';
      mockReq.query = { status: 'ACTIF', role: ['ADMIN'], lastLogin: 'recent' };
      const fakeUsers = [{ toJSON: () => ({ id: 1 }) }];
      (mockService.getUsersByOrganisationAndStatus as jest.Mock).mockResolvedValue(fakeUsers);

      await controller.getUsersByOrganisationFilter(mockReq, mockRes);

      expect(mockService.getUsersByOrganisationAndStatus).toHaveBeenCalledWith(
        42,
        ['ACTIF'],
        ['ADMIN'],
        { type: 'recent' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: [{ id: 1 }],
      });
    });

    it('retourne 500 si service throw', async () => {
      mockReq.params.organisationId = '42';
      (mockService.getUsersByOrganisationAndStatus as jest.Mock).mockRejectedValue(new Error('oops'));

      await controller.getUsersByOrganisationFilter(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'oops',
      });
    });

    it('retourne 400 si lastLogin=custom sans customDate', async () => {
      mockReq.params.organisationId = '42';
      mockReq.query = { lastLogin: 'custom' };

      await controller.getUsersByOrganisationFilter(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'customDate requis',
      });
    });

    it('retourne 400 si lastLogin=custom avec date invalide', async () => {
      mockReq.params.organisationId = '42';
      mockReq.query = { lastLogin: 'custom', customDate: 'invalid-date' };

      await controller.getUsersByOrganisationFilter(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Date invalide',
      });
    });
  });
});
