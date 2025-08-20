import express from 'express';
import * as OrganisationController from '../controllers/organisation.controller';
import { authMiddleware, isSuperAdmin, isAdmin } from '../middlewares/auth.middleware';
// import { authorize } from '../middlewares/authorize.middleware';
import { upload } from '../middlewares/multer.middleware'; // middleware pour gestion upload image

const router = express.Router();

// 👌 Authentification et vérification des permissions
router.post(
  '/',
  authMiddleware,
  isSuperAdmin,
  isAdmin,
  upload.single('logo'),
  OrganisationController.createOrganisation,
);

router.get(
  '/',
  authMiddleware,
  isSuperAdmin,
  isAdmin,
  OrganisationController.getOrganisations,
);

router.get(
  '/:id',
  authMiddleware,
  isSuperAdmin,
  isAdmin,
  OrganisationController.getOrganisationById,
);

router.put(
  '/:id',
  authMiddleware,
  isSuperAdmin,
  isAdmin,
  OrganisationController.updateOrganisation,
);

router.delete(
  '/:id',
  authMiddleware,
  isSuperAdmin,
  OrganisationController.deleteOrganisation,
);

export default router;
