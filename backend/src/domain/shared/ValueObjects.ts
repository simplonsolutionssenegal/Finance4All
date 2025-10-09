export abstract class ValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.validate(value);
    this.value = value;
  }

  protected abstract validate(value: T): void;

  getValue(): T {
    return this.value;
  }

  equals(vo: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    return JSON.stringify(this.value) === JSON.stringify(vo.value);
  }
}
