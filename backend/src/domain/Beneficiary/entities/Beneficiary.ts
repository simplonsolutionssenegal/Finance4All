export enum BeneficiaryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
export interface CreateBeneficiaryCommand {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: 'HOMME' | 'FEMME';
  generateTempPassword: boolean;
}

export interface SelfRegisterBeneficiaryCommand {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: 'HOMME' | 'FEMME';
}

export interface UpdateBeneficiaryCommand {
  organizationId: string;
  beneficiaryId: string;

  firstName?: string;
  lastName?: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: 'HOMME' | 'FEMME' | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateBeneficiaryResult {
  beneficiary: Beneficiary;
  tempPassword?: string;
}

export class Beneficiary {
  constructor(
    public readonly id: string,
    public readonly organizationId: string | null,
    public readonly clerkUserId: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public phone: string | null,
    public birthDate: Date | null,
    public gender: 'HOMME' | 'FEMME' | null,
    public status: BeneficiaryStatus,
    public progressPercent: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
