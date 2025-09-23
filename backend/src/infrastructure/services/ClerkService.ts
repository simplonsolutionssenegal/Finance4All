import { clerkClient, type EmailAddress } from '@clerk/clerk-sdk-node';
import { z } from 'zod';

// Types pour les réponses de l'API Clerk
export interface ClerkUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

// L'interface ClerkUser a été supprimée car elle n'était pas utilisée

const namePattern = /^[a-zA-ZÀ-ÿ\s'-]+$/;

function nameSchema(fieldLabel: 'Prénom' | 'Nom') {
  const minMessage =
    fieldLabel === 'Prénom'
      ? 'Le prénom doit contenir au moins 2 caractères'
      : 'Le nom doit contenir au moins 2 caractères';
  const maxMessage =
    fieldLabel === 'Prénom'
      ? 'Le prénom ne peut pas dépasser 50 caractères'
      : 'Le nom ne peut pas dépasser 50 caractères';
  const regexMessage =
    fieldLabel === 'Prénom'
      ? 'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'
      : 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets';
  return z.string().min(2, minMessage).max(50, maxMessage).regex(namePattern, regexMessage);
}

export const RegisterUserSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    ),
  firstName: nameSchema('Prénom'),
  lastName: nameSchema('Nom'),
  organisationId: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

export const VerifyEmailSchema = z.object({
  signUpId: z.string().min(1, 'ID d\'inscription requis'),
  code: z.string().min(1, 'Code de vérification requis'),
});

export const ResendVerificationEmailSchema = z.object({
  email: z.string().email('Email invalide'),
});

// Types pour les entrées des schémas
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type ResendVerificationEmailInput = z.infer<typeof ResendVerificationEmailSchema>;

export class ClerkService {

  async finalizeRegistration(clerkUserId: string, userData: {
    email: string;
    firstName: string;
    lastName: string;
    organisationId?: string | null;
  }): Promise<{ success: boolean; user?: ClerkUserResponse }> {
    try {
      console.warn('Finalizing registration for Clerk user:', clerkUserId);
      
      // Récupérer l'utilisateur Clerk existant
      const user = await clerkClient.users.getUser(clerkUserId);
      
      // Préparer les métadonnées à enregistrer
      const metadataToSave = {
        ...(user.publicMetadata as Record<string, unknown> || {}),
        role: 'BENEFICIAIRE',
        status: 'ACTIF',
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        ...(userData.organisationId && { organisationId: userData.organisationId }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      
      // Mettre à jour les métadonnées de l'utilisateur avec les données business
      const updatedUser = await clerkClient.users.updateUser(clerkUserId, {
        firstName: userData.firstName ?? user.firstName ?? '',
        lastName: userData.lastName ?? user.lastName ?? '',
        publicMetadata: metadataToSave,
      });
      

      // Récupérer l'email principal
      const primaryEmail = updatedUser.emailAddresses?.find(
        (email: EmailAddress) => email.id === updatedUser.primaryEmailAddressId,
      );

      if (!primaryEmail) {
        throw new Error('Erreur lors de la récupération des informations de l\'email');
      }

      console.warn('✅ User registration finalized successfully:', clerkUserId);

      return {
        success: true,
        user: {
          id: updatedUser.id,
          email: primaryEmail.emailAddress,
          firstName: updatedUser.firstName ?? '',
          lastName: updatedUser.lastName ?? '',
          emailVerified: true,
        },
      };
    } catch (error) {
      console.error('Error finalizing registration:', error);
      throw new Error('Erreur lors de la finalisation de l\'inscription');
    }
  }


  async getUserById(userId: string): Promise<ClerkUserResponse | null> {
    try {
      const user = await clerkClient.users.getUser(userId);
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
      
      return {
        id: user.id,
        email: primaryEmail?.emailAddress ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        emailVerified: primaryEmail?.verification?.status === 'verified',
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}

export function formatZodIssues(issues: { message: string }[]): string {
  return issues.map(i => i.message).join(', ');
}
