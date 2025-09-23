export default interface OrganizationUser {
  id: string;
  fullName: string;
  role: string;
  emailAddress: string;
  createAt: Date | null;
  status: string;
}
