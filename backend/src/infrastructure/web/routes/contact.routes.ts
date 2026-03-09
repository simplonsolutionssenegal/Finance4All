import { Router } from 'express';

import { ContactController } from '../controllers/ContactController';
import {
  handleContactValidationErrors,
  validateContactEmail,
} from '../validators/contact.validator';

export const ContactRoutes = (): Router => {
  const router = Router();
  const controller = new ContactController();
  const sendEmail = controller.sendEmail.bind(controller);

  router.post('/email', validateContactEmail, handleContactValidationErrors, sendEmail);

  return router;
};
