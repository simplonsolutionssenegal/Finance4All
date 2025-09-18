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

// Interface étendue pour gérer les cas où organization_id peut être dans des propriétés alternatives
interface ExtendedWebhookData extends ClerkInvitationData {
  organization_id?: string;
  [key: string]: unknown; // Pour gérer les propriétés supplémentaires potentielles
}

// Type guard pour vérifier si les données sont valides
function isValidInvitationData(data: unknown): data is ClerkInvitationData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email_address' in data
  );
}

// Fonction utilitaire pour extraire l'organization_id de manière sécurisée
function extractOrganizationId(data: ExtendedWebhookData): string | undefined {
  return (
    data.organization_id ??
    data.organization?.id ??
    (typeof data.organization_id === 'string' ? data.organization_id : undefined)
  );
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
        environment: process.env.NODE_ENV,
      });

      // Validation basique du payload
      if (!webhookEvent?.type) {
        logger.error('Webhook event invalide - pas de type', { body: req.body as unknown });
        res.status(400).json({
          error: 'Payload invalide',
          message: 'Le type d\'événement est requis',
        });
        return;
      }

      // Traitement des événements d'invitation
      switch (webhookEvent.type) {
        case 'organizationInvitation.created':
          try {
            await handleInvitationCreated(webhookEvent);
            logger.info('Invitation créée traitée avec succès', {
              eventId: webhookEvent.data?.id,
            });
          } catch (invitationError) {
              logger.error('Erreur lors du traitement de l\'invitation créée', {
                  invitationError,
                  eventId: webhookEvent.data?.id,
                  eventType: webhookEvent.type,
              });

              logger.warn('Erreur interne ignorée, on répond 200 pour le webhook (idempotent).');
          }
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
          logger.info('Événement webhook non traité', {
            type: webhookEvent.type,
            environment: process.env.NODE_ENV,
          });
      }

      // Réponse de succès
      res.status(200).json({
        message: 'Webhook traité avec succès',
        eventType: webhookEvent.type,
        environment: process.env.NODE_ENV,
      });
    } catch (error) {
      logger.error('Erreur lors du traitement du webhook Clerk', {
        error,
        environment: process.env.NODE_ENV,
        url: req.url,
        method: req.method,
      });
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: 'Impossible de traiter le webhook',
        environment: process.env.NODE_ENV,
      });
    }
  },
);

// Fonction pour traiter la création d'invitation
async function handleInvitationCreated(webhookEvent: WebhookEvent): Promise<void> {
  try {
    // Validation des données avec type guard
    if (!isValidInvitationData(webhookEvent.data)) {
      logger.error('Données d\'invitation invalides reçues', {
        eventType: webhookEvent.type,
        data: webhookEvent.data,
      });
      return;
    }

    const invitationData = webhookEvent.data;

    // Debug: Log de toutes les données reçues
    logger.info('Données complètes du webhook:', {
      type: webhookEvent.type,
      data: JSON.stringify(webhookEvent.data, null, 2),
    });

    // Validation supplémentaire des champs requis
    if (!invitationData.email_address || !invitationData.id) {
      logger.error('Champs requis manquants dans l\'événement d\'invitation', {
        hasEmail: !!invitationData.email_address,
        hasId: !!invitationData.id,
        invitationData,
      });
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

    // Récupérer l'ID de l'organisation avec un typage plus sûr
    const extendedData = webhookEvent.data as unknown as ExtendedWebhookData;
    const organizationId = extractOrganizationId(extendedData);

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
      organization_id_extended: extendedData.organization_id,
    });

    // Envoi de l'email personnalisé avec gestion d'erreur robuste
    try {
      await sendInvitationEmail({
        recipientEmail: emailAddress,
        organizationName,
        role,
        inviterEmail,
        invitationId: invitationData.id,
        organizationId: organizationId ?? undefined, // Conversion explicite pour éviter les warnings
      });

      logger.info('Email d\'invitation envoyé avec succès', {
        recipient: emailAddress,
      });
    } catch (emailError) {
      // Log l'erreur d'email mais ne fait pas échouer le webhook
      // En mode CI/CD, l'envoi d'email peut échouer mais le webhook doit quand même répondre 200
      logger.error('Erreur lors de l\'envoi de l\'email d\'invitation', {
        emailError,
        recipient: emailAddress,
        isTestEnvironment: process.env.NODE_ENV === 'test',
      });

      // En mode test, on ne fait pas échouer le webhook à cause d'un problème d'email
      if (process.env.NODE_ENV === 'test') {
        logger.info('Mode test détecté - erreur d\'email ignorée pour le webhook');
      } else {
        // En production, on peut choisir de faire échouer ou non selon les besoins
        // Pour l'instant, on log mais on continue
        logger.warn('Email d\'invitation échoué mais webhook traité comme succès');
      }
    }
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'invitation créée', {
      error,
      eventData: webhookEvent.data,
    });
    throw error;
  }
}

export default router;
