import { Organisation } from '@prisma/client';
import { Role } from './role.entity';

export class User {
  constructor(

    public readonly id: number,
    public readonly email: string,
    public readonly username: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly avatar: string | null,
    public readonly password: string,
    public readonly isActive: boolean,
    public readonly role: Role,
    public readonly organisationId: number | null,
    public readonly organisation: Organisation | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) { }
}
