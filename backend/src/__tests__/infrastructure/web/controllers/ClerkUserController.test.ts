import { ClerkUserController } from '../../../../infrastructure/web/controllers/ClerkUserController';
import { Request, Response } from 'express';

const mockUseCase = {
  execute: jest.fn(),
};

const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response & { status: jest.Mock; json: jest.Mock };
  return res;
};

describe('ClerkUserController.register', () => {
  let controller: ClerkUserController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ClerkUserController(mockUseCase as any);
  });

  it('returns 400 on validation error', async () => {
    const req = {
      body: {
        // missing clerkId, firstName, lastName will fail zod validation
        email: 'bad-email',
      },
    } as unknown as Request;
    const res = createMockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.any(Object) }),
    );
  });

  it('returns 201 on success and maps response fields', async () => {
    const req = {
      body: {
        clerkId: 'clrk_123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    } as unknown as Request;
    const res = createMockRes();

    mockUseCase.execute.mockResolvedValueOnce({
      message: 'ok',
      user: {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'BENEFICIAIRE',
        status: 'ACTIF',
        clerkId: 'clrk_123',
      },
    });

    await controller.register(req, res);

    expect(mockUseCase.execute).toHaveBeenCalledWith({
      clerkId: 'clrk_123',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'BENEFICIAIRE',
      status: 'ACTIF',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ email: 'john.doe@example.com', clerkId: 'clrk_123' }),
      }),
    );
  });
});
