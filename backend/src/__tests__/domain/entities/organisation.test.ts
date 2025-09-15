import { Organisation } from '@/domain/entities/Organisation';

describe('Organisation entity', () => {
  it('constructs with defaults', () => {
    const org = new Organisation(1, 'Acme', '1 Road', '000', null);
    expect(org.id).toBe(1);
    expect(org.name).toBe('Acme');
    expect(org.address).toBe('1 Road');
    expect(org.phone).toBe('000');
    expect(org.avatar).toBeNull();
    expect(org.createdAt).toBeInstanceOf(Date);
    expect(org.updatedAt).toBeInstanceOf(Date);
  });
});
