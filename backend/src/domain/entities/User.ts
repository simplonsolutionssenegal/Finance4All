import { Organisation } from './Organisation';

export enum UserStatus {
  ACTIF = 'ACTIF',
  EN_ATTENTE = 'EN_ATTENTE',
  INACTIF = 'INACTIF',
  SUSPENDU = 'SUSPENDU',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  BENEFICIAIRE = 'BENEFICIAIRE',
}

export class User {
  constructor(
    public id: number,
    public email: string,
    public password: string | null,
    public firstName: string,
    public lastName: string,
    public status: UserStatus,
    public isActive: boolean,
    public lastLoginAt: Date,
    public createdAt: Date,
    public updatedAt: Date,
    public role: UserRole,
    public avatar?: string | null,
    public organisationId?: number | null,
    public username?: string | null,
    public clerkId?: string | null,

    // Relations
    public organisation?: Organisation
  ) {}
}

export interface CreateUserData {
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateClerkUserData {
  email: string;
  clerkId: string;
  lastName: string;
  firstName: string;
  role: UserRole;
  status: UserStatus;
}
