import { User } from '@/domain/entities/User';
import { UserStatus } from '@prisma/client';

export type LastLoginFilter =
  | { type: 'recent' }
  | { type: 'last_month' }
  | { type: 'custom_date'; date: Date };

export interface GetUsersByOrganisationAndStatusUseCase {
  execute(
    organisationId: number,
    statuses: UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<User[]>;
}
