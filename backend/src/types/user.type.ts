import { z } from 'zod';
import { Role } from '@/types/index';

export const createUserSchema = z.object({
  email: z.email('Invalid email format').transform(val => val.toLowerCase().trim()),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens and underscores'
    )
    .transform(val => val.toLowerCase().trim()),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .transform(val => val.trim())
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .transform(val => val.trim())
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  avatar: z.url({ message: 'Invalid avatar URL' }).optional(),
  role: z.enum(Role).optional().default(Role.USER)
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens and underscores'
    )
    .toLowerCase()
    .trim()
    .optional(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim()
    .optional(),
  avatar: z.url({ message: 'Invalid avatar URL' }).optional(),
  isActive: z.boolean().optional()
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string()
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords don\'t match',
    path: ['confirmPassword']
  });

// Types pour les réponses
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  isActive: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Types pour les requêtes avec pagination
export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
}
