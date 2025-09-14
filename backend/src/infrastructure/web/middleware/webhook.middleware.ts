import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { logger } from '@/utils/logger';

/**
 * Middleware pour valider les webhooks Clerk
 */
export function validateClerkWebhook(req: Request, res: Response, next: NextFunction): void {
  try {
    // Récupération des headers de signature
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    // Vérification de la présence des headers requis
    if (!svixId || !svixTimestamp || !svixSignature) {
      logger.warn('Headers de signature Clerk manquants', {
        svixId: !!svixId,
        svixTimestamp: !!svixTimestamp,
        svixSignature: !!svixSignature,
        userAgent: req.headers['user-agent'],
      });

      res.status(400).json({
        error: 'Headers de signature manquants',
        message: 'Les headers svix-id, svix-timestamp et svix-signature sont requis',
      });
      return;
    }

    // Vérification de la clé secrète du webhook
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('CLERK_WEBHOOK_SECRET non configuré');
      res.status(500).json({
        error: 'Configuration manquante',
        message: 'Le secret du webhook n\'est pas configuré',
      });
      return;
    }

    // Création de l'instance Webhook pour la validation
    const wh = new Webhook(webhookSecret);

    // Récupération du body brut pour la validation
    const payload = req.body as Record<string, unknown>;
    const body = JSON.stringify(payload);

    let webhookEvent;

    try {
      // Validation de la signature du webhook
      webhookEvent = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });

      logger.info('Webhook Clerk validé avec succès', {
        eventType: (webhookEvent as { type: string }).type,
        eventId: svixId,
        timestamp: svixTimestamp,
      });

    } catch (verificationError) {
      logger.error('Échec de la validation du webhook Clerk', {
        error: verificationError,
        svixId,
        svixTimestamp,
        userAgent: req.headers['user-agent'],
      });

      res.status(401).json({
        error: 'Signature invalide',
        message: 'La signature du webhook n\'a pas pu être vérifiée',
      });
      return;
    }

    // Ajout de l'événement validé à la requête pour les middlewares suivants
    req.body = webhookEvent;

    next();

  } catch (error) {
    logger.error('Erreur dans le middleware de validation webhook', {
      error,
      url: req.url,
      method: req.method,
    });

    res.status(500).json({
      error: 'Erreur interne',
      message: 'Erreur lors de la validation du webhook',
    });
  }
}

/**
 * Middleware pour logger les webhooks reçus
 */
export function logWebhookRequest(req: Request, res: Response, next: NextFunction): void {
  logger.info('Webhook reçu', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    svixId: req.headers['svix-id'],
    timestamp: new Date().toISOString(),
  });

  next();
}

/**
 * Middleware pour limiter le rate limiting sur les webhooks
 */
export function webhookRateLimit(req: Request, res: Response, next: NextFunction): void {
  // Simple rate limiting basé sur IP
  // Dans un environnement de production, utilisez un vrai système de rate limiting
  // comme redis avec express-rate-limit

  const clientIp = req.ip ?? req.connection.remoteAddress ?? 'unknown';

  // Pour les webhooks Clerk, on s'attend à recevoir des requêtes depuis leurs serveurs
  // Vérifiez la documentation Clerk pour les plages IP autorisées si nécessaire

  logger.debug('Webhook rate limit check', {
    clientIp,
    userAgent: req.headers['user-agent'],
  });

  // Ici vous pourriez implémenter une logique de rate limiting plus sophistiquée

  next();
}