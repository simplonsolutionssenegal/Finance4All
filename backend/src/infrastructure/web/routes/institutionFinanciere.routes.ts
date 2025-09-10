import express from 'express';
import { InstitutionFinanciereController } from '@/infrastructure/web/controllers/InstitutionFinanciereController';
import { PrismaInstitutionFinanciereRepository } from '@/infrastructure/database/PrismaInstitutionFinanciereRepository';
import { CreateInstitutionFinanciereUseCase } from '@/application/use-cases/CreateInstitutionFinanciereUseCase';
import { GetAllInstitutionsFinancieresUseCase } from '@/application/use-cases/GetAllInstitutionsFinancieresUseCase';
import { GetInstitutionFinanciereByIdUseCase } from '@/application/use-cases/GetInstitutionFinanciereByIdUseCase';
import { validateCreateInstitutionFinanciere } from '@/infrastructure/web/middleware/institutionFinanciere.validation';
import { prisma } from '@/infrastructure/database/prisma';
//import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Instancier les dépendances
const institutionFinanciereRepository = new PrismaInstitutionFinanciereRepository(prisma);
const createInstitutionFinanciereUseCase = new CreateInstitutionFinanciereUseCase(
  institutionFinanciereRepository
);
const getAllInstitutionsFinancieresUseCase = new GetAllInstitutionsFinancieresUseCase(
  institutionFinanciereRepository
);
const getInstitutionFinanciereByIdUseCase = new GetInstitutionFinanciereByIdUseCase(
  institutionFinanciereRepository
);
const institutionFinanciereController = new InstitutionFinanciereController(
  createInstitutionFinanciereUseCase,
  getAllInstitutionsFinancieresUseCase,
  getInstitutionFinanciereByIdUseCase
);

// Routes pour les institutions financières
router.post(
  '/',
  // authMiddleware(['ADMIN']),
  validateCreateInstitutionFinanciere,
  (req, res) => institutionFinanciereController.create(req, res)
);

// Route pour récupérer toutes les institutions financières
// Cette route est accessible publiquement sans nécessiter d'authentification
router.get('/', (req, res) => institutionFinanciereController.getAll(req, res));

// Route pour récupérer une institution financière par son ID
router.get('/:id', (req, res) => institutionFinanciereController.getById(req, res));

export default router;
