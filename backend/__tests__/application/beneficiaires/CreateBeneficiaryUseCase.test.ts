import type { CreateBeneficiaryUseCase } from '@/application/beneficiaires/use-cases/CreateBeneficiaryUseCase';
import {
  BeneficiaryStatus,
  type CreateBeneficiaryCommand,
  type CreateBeneficiaryResult,
} from '@/domain/Beneficiary/entities/Beneficiary';

describe('CreateBeneficiaryUseCase Interface', () => {
  it('should define the correct contract for CreateBeneficiaryUseCase', () => {
    // Mock implementation to verify interface structure
    const mockUseCase: CreateBeneficiaryUseCase = {
      execute: jest.fn(),
    };

    expect(mockUseCase).toHaveProperty('execute');
    expect(typeof mockUseCase.execute).toBe('function');
  });

  it('should accept valid CreateBeneficiaryCommand', async () => {
    const mockExecute = jest.fn().mockResolvedValue({
      beneficiary: {
        id: 'ben-1',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phone: '+221771234567',
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tempPassword: 'temp123',
    } as CreateBeneficiaryResult);

    const mockUseCase: CreateBeneficiaryUseCase = {
      execute: mockExecute,
    };

    const command: CreateBeneficiaryCommand = {
      organizationId: 'org-123',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      phone: '+221771234567',
      generateTempPassword: true,
    };

    const result = await mockUseCase.execute(command);

    expect(mockExecute).toHaveBeenCalledWith(command);
    expect(result).toHaveProperty('beneficiary');
    expect(result).toHaveProperty('tempPassword');
    expect(result.beneficiary.id).toBe('ben-1');
    expect(result.tempPassword).toBe('temp123');
  });

  it('should return CreateBeneficiaryResult with beneficiary and optional tempPassword', async () => {
    const mockResult: CreateBeneficiaryResult = {
      beneficiary: {
        id: 'ben-2',
        organizationId: 'org-456',
        clerkUserId: 'clerk-456',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie@example.com',
        phone: null,
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tempPassword: undefined,
    };

    const mockExecute = jest.fn().mockResolvedValue(mockResult);

    const mockUseCase: CreateBeneficiaryUseCase = {
      execute: mockExecute,
    };

    const command: CreateBeneficiaryCommand = {
      organizationId: 'org-456',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie@example.com',
      generateTempPassword: false,
    };

    const result = await mockUseCase.execute(command);

    expect(result.beneficiary).toBeDefined();
    expect(result.beneficiary.email).toBe('marie@example.com');
    expect(result.tempPassword).toBeUndefined();
  });

  it('should handle command with all optional fields', async () => {
    const mockExecute = jest.fn().mockResolvedValue({
      beneficiary: {
        id: 'ben-3',
        organizationId: 'org-789',
        clerkUserId: 'clerk-789',
        firstName: 'Paul',
        lastName: 'Diop',
        email: 'paul@example.com',
        phone: '+221775555555',
        birthDate: null,
        gender: null,
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tempPassword: 'securePass',
    } as CreateBeneficiaryResult);

    const mockUseCase: CreateBeneficiaryUseCase = {
      execute: mockExecute,
    };

    const commandWithAllFields: CreateBeneficiaryCommand = {
      organizationId: 'org-789',
      firstName: 'Paul',
      lastName: 'Diop',
      email: 'paul@example.com',
      phone: '+221775555555',
      generateTempPassword: true,
    };

    const result = await mockUseCase.execute(commandWithAllFields);

    expect(mockExecute).toHaveBeenCalledWith(commandWithAllFields);
    expect(result.beneficiary.phone).toBe('+221775555555');
    expect(result.tempPassword).toBe('securePass');
  });

  it('should handle Promise return type correctly', () => {
    const mockExecute = jest.fn().mockResolvedValue({
      beneficiary: {} as any,
      tempPassword: undefined,
    });

    const mockUseCase: CreateBeneficiaryUseCase = {
      execute: mockExecute,
    };

    const command: CreateBeneficiaryCommand = {
      organizationId: 'org-1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      generateTempPassword: false,
    };

    const result = mockUseCase.execute(command);

    expect(result).toBeInstanceOf(Promise);
  });
});
