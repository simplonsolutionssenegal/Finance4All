import { z } from 'zod';
import { UserRole, UserStatus } from '../../domain/entities/User';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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

const emailSchema = z.string().email('Format email invalide').min(1, 'Email requis');

export const CreateUserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      passwordRegex,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  lastName: nameSchema('Nom'),
  firstName: nameSchema('Prénom'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.BENEFICIAIRE),
  status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIF),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const ClerkRegisterSchema = z.object({
  clerkId: z.string().min(1, 'clerkId requis'),
  email: emailSchema,
  lastName: nameSchema('Nom'),
  firstName: nameSchema('Prénom'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.BENEFICIAIRE),
  status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIF),
});

export type ClerkRegisterInput = z.infer<typeof ClerkRegisterSchema>;

export function formatZodIssues(issues: { message: string }[]): string {
  return issues.map(i => i.message).join(', ');
}
