import { z } from 'zod';

export const createBeneficiarySchema = z.object({
  firstName: z.string().min(1, 'firstName requis'),
  lastName: z.string().min(1, 'lastName requis'),
  email: z.string().email('email invalide'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['HOMME', 'FEMME']).optional(),
  generateTempPassword: z.boolean().optional(),
});

export const updateBeneficiarySchema = z.object({
  organizationId: z.string().min(1, 'organizationId requis'),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  gender: z.enum(['HOMME', 'FEMME']).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
