// src/infrastructure/clerk/ClerkUserRepository.ts
import { clerkClient } from '@clerk/express';
import { ClerkUser as DomainUser } from './model/clerkUserModel';
import { UserRepository } from '@/domain/repositories/UserRepository';
import type { User as  User } from '@clerk/backend';
import { LastLoginFilter } from '@/types/lastLoginFilter';

export class ClerkUserRepository implements UserRepository {

  private mapClerkUserToDomain(u: User, organisationId?: number): DomainUser {
    return new DomainUser({
      id: u.id,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      emailAddresses: u.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
      publicMetadata: {
        organisation_id: organisationId ?? (u.publicMetadata?.organisation_id as number | undefined),
        role: (u.publicMetadata?.role as string) ?? null,
      },
      lastSignInAt: u.lastSignInAt ?? undefined,
      lastActiveAt: u.lastActiveAt ?? undefined,
    });
  }



  async findByOrganisationId(organisationId: number): Promise<DomainUser[]> {
    const users = await clerkClient.users.getUserList({ limit: 100 });
    const filtered = users.data.filter(
      (u) => u.publicMetadata?.organisation_id === organisationId,
    );
    return filtered.map((u) => this.mapClerkUserToDomain(u, organisationId));
  }

  async findAll(): Promise<DomainUser[]> {
    const users = await clerkClient.users.getUserList({ limit: 100 });
    return users.data.map((u) => this.mapClerkUserToDomain(u));
  }

  async findById(userId: string): Promise<DomainUser | null> {
    const u = await clerkClient.users.getUser(userId);
    if (!u) return null;
    return this.mapClerkUserToDomain(u);
  }


  async findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter,
  ): Promise<DomainUser[]> {
    const users = await clerkClient.users.getUserList({ limit: 1000 });

    let result = users.data
      .map(u => this.mapClerkUserToDomain(u))
      .filter(u => u.organisationId === organisationId);

    // Filtrer par status
    if (statuses.length > 0) {
      result = result.filter(u => statuses.includes(u.status));
    }

    // Filtrer par role
    if (roles && roles.length > 0) {
      result = result.filter(u => u.role && roles.includes(u.role));
    }

    // Filtrer par lastLogin
    if (lastLoginFilter) {
      const now = new Date();
      result = result.filter(u => {
        const login = u.lastSignInAt;
        if (!login) return false;

        if (lastLoginFilter.type === 'recent') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return login >= sevenDaysAgo;
        } else if (lastLoginFilter.type === 'last_month') {
          const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const firstOfPrevMonth = new Date(
            now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
            now.getMonth() === 0 ? 11 : now.getMonth() - 1,
            1,
          );
          return login >= firstOfPrevMonth && login < firstOfThisMonth;
        } else if (lastLoginFilter.type === 'custom_date') {
          const nextDay = new Date(lastLoginFilter.date.getTime() + 24 * 60 * 60 * 1000);
          return login >= lastLoginFilter.date && login < nextDay;
        }
        return true;
      });
    }

    return result;
  }
}
