import { z } from 'zod';

export const OrganizationSearchParamsSchema = z.object({
  search: z.string().optional(),
  type: z.union([
    z.string(),
    z.array(z.string()),
  ]).optional().transform((val) => {
    // Normaliser en tableau pour supporter plusieurs types
    if (Array.isArray(val)) {
      return val.length > 0 ? val : undefined;
    }
    return val ? [val] : undefined;
  }),
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
  dateRange: z.enum(['recent', 'month', 'custom']).optional(),
  customDate: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(['name', 'type', 'status', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const OrganizationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  status: z.enum(['ACTIF', 'EN_ATTENTE', 'INACTIF', 'SUSPENDU']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const PaginatedOrganizationsResponseSchema = z.object({
  organizations: z.array(OrganizationResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const OrganizationTypesResponseSchema = z.array(z.string());

export type OrganizationSearchParamsType = z.infer<typeof OrganizationSearchParamsSchema>;
export type OrganizationResponseType = z.infer<typeof OrganizationResponseSchema>;
export type PaginatedOrganizationsResponseType = z.infer<typeof PaginatedOrganizationsResponseSchema>;
export type OrganizationTypesResponseType = z.infer<typeof OrganizationTypesResponseSchema>;
