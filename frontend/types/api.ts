/**
 * Types génériques pour les API
 * 
 * Ce fichier contient les types et interfaces génériques réutilisables
 * pour toutes les interactions avec l'API.
 */

// Type générique pour les réponses d'API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Type générique pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Métadonnées de pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Types pour les paramètres de pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Types pour la gestion des erreurs
export interface ApiError {
  message: string;
  code?: string | number;
  field?: string;
  details?: Record<string, unknown>;
}

// Types pour les filtres génériques
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}