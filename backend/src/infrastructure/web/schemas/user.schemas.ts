import { z } from 'zod';

export const UserSearchParamsSchema = z.object({
  search: z.string().optional(),
  status: z.union([
    z.string(),
    z.array(z.string()),
  ]).optional().transform((val) => {
    // Normaliser en tableau pour supporter plusieurs status
    if (Array.isArray(val)) {
      return val.length > 0 ? val : undefined;
    }
    return val ? [val] : undefined;
  }),
  roleId: z.union([
    z.string(),
    z.array(z.string()),
  ]).optional().transform((val) => {
    // Normaliser en tableau pour supporter plusieurs rôles
    if (Array.isArray(val)) {
      return val.length > 0 ? val : undefined;
    }
    return val ? [val] : undefined;
  }),
  organizationId: z.union([
    z.string(),
    z.array(z.string()),
  ]).optional().transform((val) => {
    // Normaliser en tableau pour supporter plusieurs organisations
    if (Array.isArray(val)) {
      return val.length > 0 ? val : undefined;
    }
    return val ? [val] : undefined;
  }),
  dateRange: z.enum(['recent', 'month', 'custom']).optional(),
  customDate: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(['username', 'firstName', 'lastName', 'email', 'createdAt']).optional().default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['ACTIF', 'EN_ATTENTE', 'INACTIF', 'SUSPENDU']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const PaginatedUsersResponseSchema = z.object({
  users: z.array(UserResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const UserTypesResponseSchema = z.array(z.string());

export type UserSearchParamsType = z.infer<typeof UserSearchParamsSchema>;
export type UserResponseType = z.infer<typeof UserResponseSchema>;
export type PaginatedUsersResponseType = z.infer<typeof PaginatedUsersResponseSchema>;
export type UserTypesResponseType = z.infer<typeof UserTypesResponseSchema>;
