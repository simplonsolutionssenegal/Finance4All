export default interface OrganizationUser {
  id: string;
  fullName: string;
  role: string;
  emailAddress: string;
  phoneNumber?: string;
  organizationName?: string;
  organizationType?: string;
  createAt: Date | null;
  lastActiveAt?: Date | null;
  status: string;
}
