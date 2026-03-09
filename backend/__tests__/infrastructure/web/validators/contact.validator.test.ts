import type { Request, Response } from 'express';

import {
  handleContactValidationErrors,
  validateContactEmail,
} from '@/infrastructure/web/validators/contact.validator';

describe('contact.validator', () => {
  const validBody = {
    firstName: 'Lamine',
    lastName: 'Kone',
    email: 'lamine@example.com',
    phone: '+221771112233',
    country: 'Mali',
    subject: 'Demande de support',
    message: 'Bonjour, je souhaite des informations sur vos services.',
    website: '',
  };

  it('accepts a valid contact payload', async () => {
    const req = { body: validBody } as Request;
    const res = {} as Response;
    const next = jest.fn();

    for (const validator of validateContactEmail) {
      await validator.run(req);
    }
    handleContactValidationErrors(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejects invalid payload (short message + invalid email)', async () => {
    const req = {
      body: { ...validBody, email: 'bad-email', message: 'short' },
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    for (const validator of validateContactEmail) {
      await validator.run(req);
    }
    handleContactValidationErrors(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
