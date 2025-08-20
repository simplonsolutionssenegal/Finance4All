import { Router,Request, Response } from "express";
import { changeRole, disableOrEnableUser } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.put('/update-role', authenticate, changeRole);
router.patch('/toggle-status/:userId', authenticate, disableOrEnableUser);

export default router;
