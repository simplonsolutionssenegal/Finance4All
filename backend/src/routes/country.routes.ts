import { Router } from 'express';
import * as CountryController from '../controllers/country.controller';
import { authMiddleware, isSuperAdmin, isAdmin } from '../middlewares/auth.middleware';
import { UserRole } from '../constant/roles';

const router = Router();

router.get('/', CountryController.getCountries);
router.get('/:id', CountryController.getCountryById);

router.post(
  '/',
  authMiddleware,
  isSuperAdmin,
  CountryController.createCountry
);

router.put(
  '/:id',
  authMiddleware,
  isSuperAdmin,
  CountryController.updateCountry
);

router.delete(
  '/:id',
  authMiddleware,
  isSuperAdmin,
  CountryController.deleteCountry
);

export default router;
