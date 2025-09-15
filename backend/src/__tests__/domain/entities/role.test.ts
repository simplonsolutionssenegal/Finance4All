import { Role } from '@/domain/entities/Role';

describe('Role entity', () => {
  it('constructs with defaults', () => {
    const role = new Role(1, 'ADMIN');
    expect(role.id).toBe(1);
    expect(role.name).toBe('ADMIN');
    expect(role.createdAt).toBeInstanceOf(Date);
    expect(role.updatedAt).toBeInstanceOf(Date);
  });
});
