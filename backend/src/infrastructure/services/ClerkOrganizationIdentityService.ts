import type { OrganizationIdentityPort } from '@/domain/Beneficiary/ports/out/OrganizationIdentityPort';
import { clerkClient } from '@clerk/express';

export class ClerkOrganizationIdentityService implements OrganizationIdentityPort {
  async upsertUser(params: {
    email: string;
    firstName: string;
    lastName: string;
    tempPassword?: string;
  }) {
    const found = await clerkClient.users.getUserList({ emailAddress: [params.email] });
    let u = found.data?.[0];

    if (!u) {
      u = await clerkClient.users.createUser({
        emailAddress: [params.email],
        firstName: params.firstName,
        lastName: params.lastName,
        ...(params.tempPassword ? { password: params.tempPassword } : {}),
      });
    }

    return { clerkUserId: u.id };
  }

  async ensureMembership(params: {
    organizationId: string;
    clerkUserId: string;
    role: 'org:recipient';
  }) {
    try {
      await clerkClient.organizations.createOrganizationMembership({
        organizationId: params.organizationId,
        userId: params.clerkUserId,
        role: params.role,
      });
    } catch {
      // déjà membre → ignore
    }
  }
}
