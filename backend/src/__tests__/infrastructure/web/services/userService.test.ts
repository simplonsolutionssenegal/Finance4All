import { UserService } from '@/infrastructure/web/services/userService';

describe('UserService.signUp', () => {
  it('concatenates names and delegates to use case', async () => {
    const execute = jest.fn().mockResolvedValue({ id: 1 });
    const createUserUseCase = { execute } as any;
    const service = new UserService(createUserUseCase);

    const input = {
      email: 'john@example.com',
      password: 'Password1!',
      lastName: 'Doe',
      firstName: 'John',
      role: 'BENEFICIAIRE',
      status: 'ACTIF',
    } as any;

    await service.signUp(input);
    expect(execute).toHaveBeenCalledWith('John Doe', 'john@example.com');
  });
});
