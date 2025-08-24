export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
}
