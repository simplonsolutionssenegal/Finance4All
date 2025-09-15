import { formatZodIssues } from '@/application/validators/UserValidator';

describe('formatZodIssues', () => {
  it('joins messages with comma and space', () => {
    const result = formatZodIssues([{ message: 'a' }, { message: 'b' }, { message: 'c' }]);
    expect(result).toBe('a, b, c');
  });

  it('handles empty array', () => {
    const result = formatZodIssues([]);
    expect(result).toBe('');
  });
});
