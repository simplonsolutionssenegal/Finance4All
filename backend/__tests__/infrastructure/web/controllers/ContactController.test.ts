import type { Request, Response } from 'express';

import { ContactController } from '@/infrastructure/web/controllers/ContactController';
import { sendContactEmail } from '@/infrastructure/utils/emailService';

jest.mock('@/infrastructure/utils/emailService', () => ({
  sendContactEmail: jest.fn(),
}));

describe('ContactController', () => {
  const createRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 when email is sent', async () => {
    (sendContactEmail as jest.Mock).mockResolvedValue(undefined);
    const controller = new ContactController();
    const req = {
      body: {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        phone: '123456',
        country: 'Mali',
        subject: 'Bonjour support',
        message: 'Ceci est un message de test suffisamment long.',
      },
      headers: {},
      ip: '127.0.0.1',
    } as unknown as Request;
    const res = createRes();

    await controller.sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendContactEmail).toHaveBeenCalled();
  });

  it('returns 429 when attempts are exhausted', async () => {
    (sendContactEmail as jest.Mock).mockResolvedValue(undefined);
    const controller = new ContactController();

    const baseReq = {
      body: {
        firstName: 'A',
        lastName: 'B',
        email: 'limit@test.com',
        country: 'Mali',
        subject: 'Bonjour support',
        message: 'Ceci est un message de test suffisamment long.',
      },
      headers: { 'x-forwarded-for': '10.0.0.1' },
      ip: '10.0.0.1',
    } as unknown as Request;

    await controller.sendEmail(baseReq, createRes());
    await controller.sendEmail(baseReq, createRes());
    await controller.sendEmail(baseReq, createRes());
    const res4 = createRes();
    await controller.sendEmail(baseReq, res4);

    expect(res4.status).toHaveBeenCalledWith(429);
  });
});
