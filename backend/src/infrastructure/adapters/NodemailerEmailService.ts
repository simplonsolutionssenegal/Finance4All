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

    const appName = process.env.APP_NAME ?? 'Finance4All';
    const loginUrl = process.env.LOGIN_URL ?? 'http://localhost:3000/login';
    const primary = '#14b8a6'; // proche de var(--primary-200)
    const primaryDark = '#0f766e'; // proche de var(--primary-400)

    const plainText =
      `${appName} - Confirmation de votre compte\n\n` +
      `Bonjour,\n\n` +
      `Votre compte a été créé avec succès.\n` +
      `Email: ${email}\n` +
      `Identifiant de confirmation: ${confirmationToken}\n\n` +
      `Vous pouvez maintenant vous connecter: ${loginUrl}\n\n` +
      `Si le bouton ne fonctionne pas, copiez/collez le lien dans votre navigateur.`;

    const html = `
      <div style="background-color:#f5f7fb;padding:24px;margin:0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:20px 24px;background:${primaryDark};color:#ffffff;">
              <div style="font-weight:700;font-size:20px;letter-spacing:0.2px;">
                <span style="color:#ffffff;">${appName}</span>
              </div>
              <div style="font-size:13px;color:#d1fae5;">Inscription réussie</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px 24px;">
              <h1 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:#111827;">Bienvenue !</h1>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#4b5563;">
                Votre compte a été créé avec succès. Voici vos informations de connexion:
              </p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin-bottom:16px;">
                <p style="margin:0;font-size:14px;line-height:22px;color:#111827;"><strong>Email:</strong> ${email}</p>
                <p style="margin:6px 0 0 0;font-size:12px;line-height:18px;color:#6b7280;">Utilisez le mot de passe que vous avez choisi lors de l'inscription.</p>
              </div>

              <div style="text-align:center;margin:24px 0 16px 0;">
                <a href="${loginUrl}"
                   style="display:inline-block;background:${primary};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">
                  Se connecter
                </a>
              </div>       
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;background:#fafafa;">
              <p style="margin:0;font-size:12px;line-height:18px;color:#9ca3af;">Cet email vous a été envoyé par ${appName}. Ne répondez pas à ce message.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

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
        subject: `${appName} - Confirmation de votre compte`,
        text: plainText,
        html,
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
