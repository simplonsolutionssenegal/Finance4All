import { Router, Request, Response } from 'express';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { logger } from '@/utils/logger';
import { sendInvitationEmail } from '@/utils/emailService';
import { logWebhookRequest, webhookRateLimit } from '../middleware/webhook.middleware';

// Interface pour les données d'invitation Clerk
interface ClerkInvitationData {
  id: string;
  email_address: string;
  organization_id?: string; // ID de l'organisation
  organization?: {
    id?: string;
    name: string;
  };
  role?: string;
  created_by?: {
    email_addresses?: {
      email_address: string;
    }[];
  };
}

const router = Router();

// Webhook endpoint pour les événements Clerk avec middlewares de sécurité
router.post(
  '/clerk',
  logWebhookRequest,
  webhookRateLimit,
  // validateClerkWebhook, // Désactivé temporairement pour les tests locaux
  async (req: Request, res: Response) => {
    try {
      // Récupération du payload du webhook
      const webhookEvent = req.body as WebhookEvent;

      logger.info('Webhook Clerk reçu', {
        type: webhookEvent.type,
        eventId: webhookEvent.data?.id,
      });

      // Traitement des événements d'invitation
      switch (webhookEvent.type) {
        case 'organizationInvitation.created':
          await handleInvitationCreated(webhookEvent);
          break;

        case 'organizationInvitation.accepted':
          logger.info('Invitation acceptée', {
            invitationId: webhookEvent.data?.id,
            email: (webhookEvent.data as ClerkInvitationData)?.email_address,
          });
          break;

        case 'organizationInvitation.revoked':
          logger.info('Invitation révoquée', {
            invitationId: webhookEvent.data?.id,
            email: (webhookEvent.data as ClerkInvitationData)?.email_address,
          });
          break;

        default:
          logger.info('Événement webhook non traité', { type: webhookEvent.type });
      }

      // Réponse de succès
      res.status(200).json({ message: 'Webhook traité avec succès' });
    } catch (error) {
      logger.error('Erreur lors du traitement du webhook Clerk', { error });
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: 'Impossible de traiter le webhook',
      });
    }
  },
);

// Fonction pour traiter la création d'invitation
async function handleInvitationCreated(webhookEvent: WebhookEvent): Promise<void> {
  try {
    const invitationData = webhookEvent.data as ClerkInvitationData;

    // Debug: Log de toutes les données reçues
    logger.info('Données complètes du webhook:', {
      type: webhookEvent.type,
      data: JSON.stringify(webhookEvent.data, null, 2),
    });

    if (!invitationData?.email_address) {
      logger.error('Email manquant dans l\'événement d\'invitation');
      return;
    }

    const emailAddress = invitationData.email_address;
    const organizationName = invitationData.organization?.name ?? 'Finance4All';
    const role = invitationData.role ?? 'member';
    const inviterEmail = invitationData.created_by?.email_addresses?.[0]?.email_address;

    logger.info('Traitement invitation créée', {
      email: emailAddress,
      organization: organizationName,
      role,
      inviter: inviterEmail,
    });

    // Récupérer l'ID de l'organisation
    let organizationId =
      invitationData.organization_id ||
      invitationData.organization?.id ||
      (webhookEvent.data as any)?.organization_id;

    // Si on n'a toujours pas l'organizationId, on peut essayer de l'extraire de l'invitationId
    // Les IDs d'invitation Clerk contiennent parfois l'orgId en préfixe
    if (!organizationId && invitationData.id) {
      // L'ID semble avoir un format comme "orginv_XXXXX" mais ça ne nous donne pas l'orgId
      // On va plutôt essayer une approche différente via l'API Clerk
      logger.warn('organizationId non trouvé dans le webhook, il sera récupéré côté frontend');
    }

    logger.info('IDs récupérés', {
      invitationId: invitationData.id,
      organizationId,
      organization_id_direct: invitationData.organization_id,
      organization_id_nested: invitationData.organization?.id,
    });

    // Envoi de l'email personnalisé
    await sendInvitationEmail({
      recipientEmail: emailAddress,
      organizationName,
      role,
      inviterEmail,
      invitationId: invitationData.id,
      organizationId,
    });

    logger.info('Email d\'invitation envoyé avec succès', {
      recipient: emailAddress,
    });
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'invitation créée', {
      error,
      eventData: webhookEvent.data,
    });
    throw error;
  }
}

export default router;
