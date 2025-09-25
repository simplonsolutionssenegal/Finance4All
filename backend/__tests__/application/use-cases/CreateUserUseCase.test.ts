import type { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { User } from '@/domain/entities/User';

describe.skip('CreateUserUseCase Interface', () => {
  it('should define the correct contract', () => {
    // This test ensures the interface structure is correct
    const mockImplementation: CreateUserUseCase = {
      execute: jest.fn().mockResolvedValue(new User('1', 'Test User', 'test@example.com')),
    };

    expect(mockImplementation.execute).toBeDefined();
    expect(typeof mockImplementation.execute).toBe('function');
  });

  it('should have execute method with correct signature', async () => {
    const mockUser = new User('1', 'Test User', 'test@example.com');

    const mockImplementation: CreateUserUseCase = {
      execute: jest.fn().mockResolvedValue(mockUser),
    };

    const result = await mockImplementation.execute('Test User', 'test@example.com');

    expect(mockImplementation.execute).toHaveBeenCalledWith('Test User', 'test@example.com');
    expect(result).toEqual(mockUser);
    expect(result.name).toBe('Test User');
    expect(result.email).toBe('test@example.com');
  });
});
