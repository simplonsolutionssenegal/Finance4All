import {
  PAGINATION_DEFAULTS,
  validatePaginationInput,
  createPaginationMeta,
  createPaginatedResult,
  type PaginatedResult,
} from '@/utils/pagination'; // ← adapte le chemin si différent

describe('pagination utils', () => {
  describe('validatePaginationInput', () => {
    it('retourne les valeurs par défaut quand input vide', () => {
      const { page, limit, skip } = validatePaginationInput({});
      expect(page).toBe(PAGINATION_DEFAULTS.DEFAULT_PAGE); // couvre DEFAULT_PAGE
      expect(limit).toBe(PAGINATION_DEFAULTS.DEFAULT_LIMIT); // couvre DEFAULT_LIMIT
      expect(skip).toBe(0); // (1 - 1) * 10
    });

    it('force MIN_PAGE quand page < MIN_PAGE', () => {
      const { page, limit, skip } = validatePaginationInput({ page: 0, limit: 5 });
      expect(page).toBe(PAGINATION_DEFAULTS.DEFAULT_PAGE); // branche !input.page || page < MIN_PAGE
      expect(limit).toBe(5);
      expect(skip).toBe(0);
    });

    it('prend la page fournie quand valide', () => {
      const { page, limit, skip } = validatePaginationInput({ page: 3, limit: 10 });
      expect(page).toBe(3);
      expect(limit).toBe(10);
      expect(skip).toBe(20); // (3 - 1) * 10
    });

    it('force MIN_LIMIT quand limit < MIN_LIMIT', () => {
      const { page, limit, skip } = validatePaginationInput({ page: 2, limit: 0 });
      expect(page).toBe(2);
      expect(limit).toBe(PAGINATION_DEFAULTS.MIN_LIMIT); // branche limit < MIN_LIMIT
      expect(skip).toBe((2 - 1) * PAGINATION_DEFAULTS.MIN_LIMIT);
    });

    it('force MAX_LIMIT quand limit > MAX_LIMIT', () => {
      const { page, limit, skip } = validatePaginationInput({
        page: 2,
        limit: PAGINATION_DEFAULTS.MAX_LIMIT + 1,
      });
      expect(page).toBe(2);
      expect(limit).toBe(PAGINATION_DEFAULTS.MAX_LIMIT); // branche limit > MAX_LIMIT
      expect(skip).toBe((2 - 1) * PAGINATION_DEFAULTS.MAX_LIMIT);
    });

    it('garde limit quand MIN_LIMIT ≤ limit ≤ MAX_LIMIT', () => {
      const { page, limit, skip } = validatePaginationInput({ page: 4, limit: 37 });
      expect(page).toBe(4);
      expect(limit).toBe(37); // branche else (limit fournie valide)
      expect(skip).toBe((4 - 1) * 37);
    });

    it('ne touche pas limit par défaut quand limit est undefined (mais page définie)', () => {
      const { page, limit, skip } = validatePaginationInput({ page: 5 });
      expect(page).toBe(5);
      expect(limit).toBe(PAGINATION_DEFAULTS.DEFAULT_LIMIT); // branche if (!input.limit)
      expect(skip).toBe((5 - 1) * PAGINATION_DEFAULTS.DEFAULT_LIMIT);
    });
  });

  describe('createPaginationMeta', () => {
    it('calcule totalPages au moins 1 et les flags next/prev', () => {
      // totalItems < limit → totalPages = 1
      const meta1 = createPaginationMeta(1, 10, 3);
      expect(meta1.totalPages).toBe(1); // Math.max(1, ceil(3/10))
      expect(meta1.hasNextPage).toBe(false);
      expect(meta1.hasPrevPage).toBe(false);

      // totalItems > limit → totalPages > 1
      const meta2 = createPaginationMeta(2, 10, 25);
      expect(meta2.totalPages).toBe(3); // ceil(25/10)
      expect(meta2.hasNextPage).toBe(true); // 2 < 3
      expect(meta2.hasPrevPage).toBe(true); // 2 > 1
    });
  });

  describe('createPaginatedResult', () => {
    it('retourne PaginatedResult<T> cohérent avec meta', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result: PaginatedResult<{ id: number }> = createPaginatedResult(data, 3, 10, 25);
      expect(result.data).toEqual(data);
      expect(result.meta.page).toBe(3);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalItems).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(false); // 3 !< 3
      expect(result.meta.hasPrevPage).toBe(true); // 3 > 1
    });
  });
});
