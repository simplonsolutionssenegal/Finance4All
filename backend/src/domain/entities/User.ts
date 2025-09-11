export interface Role {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public firstName: string | null,
    public lastName: string | null,
    public roleId: string,
    public organizationId: string | null,
    public status?: string,
    public lastLoginAt?: Date | null,
    public createdAt?: Date,
    public updatedAt?: Date,
    public role?: Role,
    public organization?: Organization | null,
  ) {}
}
