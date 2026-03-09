import { FAQ_CATEGORIES } from '../../../types/utils/faq/faq.categories';
import { HELP_FAQ_ITEMS } from '../../../types/utils/faq/faq.index';
import type { HelpFaqCategory } from '../../../types/utils/faq/faq.type';

describe('faq.index', () => {
  it('includes all five categories in aggregated faq items', () => {
    const categorySet = new Set<HelpFaqCategory>(HELP_FAQ_ITEMS.map(item => item.category));
    const expected = Object.values(FAQ_CATEGORIES);

    expect(expected).toHaveLength(5);
    expected.forEach(category => expect(categorySet.has(category)).toBe(true));
  });

  it('contains expected total item count and unique ids', () => {
    expect(HELP_FAQ_ITEMS).toHaveLength(19);

    const ids = HELP_FAQ_ITEMS.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ensures each item has non-empty question and answer', () => {
    HELP_FAQ_ITEMS.forEach(item => {
      expect(item.question.trim().length).toBeGreaterThan(0);
      expect(item.answer.trim().length).toBeGreaterThan(0);
    });
  });
});
