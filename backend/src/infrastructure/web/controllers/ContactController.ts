import type { Request, Response } from 'express';

import { sendContactEmail } from '@/infrastructure/utils/emailService';

type AttemptEntry = {
  count: number;
  windowStart: number;
};

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000;
const attemptsStore = new Map<string, AttemptEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

function buildAttemptKey(req: Request, email: string): string {
  return `${getClientIp(req)}:${email.toLowerCase()}`;
}

function getAttemptState(key: string): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const existing = attemptsStore.get(key);

  if (!existing) {
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }

  if (now - existing.windowStart > WINDOW_MS) {
    attemptsStore.delete(key);
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - existing.count);
  return { blocked: remaining <= 0, remaining };
}

function consumeAttempt(key: string): number {
  const now = Date.now();
  const existing = attemptsStore.get(key);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    attemptsStore.set(key, { count: 1, windowStart: now });
    return MAX_ATTEMPTS - 1;
  }

  existing.count += 1;
  attemptsStore.set(key, existing);
  return Math.max(0, MAX_ATTEMPTS - existing.count);
}

export class ContactController {
  async sendEmail(req: Request, res: Response): Promise<void> {
    const { firstName, lastName, email, phone, country, subject, message } = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      country: string;
      subject: string;
      message: string;
    };

    const key = buildAttemptKey(req, email);
    const state = getAttemptState(key);

    if (state.blocked) {
      res.status(429).json({
        success: false,
        message: 'Limite de tentatives atteinte. Réessayez plus tard.',
        attemptsRemaining: 0,
      });
      return;
    }

    const attemptsRemaining = consumeAttempt(key);

    try {
      await sendContactEmail({
        firstName,
        lastName,
        email,
        phone,
        country,
        subject,
        message,
      });

      res.status(200).json({
        success: true,
        message: 'Message envoyé avec succès.',
        attemptsRemaining,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi du message.",
        attemptsRemaining,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
