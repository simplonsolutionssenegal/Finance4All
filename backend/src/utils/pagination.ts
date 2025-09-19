/**
 * Types et utilitaires génériques pour la pagination
 */

export interface PaginationInput {
  page?: number; // 1-based
  limit?: number; // items per page
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginatedRepositoryResult<T> {
  data: T[];
  total: number;
}

/**
 * Interface générique pour les repositories supportant la pagination
 */
export interface PaginatedRepository<T> {
  findPaginated(skip: number, limit: number): Promise<PaginatedRepositoryResult<T>>;
}

/**
 * Configuration par défaut de la pagination
 */
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
};

/**
 * Valide et normalise les paramètres de pagination
 */

export function validatePaginationInput(input: PaginationInput): {
  page: number;
  limit: number;
  skip: number;
} {
  const page =
    input.page == null || input.page < PAGINATION_DEFAULTS.MIN_PAGE
      ? PAGINATION_DEFAULTS.DEFAULT_PAGE
      : input.page;

  // ← ICI : on ne teste plus la “véracité” de input.limit,
  // on vérifie s’il est défini, puis on borne entre MIN et MAX.
  const rawLimit = input.limit;
  let limit = PAGINATION_DEFAULTS.DEFAULT_LIMIT;

  if (rawLimit != null) {
    // accepte 0 comme valeur fournie
    if (rawLimit < PAGINATION_DEFAULTS.MIN_LIMIT) {
      limit = PAGINATION_DEFAULTS.MIN_LIMIT;
    } else if (rawLimit > PAGINATION_DEFAULTS.MAX_LIMIT) {
      limit = PAGINATION_DEFAULTS.MAX_LIMIT;
    } else {
      limit = rawLimit;
    }
  }

  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Crée les métadonnées de pagination
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Utilitaire générique pour créer un résultat paginé
 */
export function createPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number,
): PaginatedResult<T> {
  return {
    data,
    meta: createPaginationMeta(page, limit, totalItems),
  };
}
