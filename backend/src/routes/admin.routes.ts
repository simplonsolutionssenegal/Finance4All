import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { validate } from '../middlewares/validate.middleware';
import { createAdminValidator, updateAdminValidator } from '../models/validators/admin.validator';
import { authMiddleware, isSuperAdmin, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, isSuperAdmin, validate(createAdminValidator), AdminController.createAdmin);
router.get('/', authMiddleware, isSuperAdmin, AdminController.getAdmins);
router.get('/:id', authMiddleware, isSuperAdmin, AdminController.getAdminById);
router.put('/:id', authMiddleware, isSuperAdmin, validate(updateAdminValidator), AdminController.updateAdmin);
router.delete('/:id', authMiddleware, isSuperAdmin, AdminController.deleteAdmin);

export default router;
