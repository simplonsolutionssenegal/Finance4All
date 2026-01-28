import type { Beneficiary } from '../../entities/Beneficiary';

export interface BeneficiaryRepository {
  findByClerkUserId(clerkUserId: string): Promise<Beneficiary | null>;
  findByOrgId(organizationId: string): Promise<Beneficiary[]>;
  findByOrgAndEmail(organizationId: string, email: string): Promise<Beneficiary | null>;
  findByIdInOrg(organizationId: string, beneficiaryId: string): Promise<Beneficiary | null>;
  deleteByIdAndOrgId(beneficiaryId: string, organizationId: string): Promise<boolean>;

  create(input: {
    organizationId: string;
    clerkUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  }): Promise<Beneficiary>;

  updateInOrg(input: {
    organizationId: string;
    beneficiaryId: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<Beneficiary>;
}
