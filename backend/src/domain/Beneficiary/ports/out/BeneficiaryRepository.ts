import type { Beneficiary } from '../../entities/Beneficiary';

export interface DemographicStats {
  total: number;
  women: number;
  youth: number;
  inTraining: number;
}

export interface BeneficiaryRepository {
  getDemographicStats(organizationId?: string): Promise<DemographicStats>;
  findByClerkUserId(clerkUserId: string): Promise<Beneficiary | null>;
  findByOrgId(organizationId: string): Promise<Beneficiary[]>;
  findByOrgAndEmail(organizationId: string, email: string): Promise<Beneficiary | null>;
  findByIdInOrg(organizationId: string, beneficiaryId: string): Promise<Beneficiary | null>;
  deleteByIdAndOrgId(beneficiaryId: string, organizationId: string): Promise<boolean>;

  findByEmail(email: string): Promise<Beneficiary | null>;

  create(input: {
    organizationId?: string | null;
    clerkUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    birthDate?: Date | null;
    gender?: 'HOMME' | 'FEMME' | null;
  }): Promise<Beneficiary>;

  updateInOrg(input: {
    organizationId: string;
    beneficiaryId: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    birthDate?: Date | null;
    gender?: 'HOMME' | 'FEMME' | null;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<Beneficiary>;
}
