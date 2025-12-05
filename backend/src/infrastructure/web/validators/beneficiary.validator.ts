import { z } from 'zod';

export const createBeneficiarySchema = z.object({
  firstName: z.string().min(1, 'firstName requis'),
  lastName: z.string().min(1, 'lastName requis'),
  email: z.string().email('email invalide'),
  phone: z.string().optional(),
  generateTempPassword: z.boolean().optional(),
});

export const updateBeneficiarySchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
