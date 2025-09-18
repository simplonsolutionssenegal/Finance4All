// backend/src/infrastructure/web/routes/userRoutes.ts
import { Router} from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/user.service';
import { GetUsersByOrganisationUseCaseImpl } from '@/domain/use-cases/GetUsersByOrganisationUseCaseImpl';
import { GetUsersByOrganisationAndStatusUseCaseImpl } from '@/domain/use-cases/GetUsersByOrganisationAndStatusUseCaseImpl';
import { ClerkUserRepository } from '@/infrastructure/database/ClerkUserRepository';



// const prisma = new PrismaClient();
// const userRepo = new PrismaUserRepository();
const clerkUserRepo = new ClerkUserRepository();


const getUsersByOrganisation = new GetUsersByOrganisationUseCaseImpl(clerkUserRepo);
const getUsersByOrgAndFiltre = new GetUsersByOrganisationAndStatusUseCaseImpl(clerkUserRepo);


const userService = new UserService(getUsersByOrganisation,getUsersByOrgAndFiltre);


const userController = new UserController(userService);
const router = Router();

router.get('/organisations/:organisationId/users', (req, res) => userController.getUsersByOrganisation(req, res));
router.get('/organisations/:organisationId/users/filter', (req, res) => userController.getUsersByOrganisationFilter(req, res));



export { router as userRoutes };
