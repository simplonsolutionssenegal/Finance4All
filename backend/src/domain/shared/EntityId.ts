import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '@/domain/shared/ValueObjects';

export class EntityId extends ValueObject<string> {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  protected validate(value: string): void {
    if (!value || !EntityId.UUID_REGEX.test(value)) {
      throw new Error('Invalid InstitutionId format');
    }
  }

  static generate(): EntityId {
    return new EntityId(uuidv4());
  }

  static from(value: string): EntityId {
    return new EntityId(value);
  }
}
