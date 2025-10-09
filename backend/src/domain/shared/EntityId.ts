import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { ValueObject } from '@/domain/shared/ValueObjects';

export class EntityId extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value || !uuidValidate(value)) {
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
