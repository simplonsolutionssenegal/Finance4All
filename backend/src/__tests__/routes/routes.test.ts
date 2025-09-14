import request from 'supertest';
import express from 'express';

let getUsersByOrganisationExecuteMock: jest.Mock;
let getUsersByOrgAndFiltreExecuteMock: jest.Mock;

// Mock des UseCases (assigne les jest.fn() DANS la factory)
jest.mock('@/domain/use-cases/GetUsersByOrganisationUseCaseImpl', () => {
  getUsersByOrganisationExecuteMock = jest.fn();
  return {
    GetUsersByOrganisationUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: getUsersByOrganisationExecuteMock,
    })),
  };
});

jest.mock('@/domain/use-cases/GetUsersByOrganisationAndStatusUseCaseImpl', () => {
  getUsersByOrgAndFiltreExecuteMock = jest.fn();
  return {
    GetUsersByOrganisationAndStatusUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: getUsersByOrgAndFiltreExecuteMock,
    })),
  };
});

// Optionnel : éviter que Prisma soit instancié
jest.mock('@/infrastructure/database/PrismaUserRepository', () => ({
  PrismaUserRepository: jest.fn().mockImplementation(() => ({})),
}));

// Mock du controller pour éviter la vraie logique interne (si besoin)
const controllerMock = {
  getUsersByOrganisation: jest.fn(),
  getUsersByOrganisationFilter: jest.fn(),
};
jest.mock('@/infrastructure/web/controllers/UserController', () => ({
  UserController: jest.fn().mockImplementation(() => controllerMock),
}));

describe('api routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // IMPORTANT

    // importer après les mocks
    
    const { apiRoutes } = require('@/routes/index');

    app = express();
    app.use(express.json());
    app.use('/api/v1', apiRoutes);   // apiRoutes monte /users -> userRoutes
  });

  it('GET /api/v1/users/organisations/:orgId/users → 200', async () => {
    controllerMock.getUsersByOrganisation.mockImplementation((req: any, res: any) =>
      res.status(200).json([{ id: 1 }])
    );

    const res = await request(app).get('/api/v1/users/organisations/37/users').expect(200);
    expect(controllerMock.getUsersByOrganisation).toHaveBeenCalled();
    expect(res.body).toEqual([{ id: 1 }]);
  });

  it('GET /api/v1/users/organisations/:orgId/users/filter → 200', async () => {
    controllerMock.getUsersByOrganisationFilter.mockImplementation((req: any, res: any) =>
      res.status(200).json([{ id: 2 }])
    );

    const res = await request(app)
      .get('/api/v1/users/organisations/37/users/filter')
      .query({ status: ['ACTIF'], roles: ['ADMIN'], lastLogin: 'recent' })
      .expect(200);

    expect(controllerMock.getUsersByOrganisationFilter).toHaveBeenCalled();
    expect(res.body).toEqual([{ id: 2 }]);
  });
});
