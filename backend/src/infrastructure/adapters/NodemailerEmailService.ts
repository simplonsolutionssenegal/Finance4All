import nodemailer from 'nodemailer';
import { EmailService } from '../../domain/ports/EmailService';
import { logger } from '@/utils/logger';

export class NodemailerEmailService implements EmailService {
  async sendConfirmationEmail(email: string, confirmationToken: string): Promise<void> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? '0');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = (process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true';
    const from = process.env.SMTP_FROM ?? user;

    // Si la configuration SMTP est absente en développement, on log et on n'empêche pas le signup
    if (!host || !port || !user || !pass || !from) {
      logger.warn('SMTP config missing or incomplete. Skipping email sending.', {
        hostPresent: !!host,
        portPresent: !!port,
        userPresent: !!user,
        fromPresent: !!from,
        env: process.env.NODE_ENV,
      });
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      // Vérifie la connexion au serveur SMTP (utile en debug)
      try {
        await transporter.verify();
        logger.info('SMTP transporter verified successfully', { host, port, secure });
      } catch (verifyErr: unknown) {
        const message = verifyErr instanceof Error ? verifyErr.message : 'Unknown error';
        logger.error('SMTP transporter verification failed', { message, host, port, secure });
        if (process.env.NODE_ENV !== 'development') {
          throw verifyErr as Error;
        }
      }

      await transporter.sendMail({
        from,
        to: email,
        subject: 'Confirmation de votre compte',
        text: `Cliquez sur ce lien pour confirmer : https://example.com/confirm/${confirmationToken}`,
      });
      logger.info('Confirmation email sent (or queued) successfully', { to: email });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const stack = err instanceof Error ? err.stack : undefined;
      // En développement, ne pas bloquer le flux d'inscription si l'email échoue
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to send confirmation email (dev mode, ignored)', { message, stack, err });
        return;
      }
      // En production, relancer l'erreur pour un traitement approprié
      throw err as Error;
    }
  }
}
