import nodemailer from 'nodemailer';
import { logger } from './logger';

export interface InvitationEmailData {
  recipientEmail: string;
  organizationName: string;
  role: string;
  inviterEmail?: string;
  invitationId?: string;
  organizationId?: string;
}

/**
 * Service d'envoi d'emails pour les invitations
 */
export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialise le transporteur Gmail SMTP
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      // Vérification des variables d'environnement Gmail
      const gmailUser = process.env.GMAIL_USER;
      const gmailPassword = process.env.GMAIL_APP_PASSWORD;

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
        secure: true,
        logger: false,
        debug: process.env.NODE_ENV === 'development',
      });

      logger.info('Transporteur Gmail initialisé', {
        user: gmailUser?.replace(/@.*/, '@***'),
      });
    }

    return this.transporter;
  }

  /**
   * Envoie un email d'invitation personnalisé
   */
  static async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    try {
      const emailContent = this.generateInvitationEmailContent(data);
      const transporter = this.getTransporter();

      logger.info("Envoi d'email d'invitation", {
        recipient: data.recipientEmail,
        organization: data.organizationName,
        role: data.role,
        inviter: data.inviterEmail,
        subject: emailContent.subject,
      });

      // Configuration de l'email
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME ?? 'Finance4All',
          address: process.env.FROM_EMAIL ?? process.env.GMAIL_USER ?? 'noreply@finance4all.com',
        },
        to: data.recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      };

      // Envoi de l'email
      const result = (await transporter.sendMail(mailOptions)) as {
        messageId?: string;
        response?: string;
        message?: Buffer;
      };

      // Gestion du résultat selon le type de transporteur
      if (result.messageId) {
        logger.info('Email envoyé avec succès', {
          messageId: result.messageId,
          recipient: data.recipientEmail,
          response: result.response ?? 'N/A',
        });
      } else if (result.message) {
        // Mode simulation
        logger.info('📧 EMAIL SIMULÉ (pas de configuration Gmail)', {
          recipient: data.recipientEmail,
          subject: emailContent.subject,
          preview: `${emailContent.text.substring(0, 100)}...`,
        });
      }

      logger.info("Email d'invitation envoyé avec succès", {
        recipient: data.recipientEmail,
      });
    } catch (error) {
      logger.error("Erreur lors de l'envoi de l'email d'invitation", {
        error,
        recipient: data.recipientEmail,
      });
      throw new Error(`Impossible d'envoyer l'email d'invitation: ${String(error)}`);
    }
  }

  /**
   * Génère le contenu de l'email d'invitation
   */
  private static generateInvitationEmailContent(data: InvitationEmailData): {
    subject: string;
    html: string;
    text: string;
  } {
    const { organizationName, role, inviterEmail, invitationId, organizationId } = data;

    // Génération du lien d'invitation avec les paramètres nécessaires
    const baseUrl = process.env.FRONTEND_URL ?? 'https://app.finance4all.com';

    let invitationUrl = `${baseUrl}/accept-invitation`;
    if (invitationId) {
      invitationUrl = `${baseUrl}/accept-invitation?invitation_id=${invitationId}`;
      // Ajouter org_id seulement s'il est disponible
      if (organizationId) {
        invitationUrl += `&org_id=${organizationId}`;
      }
    }

    const subject = `Invitation à rejoindre ${organizationName} sur Finance4All`;

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation Finance4All</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Vous êtes invité(e) !</h1>
            <p>Rejoignez ${organizationName} sur Finance4All</p>
          </div>
          <div class="content">
            <h2>Bonjour !</h2>
            <p>${inviterEmail ? `<strong>${inviterEmail}</strong> vous a invité(e)` : 'Vous avez été invité(e)'} à rejoindre <strong>${organizationName}</strong> sur Finance4All.</p>

            <p><strong>Votre rôle :</strong> ${this.getRoleDisplayName(role)}</p>

            <p>Finance4All est une plateforme de gestion financière qui vous permettra de :</p>
            <ul>
              <li>📊 Suivre vos finances en temps réel</li>
              <li>💰 Gérer vos budgets et dépenses</li>
              <li>🎯 Atteindre vos objectifs financiers</li>
              <li>👥 Collaborer avec votre équipe</li>
            </ul>

            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">
                Accepter l'invitation
              </a>
            </div>

            <p><em>Cette invitation est valide pendant 7 jours.</em></p>
          </div>
          <div class="footer">
            <p>Finance4All - Votre partenaire pour une gestion financière optimale</p>
            <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour !

      ${inviterEmail ? `${inviterEmail} vous a invité(e)` : 'Vous avez été invité(e)'} à rejoindre ${organizationName} sur Finance4All.

      Votre rôle : ${this.getRoleDisplayName(role)}

      Finance4All est une plateforme de gestion financière qui vous permettra de suivre vos finances, gérer vos budgets et atteindre vos objectifs financiers.

      Pour accepter cette invitation, visitez : ${invitationUrl}

      Cette invitation est valide pendant 7 jours.

      Finance4All - Votre partenaire pour une gestion financière optimale
    `;

    return { subject, html, text };
  }

  /**
   * Convertit le rôle technique en nom d'affichage
   */
  private static getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrateur',
      member: 'Membre',
      viewer: 'Observateur',
      editor: 'Éditeur',
      manager: 'Gestionnaire',
    };

    return roleMap[role] ?? role;
  }

  /**
   * Teste la connexion Gmail
   */
  static async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();

      // Si c'est un transporteur de simulation, retourner true
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        logger.info('Mode simulation - test de connexion ignoré');
        return true;
      }

      await transporter.verify();
      logger.info('Connexion Gmail vérifiée avec succès');
      return true;
    } catch (error) {
      logger.error('Échec de la vérification de la connexion Gmail', { error });
      return false;
    }
  }
}

// Export des fonctions pour faciliter l'utilisation
export const sendInvitationEmail = EmailService.sendInvitationEmail.bind(EmailService);
export const testEmailConnection = EmailService.testConnection.bind(EmailService);
