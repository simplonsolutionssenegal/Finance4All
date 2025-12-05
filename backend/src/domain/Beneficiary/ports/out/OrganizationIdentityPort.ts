export interface OrganizationIdentityPort {
  upsertUser(params: {
    email: string;
    firstName: string;
    lastName: string;
    tempPassword?: string;
  }): Promise<{ clerkUserId: string }>;

  ensureMembership(params: {
    organizationId: string;
    clerkUserId: string;
    role: 'org:recipient';
  }): Promise<void>;
}
