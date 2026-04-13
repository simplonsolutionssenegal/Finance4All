export enum BeneficiaryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export interface Beneficiary {
  id: string;
  clerkUserId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: 'HOMME' | 'FEMME';
  status: BeneficiaryStatus;
  progressPercent: number;
  createdAt: string;
}
export interface BeneficiaryRole {
  id: string;
  role: string;
  description: string;
}
