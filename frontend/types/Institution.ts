import type { Service } from './Service';

export type InstitutionType =
  | 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE'
  | 'PORTEFEUILLE_NUMERIQUE'
  | 'SERVICE_PAIEMENT_ELECTRONIQUE'
  | 'BANQUE_NUMERIQUE'
  | 'SERVICE_FINANCIER_DECENTRALISE'
  | 'SERVICE_FINANCEMENT_PARTICIPATIF'
  | 'SERVICE_INVESTISSEMENT'
  | 'SERVICE_GESTION_FINANCIERE'
  | 'SERVICE_ASSURANCE_NUMERIQUE';

export type Country = 'SENEGAL' | 'CAMEROUN';

export interface CreateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
  type: InstitutionType;
  pays: Country;
}

export interface UpdateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
  type: InstitutionType;
  pays: Country;
}

export interface Institution {
  id: string;
  name: string;
  description: string;
  website: string;
  geographicZones: string[];
  logoUrl: string;
  status: InstitutionStatus;
  type: InstitutionType;
  pays: Country;
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  archived: number;
}

export enum InstitutionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
