// backend/src/infrastructure/web/routes/role.routes.ts
import { Router } from 'express';

import { PrismaRoleRepository } from '@/infrastructure/database/prisma-role.repository';
import { ListRolesUseCaseImpl } from '@/domain/use-cases/ListRolesUseCaseImpl';
import { RoleService } from '@/infrastructure/web/services/RoleService';
import { RoleController } from '@/infrastructure/web/controllers/RoleController';

const router = Router();

const roleRepo = new PrismaRoleRepository();
const listRolesUC = new ListRolesUseCaseImpl(roleRepo);
const roleService = new RoleService(listRolesUC);
const roleController = new RoleController(roleService);

router.get('/list', (req, res) => roleController.list(req, res));

export { router as roleRoutes };