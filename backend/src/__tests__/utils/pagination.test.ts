import {
  validatePaginationInput,
  createPaginationMeta,
  createPaginatedResult,
  PAGINATION_DEFAULTS,
} from '@/utils/pagination';

describe('Pagination Utils', () => {
  describe('validatePaginationInput', () => {
    it('should use default values for invalid inputs', () => {
      const result = validatePaginationInput({});

      expect(result.page).toBe(PAGINATION_DEFAULTS.DEFAULT_PAGE);
      expect(result.limit).toBe(PAGINATION_DEFAULTS.DEFAULT_LIMIT);
      expect(result.skip).toBe(0);
    });

    it('should clamp page to minimum value', () => {
      const result = validatePaginationInput({ page: 0 });

      expect(result.page).toBe(PAGINATION_DEFAULTS.MIN_PAGE);
    });

    it('should clamp limit to maximum value', () => {
      const result = validatePaginationInput({ limit: 1000 });

      expect(result.limit).toBe(PAGINATION_DEFAULTS.MAX_LIMIT);
    });

    it('should calculate skip correctly', () => {
      const result = validatePaginationInput({ page: 3, limit: 10 });

      expect(result.skip).toBe(20); // (3-1) * 10
    });

    it('should accept valid inputs', () => {
      const result = validatePaginationInput({ page: 2, limit: 25 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
      expect(result.skip).toBe(25);
    });
  });

  describe('createPaginationMeta', () => {
    it('should create correct metadata for first page', () => {
      const meta = createPaginationMeta(1, 10, 25);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should create correct metadata for middle page', () => {
      const meta = createPaginationMeta(2, 10, 25);

      expect(meta).toEqual({
        page: 2,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should create correct metadata for last page', () => {
      const meta = createPaginationMeta(3, 10, 25);

      expect(meta).toEqual({
        page: 3,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should handle single page correctly', () => {
      const meta = createPaginationMeta(1, 10, 5);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should handle empty results', () => {
      const meta = createPaginationMeta(1, 10, 0);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });

  describe('createPaginatedResult', () => {
    it('should create complete paginated result', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginatedResult(data, 1, 10, 25);

      expect(result.data).toBe(data);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalItems).toBe(25);
    });
  });
});
