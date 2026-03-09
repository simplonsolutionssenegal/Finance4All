import express from 'express';
import request from 'supertest';

import { ContactController } from '@/infrastructure/web/controllers/ContactController';
import { ContactRoutes } from '@/infrastructure/web/routes/contact.routes';

describe('ContactRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('binds POST /email to controller', async () => {
    const sendEmailSpy = jest
      .spyOn(ContactController.prototype, 'sendEmail')
      .mockImplementation(async (_req, res) => {
        res.status(200).json({ success: true });
      });

    const app = express();
    app.use(express.json());
    app.use('/contact', ContactRoutes());

    const response = await request(app).post('/contact/email').send({
      firstName: 'Lamine',
      lastName: 'Kone',
      email: 'lamine@example.com',
      phone: '+221771112233',
      country: 'Mali',
      subject: 'Demande de support',
      message: 'Bonjour, je souhaite des informations sur vos services.',
      website: '',
    });

    expect(response.status).toBe(200);
    expect(sendEmailSpy).toHaveBeenCalled();
  });
});
