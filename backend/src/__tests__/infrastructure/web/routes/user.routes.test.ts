import request from 'supertest';
import express from 'express';

// On prépare des mocks pour les méthodes du controller utilisées par le router
const mockController = {
  getUsersByOrganisation: jest.fn(),
  getUsersByOrganisationFilter: jest.fn(),
};

// Mock du module UserController pour qu'il renvoie notre instance mockée
jest.mock('@/infrastructure/web/controllers/UserController', () => {
  return {
    UserController: jest.fn().mockImplementation(() => mockController),
  };
});

// (optionnel) Évite que Prisma soit instancié/réellement utilisé pendant l'import
jest.mock('@/infrastructure/database/PrismaUserRepository', () => {
  return {
    PrismaUserRepository: jest.fn().mockImplementation(() => ({})),
  };
});

// (optionnel) Mock des use-cases si tu veux couper plus bas dans la stack
jest.mock('@/domain/use-cases/GetUsersByOrganisationUseCaseImpl', () => {
  return { GetUsersByOrganisationUseCaseImpl: jest.fn(() => ({})) };
});
jest.mock('@/domain/use-cases/GetUsersByOrganisationAndStatusUseCaseImpl', () => {
  return { GetUsersByOrganisationAndStatusUseCaseImpl: jest.fn(() => ({})) };
});

describe('user.routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules(); // important: réinitialise le cache de modules pour que les mocks s’appliquent

    // importer le router APRÈS avoir posé les mocks
    const { userRoutes } = require('@/infrastructure/web/routes/user.routes');

    app = express();
    app.use(express.json());
    app.use('/users', userRoutes);
  });

  describe('GET /users/organisations/:organisationId/users', () => {
    it('renvoie 200 et la liste des utilisateurs', async () => {
      const fake = [{ id: 1, email: 'a@b.com' }];
      mockController.getUsersByOrganisation.mockImplementation((req, res) =>
        res.status(200).json(fake)
      );

      const res = await request(app).get('/users/organisations/37/users').expect(200);

      expect(mockController.getUsersByOrganisation).toHaveBeenCalled();
      expect(res.body).toEqual(fake);
    });

    it('renvoie 400 en cas de paramètre invalide', async () => {
      mockController.getUsersByOrganisation.mockImplementation((req, res) =>
        res.status(400).json({ status: 'error', message: 'organisationId invalide' })
      );

      const res = await request(app).get('/users/organisations/NaN/users').expect(400);
      expect(res.body).toMatchObject({ status: 'error' });
    });

    it('renvoie 500 si le contrôleur lève une erreur serveur', async () => {
      mockController.getUsersByOrganisation.mockImplementation((req, res) =>
        res.status(500).json({ status: 'error', message: 'unexpected' })
      );

      await request(app).get('/users/organisations/37/users').expect(500);
    });
  });

  describe('GET /users/organisations/:organisationId/users/filter', () => {
    it('renvoie 200 avec des filtres', async () => {
      const fake = [{ id: 2, email: 'jane@example.com' }];
      mockController.getUsersByOrganisationFilter.mockImplementation((req, res) =>
        res.status(200).json(fake)
      );

      const res = await request(app)
        .get('/users/organisations/37/users/filter')
        .query({ status: ['ACTIF'], roles: ['ADMIN'], lastLogin: 'recent' })
        .expect(200);

      expect(mockController.getUsersByOrganisationFilter).toHaveBeenCalled();
      expect(res.body).toEqual(fake);
    });

    it('renvoie 400 si filtre invalide', async () => {
      mockController.getUsersByOrganisationFilter.mockImplementation((req, res) =>
        res.status(400).json({ status: 'error', message: 'customDate manquant' })
      );

      await request(app)
        .get('/users/organisations/37/users/filter')
        .query({ lastLogin: 'custom' })
        .expect(400);
    });
  });

  it('retourne 404 sur méthodes non supportées à la racine /users', async () => {
    await request(app).post('/users').send({}).expect(404);
    await request(app).put('/users').expect(404);
    await request(app).delete('/users').expect(404);
  });
});
