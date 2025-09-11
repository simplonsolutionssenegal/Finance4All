// backend/src/domain/entities/User.ts
import { UserStatus } from '@prisma/client';
import { Role } from './Role';
import { Organisation } from './Organisation'; // ✅ au lieu de '@prisma/client'

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly username: string,
    public readonly firstName: string ,
    public readonly lastName: string ,
    public readonly avatar: string | null,
    public readonly password: string,
    public readonly isActive: boolean,
    public readonly role: Role,                  // ✅ domaine
    public readonly status: UserStatus,
    public readonly lastLoginAt: Date | null,
    public readonly organisationId: number | null,
    public readonly organisation: Organisation | null, // ✅ domaine
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.username;
  }

  isActiveUser(): boolean {
    return this.isActive && this.status === 'ACTIF';
  }
}
