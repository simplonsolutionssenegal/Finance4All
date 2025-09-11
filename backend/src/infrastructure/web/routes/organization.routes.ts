import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController';
import { GetAllOrganizationsUseCase } from '../../../application/use-cases/GetAllOrganizationsUseCase';
import { SearchOrganizationsUseCase } from '../../../application/use-cases/SearchOrganizationsUseCase';
import { GetOrganizationTypesUseCase } from '../../../application/use-cases/GetOrganizationTypesUseCase';
import { PrismaOrganizationRepository } from '../../database/PrismaOrganizationRepository';

const router = Router();

// Injection de dépendances
const organizationRepository = new PrismaOrganizationRepository();
const getAllOrganizationsUseCase = new GetAllOrganizationsUseCase(organizationRepository);
const searchOrganizationsUseCase = new SearchOrganizationsUseCase(organizationRepository);
const getOrganizationTypesUseCase = new GetOrganizationTypesUseCase(organizationRepository);

const organizationController = new OrganizationController(
  getAllOrganizationsUseCase,
  searchOrganizationsUseCase,
  getOrganizationTypesUseCase,
);

// Routes
router.get('/', (req, res) => organizationController.getAll(req, res));
router.get('/search', (req, res) => organizationController.search(req, res));
router.get('/types', (req, res) => organizationController.getTypes(req, res));

export { router as organizationRoutes };
