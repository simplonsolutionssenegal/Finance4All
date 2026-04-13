import {
  markChapterViewed,
  isChapterViewed,
  getViewedChapterIds,
} from '@/lib/learning/chapter-progress';

const STORAGE_KEY = 'f4a_chapter_progress';

describe('chapter-progress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('markChapterViewed', () => {
    it('should store entry in localStorage', () => {
      markChapterViewed('chapter-1');

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();

      const store = JSON.parse(raw!);
      expect(store['chapter-1']).toBeDefined();
      expect(store['chapter-1'].viewedAt).toBeDefined();
    });

    it('should not overwrite existing entry', () => {
      markChapterViewed('chapter-1');

      const raw = localStorage.getItem(STORAGE_KEY);
      const firstViewedAt = JSON.parse(raw!)['chapter-1'].viewedAt;

      markChapterViewed('chapter-1');

      const rawAfter = localStorage.getItem(STORAGE_KEY);
      const secondViewedAt = JSON.parse(rawAfter!)['chapter-1'].viewedAt;

      expect(secondViewedAt).toBe(firstViewedAt);
    });
  });

  describe('isChapterViewed', () => {
    it('should return true for viewed chapter', () => {
      markChapterViewed('chapter-1');
      expect(isChapterViewed('chapter-1')).toBe(true);
    });

    it('should return false for unviewed chapter', () => {
      expect(isChapterViewed('chapter-99')).toBe(false);
    });
  });

  describe('getViewedChapterIds', () => {
    it('should return set of all viewed IDs', () => {
      markChapterViewed('chapter-1');
      markChapterViewed('chapter-2');
      markChapterViewed('chapter-3');

      const ids = getViewedChapterIds();

      expect(ids).toBeInstanceOf(Set);
      expect(ids.size).toBe(3);
      expect(ids.has('chapter-1')).toBe(true);
      expect(ids.has('chapter-2')).toBe(true);
      expect(ids.has('chapter-3')).toBe(true);
    });
  });

  describe('getStore', () => {
    it('should return empty object when localStorage is empty', () => {
      const ids = getViewedChapterIds();
      expect(ids.size).toBe(0);
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json{{{');

      const ids = getViewedChapterIds();
      expect(ids.size).toBe(0);
    });
  });

  describe('saveStore', () => {
    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => markChapterViewed('chapter-1')).not.toThrow();

      setItemSpy.mockRestore();
    });
  });
});
