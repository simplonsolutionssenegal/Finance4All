import { validatePaginationInput, type PaginationInput } from '@/utils/pagination';

// Types simplifiés pour éviter la dépendance directe à Express
interface RequestQuery {
  page?: string | undefined;
  limit?: string | undefined;
}

interface RequestLike {
  query?: RequestQuery;
}

/**
 * Extrait et valide les paramètres de pagination depuis une requête
 */
export function extractPaginationFromRequest(req: RequestLike): PaginationInput {
  const pageParam = req.query?.page;
  const limitParam = req.query?.limit;

  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  return { page, limit };
}

/**
 * Détermine si une requête contient des paramètres de pagination
 */
export function hasPaginationParams(req: RequestLike): boolean {
  const pageParam = req.query?.page;
  const limitParam = req.query?.limit;

  return pageParam !== undefined || limitParam !== undefined;
}

/**
 * Utilitaire complet pour gérer la pagination dans les contrôleurs
 */
export function handlePaginationRequest(req: RequestLike) {
  const paginationInput = extractPaginationFromRequest(req);
  const hasPagination = hasPaginationParams(req);
  const validatedParams = validatePaginationInput(paginationInput);

  return {
    input: paginationInput,
    hasPagination,
    validated: validatedParams,
  };
}
