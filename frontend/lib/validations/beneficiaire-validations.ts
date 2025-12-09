import { z } from 'zod';

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(v => !v || v.startsWith('+'), 'Téléphone invalide (ex: +221...)')
  .refine(
    v => !v || v.startsWith('+221') || v.startsWith('+237') || v.startsWith('+'),
    'Téléphone invalide (ex: +221..., +237...)'
  );

export const createBeneficiarySchema = z.object({
  organizationId: z.string().min(1, 'Organisation requise'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: phoneSchema,
  generateTempPassword: z.boolean(),
  role: z.literal('org:recipient').optional(),
});

export const updateBeneficiarySchema = z.object({
  id: z.string().min(1, 'ID requis'),
  organizationId: z.string().min(1, 'Organisation requise'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().trim().optional().nullable(),
});

export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>;
export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>;

export type BeneficiaryFieldName = 'firstName' | 'lastName' | 'email' | 'phone';
export type BeneficiaryFieldErrors = Partial<Record<BeneficiaryFieldName, string>>;
export function zodErrorsToFieldErrors(error: z.ZodError): BeneficiaryFieldErrors {
  const out: BeneficiaryFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === 'firstName' || key === 'lastName' || key === 'email' || key === 'phone') {
      // Ne remplace pas si une erreur existe déjà pour ce champ (garde la première)
      if (!out[key]) {
        out[key] = issue.message;
      }
    }
  }
  return out;
}
