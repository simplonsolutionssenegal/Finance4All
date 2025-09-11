import { User } from '../entities/User';

export interface UserSearchParams {
  search?: string;
  status?: string[];
  roleId?: string[];
  organizationId?: string[];
  dateRange?: 'recent' | 'month' | 'custom';
  customDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'username' | 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsersResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserRepository {
  getAllUsers(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  searchUsers(params: UserSearchParams): Promise<PaginatedUsersResult>;
}
