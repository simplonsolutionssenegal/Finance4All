import { EntityId } from '@/domain/shared/EntityId';
import { randomUUID } from 'crypto';

describe('EntityId', () => {
  describe('from', () => {
    it('should create EntityId from valid UUID', () => {
      const uuid = randomUUID();
      const entityId = EntityId.from(uuid);

      expect(entityId.getValue()).toBe(uuid);
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => EntityId.from('invalid-uuid')).toThrow('Invalid InstitutionId format');
    });

    it('should throw error for empty string', () => {
      expect(() => EntityId.from('')).toThrow('Invalid InstitutionId format');
    });

    it('should throw error for null value', () => {
      expect(() => EntityId.from(null as any)).toThrow('Invalid InstitutionId format');
    });

    it('should throw error for undefined value', () => {
      expect(() => EntityId.from(undefined as any)).toThrow('Invalid InstitutionId format');
    });
  });

  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const entityId = EntityId.generate();
      const value = entityId.getValue();

      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
      expect(value.length).toBe(36); // UUID length with dashes
      expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const entityId1 = EntityId.generate();
      const entityId2 = EntityId.generate();

      expect(entityId1.getValue()).not.toBe(entityId2.getValue());
    });

    it('should generate multiple unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(EntityId.generate().getValue());
      }

      expect(ids.size).toBe(100);
    });
  });

  describe('equals', () => {
    it('should return true for equal EntityIds', () => {
      const uuid = randomUUID();
      const entityId1 = EntityId.from(uuid);
      const entityId2 = EntityId.from(uuid);

      expect(entityId1.equals(entityId2)).toBe(true);
    });

    it('should return false for different EntityIds', () => {
      const entityId1 = EntityId.generate();
      const entityId2 = EntityId.generate();

      expect(entityId1.equals(entityId2)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the UUID value', () => {
      const uuid = randomUUID();
      const entityId = EntityId.from(uuid);

      expect(entityId.getValue()).toBe(uuid);
    });
  });
});
