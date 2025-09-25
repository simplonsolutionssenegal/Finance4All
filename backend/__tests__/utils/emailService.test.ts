import {
  EmailService,
  sendInvitationEmail,
  testEmailConnection,
  type InvitationEmailData,
} from '@/infrastructure/utils/emailService';
import nodemailer from 'nodemailer';
import { logger } from '@/infrastructure/utils/logger';

// Mock dependencies
jest.mock('nodemailer');
jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
const mockLogger = logger as any;

describe.skip('EmailService', () => {
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    };
    mockNodemailer.createTransport.mockReturnValue(mockTransporter);

    // Reset transporter static property
    (EmailService as any).transporter = null;

    // Set default environment variables
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'testpassword';
    process.env.FROM_NAME = 'Finance4All';
    process.env.FROM_EMAIL = 'noreply@finance4all.com';
    process.env.FRONTEND_URL = 'https://app.finance4all.com';
  });

  afterEach(() => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    delete process.env.FROM_NAME;
    delete process.env.FROM_EMAIL;
    delete process.env.FRONTEND_URL;
  });

  describe('sendInvitationEmail', () => {
    const mockEmailData: InvitationEmailData = {
      recipientEmail: 'test@example.com',
      organizationName: 'Test Org',
      role: 'admin',
      inviterEmail: 'inviter@example.com',
      invitationId: 'inv_123',
      organizationId: 'org_123',
    };

    it('should send invitation email successfully', async () => {
      const mockResult = {
        messageId: 'msg_123',
        response: 'Email sent successfully',
      };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      await EmailService.sendInvitationEmail(mockEmailData);

      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@gmail.com',
          pass: 'testpassword',
        },
        secure: true,
        logger: false,
        debug: false,
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            name: 'Finance4All',
            address: 'noreply@finance4all.com',
          },
          to: 'test@example.com',
          subject: 'Invitation à rejoindre Test Org sur Finance4All',
          html: expect.stringContaining('Test Org'),
          text: expect.stringContaining('Test Org'),
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith('Email envoyé avec succès', {
        messageId: 'msg_123',
        recipient: 'test@example.com',
        response: 'Email sent successfully',
      });
    });

    it('should handle simulation mode when credentials are missing', async () => {
      delete process.env.GMAIL_USER;
      delete process.env.GMAIL_APP_PASSWORD;

      const mockResult = {
        message: Buffer.from('Simulated email'),
      };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      await EmailService.sendInvitationEmail(mockEmailData);

      expect(mockLogger.info).toHaveBeenCalledWith('📧 EMAIL SIMULÉ (pas de configuration Gmail)', {
        recipient: 'test@example.com',
        subject: 'Invitation à rejoindre Test Org sur Finance4All',
        preview: expect.stringContaining('Bonjour !'),
      });
    });

    it('should generate correct invitation URL with parameters', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      await EmailService.sendInvitationEmail(mockEmailData);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(
        'https://app.finance4all.com/accept-invitation?invitation_id=inv_123&org_id=org_123'
      );
      expect(callArgs.text).toContain(
        'https://app.finance4all.com/accept-invitation?invitation_id=inv_123&org_id=org_123'
      );
    });

    it('should generate invitation URL without parameters when not provided', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      const dataWithoutIds = {
        ...mockEmailData,
        invitationId: undefined,
        organizationId: undefined,
      };

      await EmailService.sendInvitationEmail(dataWithoutIds);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('https://app.finance4all.com/accept-invitation');
      expect(callArgs.text).toContain('https://app.finance4all.com/accept-invitation');
    });

    it('should use default values when environment variables are not set', async () => {
      delete process.env.FROM_NAME;
      delete process.env.FROM_EMAIL;
      delete process.env.FRONTEND_URL;

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      await EmailService.sendInvitationEmail(mockEmailData);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.from).toEqual({
        name: 'Finance4All',
        address: 'test@gmail.com',
      });
      expect(callArgs.html).toContain('https://app.finance4all.com/accept-invitation');
    });

    it('should handle email sending errors', async () => {
      const error = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(EmailService.sendInvitationEmail(mockEmailData)).rejects.toThrow(
        "Impossible d'envoyer l'email d'invitation: Error: SMTP connection failed"
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Erreur lors de l'envoi de l'email d'invitation",
        {
          error,
          recipient: 'test@example.com',
        }
      );
    });

    it('should handle different role types correctly', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      const roles = [
        { role: 'admin', expected: 'Administrateur' },
        { role: 'member', expected: 'Membre' },
        { role: 'viewer', expected: 'Observateur' },
        { role: 'editor', expected: 'Éditeur' },
        { role: 'manager', expected: 'Gestionnaire' },
        { role: 'custom_role', expected: 'custom_role' },
      ];

      for (const { role, expected } of roles) {
        const dataWithRole = { ...mockEmailData, role };
        await EmailService.sendInvitationEmail(dataWithRole);

        const callArgs =
          mockTransporter.sendMail.mock.calls[mockTransporter.sendMail.mock.calls.length - 1][0];
        expect(callArgs.html).toContain(`<strong>Votre rôle :</strong> ${expected}`);
        expect(callArgs.text).toContain(`Votre rôle : ${expected}`);
      }
    });

    it('should handle missing inviter email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      const dataWithoutInviter = {
        ...mockEmailData,
        inviterEmail: undefined,
      };

      await EmailService.sendInvitationEmail(dataWithoutInviter);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Vous avez été invité(e)');
      expect(callArgs.text).toContain('Vous avez été invité(e)');
    });
  });

  describe('testConnection', () => {
    it('should verify Gmail connection successfully', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await EmailService.testConnection();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Connexion Gmail vérifiée avec succès');
      expect(result).toBe(true);
    });

    it('should handle connection verification failure', async () => {
      const error = new Error('Authentication failed');
      mockTransporter.verify.mockRejectedValue(error);

      const result = await EmailService.testConnection();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Échec de la vérification de la connexion Gmail',
        { error }
      );
      expect(result).toBe(false);
    });

    it('should return true in simulation mode', async () => {
      delete process.env.GMAIL_USER;
      delete process.env.GMAIL_APP_PASSWORD;

      const result = await EmailService.testConnection();

      expect(mockTransporter.verify).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Mode simulation - test de connexion ignoré');
      expect(result).toBe(true);
    });
  });

  describe('exported functions', () => {
    it('should export sendInvitationEmail function', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      await sendInvitationEmail({
        recipientEmail: 'test@example.com',
        organizationName: 'Test Org',
        role: 'admin',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should export testEmailConnection function', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await testEmailConnection();

      expect(result).toBe(true);
    });
  });

  describe('transporter initialization', () => {
    it('should initialize transporter only once', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      const mockEmailData = {
        recipientEmail: 'test@example.com',
        organizationName: 'Test Org',
        role: 'admin',
      };

      await EmailService.sendInvitationEmail(mockEmailData);
      await EmailService.sendInvitationEmail(mockEmailData);

      expect(mockNodemailer.createTransport).toHaveBeenCalledTimes(1);
    });

    it('should mask email in logger', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      const mockEmailData = {
        recipientEmail: 'test@example.com',
        organizationName: 'Test Org',
        role: 'admin',
      };

      await EmailService.sendInvitationEmail(mockEmailData);

      expect(mockLogger.info).toHaveBeenCalledWith('Transporteur Gmail initialisé', {
        user: 'test@***',
      });
    });

    it('should enable debug mode in development', async () => {
      process.env.NODE_ENV = 'development';
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg_123' });

      const mockEmailData = {
        recipientEmail: 'test@example.com',
        organizationName: 'Test Org',
        role: 'admin',
      };

      await EmailService.sendInvitationEmail(mockEmailData);

      expect(mockNodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: true,
        })
      );
    });
  });
});
