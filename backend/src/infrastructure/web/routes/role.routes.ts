import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { GetAllRolesUseCase } from '../../../application/use-cases/GetAllRolesUseCase';
import { PrismaRoleRepository } from '../../database/PrismaRoleRepository';

const router = Router();

// Injection de dépendances
const roleRepository = new PrismaRoleRepository();
const getAllRolesUseCase = new GetAllRolesUseCase(roleRepository);

const roleController = new RoleController(getAllRolesUseCase);

// Routes
router.get('/', (req, res) => roleController.getAll(req, res));

export { router as roleRoutes };
