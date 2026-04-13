import {
  createStringOptions,
  createEntityOptions,
  filterDropdownOptions,
  findDropdownOptionByValue,
} from '@/lib/dropdown-utils';

interface DropdownOption<T> {
  id: string;
  name: string;
  value: T;
  icon?: string;
  description?: string;
}

describe('dropdown-utils', () => {
  describe('createStringOptions', () => {
    it('should generate correct IDs (lowercase, spaces to hyphens)', () => {
      const options = createStringOptions(['Hello World', 'Foo Bar Baz']);

      expect(options).toEqual([
        { id: 'hello-world', name: 'Hello World', value: 'Hello World' },
        { id: 'foo-bar-baz', name: 'Foo Bar Baz', value: 'Foo Bar Baz' },
      ]);
    });

    it('should handle empty array', () => {
      const options = createStringOptions([]);
      expect(options).toEqual([]);
    });
  });

  describe('createEntityOptions', () => {
    const entities = [
      { id: '1', name: 'Alpha', icon: 'icon-a', description: 'First entity' },
      { id: '2', name: 'Beta', icon: 'icon-b', description: 'Second entity' },
    ];

    it('should map entities correctly', () => {
      const options = createEntityOptions(entities);

      expect(options).toHaveLength(2);
      expect(options[0].id).toBe('1');
      expect(options[0].name).toBe('Alpha');
      expect(options[0].value).toBe(entities[0]);
    });

    it('should include icon and description fields when specified', () => {
      const options = createEntityOptions(entities, 'icon', 'description');

      expect(options[0].icon).toBe('icon-a');
      expect(options[0].description).toBe('First entity');
      expect(options[1].icon).toBe('icon-b');
      expect(options[1].description).toBe('Second entity');
    });

    it('should omit icon and description when not specified', () => {
      const options = createEntityOptions(entities);

      expect(options[0].icon).toBeUndefined();
      expect(options[0].description).toBeUndefined();
    });
  });

  describe('filterDropdownOptions', () => {
    const options: DropdownOption<string>[] = [
      { id: '1', name: 'Apple', value: 'apple', description: 'A fruit' },
      { id: '2', name: 'Banana', value: 'banana', description: 'Yellow fruit' },
      { id: '3', name: 'Carrot', value: 'carrot', description: 'A vegetable' },
    ];

    it('should return all options when searchTerm is empty', () => {
      const result = filterDropdownOptions(options, '');
      expect(result).toEqual(options);
    });

    it('should filter by name', () => {
      const result = filterDropdownOptions(options, 'ban');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Banana');
    });

    it('should filter by description', () => {
      const result = filterDropdownOptions(options, 'vegetable');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Carrot');
    });
  });

  describe('findDropdownOptionByValue', () => {
    const options: DropdownOption<string>[] = [
      { id: '1', name: 'Apple', value: 'apple' },
      { id: '2', name: 'Banana', value: 'banana' },
    ];

    it('should find matching option', () => {
      const result = findDropdownOptionByValue(options, 'banana');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Banana');
    });

    it('should return undefined when not found', () => {
      const result = findDropdownOptionByValue(options, 'cherry');
      expect(result).toBeUndefined();
    });
  });
});
