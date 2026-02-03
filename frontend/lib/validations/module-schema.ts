// frontend/src/lib/validations/module-schema.ts

import { z } from 'zod';

import { DifficultyLevel } from '@/types/modules/module';

export const createModuleSchema = z.object({
  title: z
    .string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(5000, 'La description ne peut pas dépasser 5000 caractères'),

  imageUrl: z.string().url("L'URL de l'image doit être valide").optional().or(z.literal('')),

  difficultyLevel: z.nativeEnum(DifficultyLevel),

  estimatedDuration: z
    .number()
    .min(5, 'La durée minimale est de 5 minutes')
    .max(10080, 'La durée maximale est de 7 jours'),

  thematics: z
    .string()
    .min(3, 'Doit contenir au moins 3 caractères')
    .max(100, 'Ne peut pas dépasser 100 caractères'),
});

export type CreateModuleFormData = z.infer<typeof createModuleSchema>;
