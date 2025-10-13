import type { Service } from './Service';

export interface CreateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
}

export interface UpdateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
}

export interface Institution {
  id: string;
  name: string;
  description: string;
  website: string;
  geographicZones: string[];
  logoUrl: string;
  status: InstitutionStatus;
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

export enum InstitutionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
