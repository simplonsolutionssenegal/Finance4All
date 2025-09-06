// import { Router } from 'express';
// import { UserController } from '../controllers/UserController';
// import { PrismaUserRepository } from '../../database/PrismaUserRepository';
// import { CreateUserUseCaseImpl } from '../../../domain/use-cases/createUserUseCaseImpl';

// const router = Router();
// const userRepository = new PrismaUserRepository();
// const createUserUseCase = new CreateUserUseCaseImpl(userRepository);
// const userController = new UserController(createUserUseCase);

// router.post('/', (req, res) => userController.create(req, res));

// export default router;
// backend/src/infrastructure/web/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/user.service';
import { PrismaUserRepository } from '@/infrastructure/database/prisma-user.repository';
import { asyncHandler } from '../middleware/error.middleware';
import { GetUsersByOrganisationUseCaseImpl } from '@/domain/use-cases/GetUsersByOrganisationUseCaseImpl';
import { GetUsersByOrganisationAndStatusUseCaseImpl } from '@/domain/use-cases/GetUsersByOrganisationAndStatusUseCaseImpl';

// Initialisation des dépendances
// const userRepository = new PrismaUserRepository();
// const getUsersByOrganisationUC = new GetUsersByOrganisationUseCaseImpl(userRepository);
// const getUsersByOrgAndStatusUC = new GetUsersByOrganisationAndStatusUseCaseImpl(userRepository);



// const userController = new UserController(userService);
const userRepo = new PrismaUserRepository();


const getUsersByOrganisation = new GetUsersByOrganisationUseCaseImpl(userRepo);
const getUsersByOrgAndFiltre = new GetUsersByOrganisationAndStatusUseCaseImpl(userRepo);


const userService = new UserService(getUsersByOrganisation, getUsersByOrgAndFiltre);


const userController = new UserController(userService);
const router = Router();

router.get('/organizations/:organisationId/users', (req, res) => userController.getUsersByOrganisation(req, res));
router.get('/organizations/:organisationId/users/filter', (req, res) => userController.getUsersByOrganisationFilter(req, res));

export { router as userRoutes };
