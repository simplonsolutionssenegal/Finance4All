import { DomainEntity } from '@/domain/shared/Entity';
import { EntityId } from '@/domain/shared/EntityId';

// Test implementation of DomainEntity
class TestEntity extends DomainEntity<EntityId> {
  constructor(id: EntityId) {
    super(id);
  }
}

class StringIdEntity extends DomainEntity<string> {
  constructor(id: string) {
    super(id);
  }
}

describe('DomainEntity', () => {
  describe('constructor', () => {
    it('should create entity with id and timestamps', () => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);

      expect(entity.id).toBe(id);
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it('should set createdAt and updatedAt to current time', () => {
      const before = new Date();
      const id = EntityId.generate();
      const entity = new TestEntity(id);
      const after = new Date();

      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should work with string IDs', () => {
      const entity = new StringIdEntity('test-id-123');

      expect(entity.id).toBe('test-id-123');
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('id getter', () => {
    it('should return the entity id', () => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);

      expect(entity.id).toBe(id);
      expect(entity.id.getValue()).toBe(id.getValue());
    });
  });

  describe('createdAt getter', () => {
    it('should return the creation timestamp', () => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);

      expect(entity.createdAt).toBeInstanceOf(Date);
    });

    it('should remain constant after creation', done => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);
      const initialCreatedAt = entity.createdAt;

      setTimeout(() => {
        expect(entity.createdAt).toEqual(initialCreatedAt);
        done();
      }, 10);
    });
  });

  describe('updatedAt getter', () => {
    it('should return the update timestamp', () => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);

      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it('should initially equal createdAt', () => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);

      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(entity.createdAt.getTime());
      // They should be very close (within 1ms)
      expect(Math.abs(entity.updatedAt.getTime() - entity.createdAt.getTime())).toBeLessThan(10);
    });
  });

  describe('equals', () => {
    it('should return true for entities with same id object', () => {
      const id = EntityId.generate();
      const entity1 = new TestEntity(id);
      const entity2 = new TestEntity(id);

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for entities with different ids', () => {
      const entity1 = new TestEntity(EntityId.generate());
      const entity2 = new TestEntity(EntityId.generate());

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const entity = new TestEntity(EntityId.generate());

      expect(entity.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const entity = new TestEntity(EntityId.generate());

      expect(entity.equals(undefined as any)).toBe(false);
    });

    it('should work with string ID entities', () => {
      const entity1 = new StringIdEntity('same-id');
      const entity2 = new StringIdEntity('same-id');
      const entity3 = new StringIdEntity('different-id');

      expect(entity1.equals(entity2)).toBe(true);
      expect(entity1.equals(entity3)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow direct modification of id', () => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);

      expect(entity.id).toBe(id);
      // ID should remain the same
      expect(entity.id.getValue()).toBe(id.getValue());
    });

    it('should not allow direct modification of createdAt', () => {
      const id = EntityId.generate();
      const entity = new TestEntity(id);
      const originalCreatedAt = entity.createdAt;

      expect(entity.createdAt).toEqual(originalCreatedAt);
    });
  });
});
