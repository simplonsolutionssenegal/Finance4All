/**
 * Tracks chapter completion locally via localStorage.
 * A chapter is marked as "viewed" when a user visits it.
 * This is used alongside quiz progress to calculate overall module progression.
 */

const STORAGE_KEY = 'f4a_chapter_progress';

interface ChapterProgressStore {
  [chapterId: string]: {
    viewedAt: string;
  };
}

function getStore(): ChapterProgressStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: ChapterProgressStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // silently ignore storage errors
  }
}

/**
 * Mark a chapter as viewed by the user.
 */
export function markChapterViewed(chapterId: string): void {
  const store = getStore();
  if (!store[chapterId]) {
    store[chapterId] = { viewedAt: new Date().toISOString() };
    saveStore(store);
  }
}

/**
 * Check if a chapter has been viewed.
 */
export function isChapterViewed(chapterId: string): boolean {
  const store = getStore();
  return !!store[chapterId];
}

/**
 * Get all viewed chapter IDs.
 */
export function getViewedChapterIds(): Set<string> {
  const store = getStore();
  return new Set(Object.keys(store));
}
