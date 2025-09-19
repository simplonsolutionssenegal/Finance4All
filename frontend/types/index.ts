/**
 * Types centralisés pour l'application
 * 
 * Point d'entrée unique pour tous les types de l'application,
 * facilitant les imports et la maintenance.
 */

// Export des types d'API génériques
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  PaginationParams,
  ApiError,
  FilterParams,
} from './api';

// Export des types d'institutions
export type {
  CreateInstitutionPayload,
  InstitutionCreatedResponse,
  InstitutionListItem,
  FetchInstitutionsResult,
} from './institutions';

// Export des types de formulaires
export type {
  FormState,
  ValidationResult,
  ValidationError,
  FormField,
  SelectOption,
  FileUpload,
  FormStep,
  MultiStepFormState,
} from './forms';

// Types communs pour les composants UI
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Types pour les messages de notification
export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}