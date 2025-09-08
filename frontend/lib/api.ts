import { z } from 'zod';

// Schéma de validation zod
export const ApiResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  message: z.string(),
  data: z.object({
    success: z.boolean(),
  }),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Endpoints
  ENDPOINTS: {
    FORGOT_PASSWORD: `/api/${process.env.API_VERSION ?? 'v1'}/forgot-password`,
  },
} as const;

//Construit l'URL complète pour un endpoint donné
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Headers par défaut pour les requêtes API
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;
