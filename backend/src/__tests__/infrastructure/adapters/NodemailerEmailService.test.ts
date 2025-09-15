import { NodemailerEmailService } from '@/infrastructure/adapters/NodemailerEmailService';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn().mockReturnValue({
      verify: jest.fn().mockResolvedValue(undefined),
      sendMail: jest.fn().mockResolvedValue({}),
    }),
  },
}));

describe('NodemailerEmailService', () => {
  const savedEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...savedEnv };
  });
  afterAll(() => {
    process.env = savedEnv;
  });

  it('skips sending when SMTP config missing (dev)', async () => {
    process.env.NODE_ENV = 'development';
    const svc = new NodemailerEmailService();
    await expect(svc.sendConfirmationEmail('a@b.c', 'token')).resolves.toBeUndefined();
  });

  it('sends email when SMTP config present', async () => {
    process.env.NODE_ENV = 'test';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';
    process.env.SMTP_FROM = 'from@example.com';
    const svc = new NodemailerEmailService();
    await expect(svc.sendConfirmationEmail('a@b.c', 'token')).resolves.toBeUndefined();
  });
});
