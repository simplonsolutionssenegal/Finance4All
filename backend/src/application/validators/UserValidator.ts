import { z } from 'zod';
import { UserRole, UserStatus } from '../../domain/entities/User';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const CreateUserSchema = z.object({
  email: z
    .string()
    .email('Format d\'email invalide')
    .min(1, 'Email requis'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      passwordRegex,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    ),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'),
  role: z
    .nativeEnum(UserRole)
    .optional()
    .default(UserRole.BENEFICIAIRE),
  status: z
    .nativeEnum(UserStatus)
    .optional()
    .default(UserStatus.ACTIF),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;