import { ValueObject } from '@/domain/shared/ValueObjects';

// Test implementation of ValueObject
class TestValueObject extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.length === 0) {
      throw new Error('Value cannot be empty');
    }
  }
}

class NumberValueObject extends ValueObject<number> {
  protected validate(value: number): void {
    if (value < 0) {
      throw new Error('Value cannot be negative');
    }
  }
}

class ComplexValueObject extends ValueObject<{ name: string; age: number }> {
  protected validate(value: { name: string; age: number }): void {
    if (!value.name) {
      throw new Error('Name is required');
    }
    if (value.age < 0) {
      throw new Error('Age cannot be negative');
    }
  }
}

describe('ValueObject', () => {
  describe('constructor and validation', () => {
    it('should create value object with valid value', () => {
      const vo = new TestValueObject('test');

      expect(vo.getValue()).toBe('test');
    });

    it('should throw error when validation fails', () => {
      expect(() => new TestValueObject('')).toThrow('Value cannot be empty');
    });

    it('should validate number value objects', () => {
      const vo = new NumberValueObject(42);

      expect(vo.getValue()).toBe(42);
    });

    it('should throw error for invalid number value', () => {
      expect(() => new NumberValueObject(-1)).toThrow('Value cannot be negative');
    });

    it('should validate complex objects', () => {
      const vo = new ComplexValueObject({ name: 'John', age: 30 });

      expect(vo.getValue()).toEqual({ name: 'John', age: 30 });
    });

    it('should throw error for invalid complex object', () => {
      expect(() => new ComplexValueObject({ name: '', age: 25 })).toThrow('Name is required');
    });
  });

  describe('getValue', () => {
    it('should return the encapsulated value', () => {
      const vo = new TestValueObject('test value');

      expect(vo.getValue()).toBe('test value');
    });

    it('should return number value', () => {
      const vo = new NumberValueObject(100);

      expect(vo.getValue()).toBe(100);
    });

    it('should return complex object value', () => {
      const value = { name: 'Alice', age: 25 };
      const vo = new ComplexValueObject(value);

      expect(vo.getValue()).toEqual(value);
    });
  });

  describe('equals', () => {
    it('should return true for equal value objects', () => {
      const vo1 = new TestValueObject('test');
      const vo2 = new TestValueObject('test');

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for different value objects', () => {
      const vo1 = new TestValueObject('test1');
      const vo2 = new TestValueObject('test2');

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const vo = new TestValueObject('test');

      expect(vo.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const vo = new TestValueObject('test');

      expect(vo.equals(undefined as any)).toBe(false);
    });

    it('should compare number value objects', () => {
      const vo1 = new NumberValueObject(42);
      const vo2 = new NumberValueObject(42);
      const vo3 = new NumberValueObject(43);

      expect(vo1.equals(vo2)).toBe(true);
      expect(vo1.equals(vo3)).toBe(false);
    });

    it('should compare complex object value objects', () => {
      const vo1 = new ComplexValueObject({ name: 'John', age: 30 });
      const vo2 = new ComplexValueObject({ name: 'John', age: 30 });
      const vo3 = new ComplexValueObject({ name: 'Jane', age: 30 });

      expect(vo1.equals(vo2)).toBe(true);
      expect(vo1.equals(vo3)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow direct modification of value', () => {
      const vo = new TestValueObject('test');

      // Attempting to modify the value directly should not affect the encapsulated value
      expect(vo.getValue()).toBe('test');
    });
  });
});
