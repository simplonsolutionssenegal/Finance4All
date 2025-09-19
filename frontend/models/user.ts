// frontend/models/user.ts

// User "clean" (utilisé côté front)
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role?: string; 
  status: 'ACTIF' | 'INACTIF' | 'EN_ATTENTE';
  avatar?: string;
  isActive: boolean;
  lastSignInAt: string | null;
  organisationId: number;
  createdAt: string;
  updatedAt: string;
}

// DTO tel que renvoyé par le backend
export interface BackendUserDto {
  id: string | number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  status: 'ACTIF' | 'INACTIF' | 'EN_ATTENTE';
  avatar?: string | null;
  isActive: boolean;
  lastSignInAt: string | null;
  organisationId: number;
  createdAt: string;
  updatedAt: string;
  role?: string | null;
  publicMetadata?: {
    role?: string;
  };
}

// générique API
export type ApiResponse<T> = { 
  status: 'success' | 'error'; 
  results: number; 
  data: T[] 
};
