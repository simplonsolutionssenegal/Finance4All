export enum UserRole {
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
    BENEFICIAIRE = 'BENEFICIAIRE',
  }
  
  export enum UserStatus {
    ACTIF = 'ACTIF',
    EN_ATTENTE = 'EN_ATTENTE',
    INACTIF = 'INACTIF',
    SUSPENDU = 'SUSPENDU',
  }
  
  export interface ClerkRegisterInput {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    status?: UserStatus;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
      code: string;
      message: string;
    };
  }