import { ValueObject } from '@/domain/shared/ValueObjects';

export class UrlValueObject extends ValueObject<string | null> {
  protected validate(value: string | null): void {
    if (value === null) return;

    try {
      new URL(value);
    } catch {
      throw new Error('Invalid website URL format');
    }
  }

  static from(value: string | null): UrlValueObject {
    return new UrlValueObject(value);
  }
}
