import { Request, Response } from 'express';
import { ClerkService} from '@/infrastructure/services/ClerkService';

interface FinalizeRegistrationRequest {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organisationId?: string | null;
}

export class AuthController {
  private clerkService: ClerkService;

  constructor() {
    this.clerkService = new ClerkService();
  }

  private isValidFinalizeRegistrationRequest(body: unknown): body is FinalizeRegistrationRequest {
    if (typeof body !== 'object' || body === null) {
      return false;
    }

    const obj = body as Record<string, unknown>;
    
    return (
      typeof obj.clerkUserId === 'string' && obj.clerkUserId.length > 0 &&
      typeof obj.email === 'string' && obj.email.length > 0 &&
      (typeof obj.firstName === 'string' || typeof obj.firstName === 'undefined') && obj.firstName !== null &&
      (typeof obj.lastName === 'string' || typeof obj.lastName === 'undefined') && obj.lastName !== null &&
      (typeof obj.organisationId === 'string' || typeof obj.organisationId === 'undefined' || obj.organisationId === null)
    );
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.warn('🚀 POST /api/v1/users/register called');
      console.warn('📨 Request body:', req.body);
      
      const body = req.body as unknown;
      
      if (!this.isValidFinalizeRegistrationRequest(body)) {
        console.warn('❌ Invalid request format');
        res.status(400).json({
          success: false,
          error: { message: 'Format de requête invalide' },
        });
        return;
      }

      const { clerkUserId, email, firstName, lastName, organisationId } = body;
      console.warn('✅ Request validated, processing:', { clerkUserId, email, firstName, lastName, organisationId });

      if (!clerkUserId || !email) {
        console.warn('❌ Missing required fields');
        res.status(400).json({
          success: false,
          error: { message: 'clerkUserId et email sont requis' },
        });
        return;
      }

      console.warn('🔄 Calling ClerkService.finalizeRegistration...');
      const result = await this.clerkService.finalizeRegistration(clerkUserId, {
        email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        organisationId: organisationId ?? undefined,
      });
      
      console.warn('✅ ClerkService.finalizeRegistration completed:', result);

      res.status(200).json({
        success: true,
        data: result.user,
      });
    } catch (error: unknown) {
      console.error('Error in finalizeRegistration controller:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la finalisation';
      res.status(400).json({
        success: false,
        error: { message },
      });
    }
  }

}
