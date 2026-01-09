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
  generateTempPassword: boolean;
}

export interface UpdateBeneficiaryCommand {
  organizationId: string;
  beneficiaryId: string;

  firstName?: string;
  lastName?: string;
  phone?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateBeneficiaryResult {
  beneficiary: Beneficiary;
  tempPassword?: string;
}

export class Beneficiary {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly clerkUserId: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public phone: string | null,
    public status: BeneficiaryStatus,
    public progressPercent: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
