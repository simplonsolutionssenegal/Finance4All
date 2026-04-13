import type { CreateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/CreateBeneficiaryUseCase';
import type {
  CreateBeneficiaryCommand,
  CreateBeneficiaryResult,
} from '@/domain/Beneficiary/entities/Beneficiary';
// eslint-disable-next-line no-duplicate-imports
import { BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';

describe('CreateBeneficiaryUseCase Port', () => {
  describe('Interface Contract', () => {
    it('should define execute method', () => {
      const mockUseCase: CreateBeneficiaryUseCase = {
        execute: jest.fn(),
      };

      expect(mockUseCase).toHaveProperty('execute');
      expect(typeof mockUseCase.execute).toBe('function');
    });

    it('should accept CreateBeneficiaryCommand', () => {
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
      });

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

      mockUseCase.execute(command);

      expect(mockExecute).toHaveBeenCalledWith(command);
    });

    it('should return Promise<CreateBeneficiaryResult>', () => {
      const mockUseCase: CreateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue({
          beneficiary: {} as any,
          tempPassword: undefined,
        }),
      };

      const command: CreateBeneficiaryCommand = {
        organizationId: 'org-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        generateTempPassword: false,
      };

      const result = mockUseCase.execute(command);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('CreateBeneficiaryCommand', () => {
    it('should have all required fields', () => {
      const command: CreateBeneficiaryCommand = {
        organizationId: 'org-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        generateTempPassword: true,
      };

      expect(command.organizationId).toBe('org-123');
      expect(command.firstName).toBe('Jean');
      expect(command.lastName).toBe('Dupont');
      expect(command.email).toBe('jean@example.com');
      expect(command.generateTempPassword).toBe(true);
    });

    it('should accept optional phone field', () => {
      const commandWithPhone: CreateBeneficiaryCommand = {
        organizationId: 'org-456',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie@example.com',
        phone: '+221771234567',
        generateTempPassword: false,
      };

      expect(commandWithPhone.phone).toBe('+221771234567');
    });

    it('should work without phone field', () => {
      const commandWithoutPhone: CreateBeneficiaryCommand = {
        organizationId: 'org-789',
        firstName: 'Paul',
        lastName: 'Diop',
        email: 'paul@example.com',
        generateTempPassword: true,
      };

      expect(commandWithoutPhone.phone).toBeUndefined();
    });

    it('should handle generateTempPassword as true', () => {
      const command: CreateBeneficiaryCommand = {
        organizationId: 'org-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        generateTempPassword: true,
      };

      expect(command.generateTempPassword).toBe(true);
    });

    it('should handle generateTempPassword as false', () => {
      const command: CreateBeneficiaryCommand = {
        organizationId: 'org-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        generateTempPassword: false,
      };

      expect(command.generateTempPassword).toBe(false);
    });
  });

  describe('CreateBeneficiaryResult', () => {
    it('should contain beneficiary and tempPassword', async () => {
      const result: CreateBeneficiaryResult = {
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
      };

      expect(result.beneficiary).toBeDefined();
      expect(result.tempPassword).toBe('temp123');
    });

    it('should allow undefined tempPassword', () => {
      const result: CreateBeneficiaryResult = {
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

      expect(result.beneficiary).toBeDefined();
      expect(result.tempPassword).toBeUndefined();
    });

    it('should work without tempPassword field', () => {
      const result: CreateBeneficiaryResult = {
        beneficiary: {
          id: 'ben-3',
          organizationId: 'org-789',
          clerkUserId: 'clerk-789',
          firstName: 'Paul',
          lastName: 'Diop',
          email: 'paul@example.com',
          phone: null,
          birthDate: null,
          gender: null,
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(result.beneficiary).toBeDefined();
      expect(result.tempPassword).toBeUndefined();
    });
  });

  describe('Use Case Execution', () => {
    it('should execute with valid command and return result', async () => {
      const expectedResult: CreateBeneficiaryResult = {
        beneficiary: {
          id: 'ben-new',
          organizationId: 'org-123',
          clerkUserId: 'clerk-new',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+221771234567',
          birthDate: null,
          gender: null,
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tempPassword: 'generatedPass',
      };

      const mockUseCase: CreateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue(expectedResult),
      };

      const command: CreateBeneficiaryCommand = {
        organizationId: 'org-123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+221771234567',
        generateTempPassword: true,
      };

      const result = await mockUseCase.execute(command);

      expect(result).toEqual(expectedResult);
      expect(result.beneficiary.id).toBe('ben-new');
      expect(result.tempPassword).toBe('generatedPass');
    });

    it('should handle command without phone', async () => {
      const mockUseCase: CreateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue({
          beneficiary: {
            id: 'ben-no-phone',
            organizationId: 'org-456',
            clerkUserId: 'clerk-456',
            firstName: 'No',
            lastName: 'Phone',
            email: 'nophone@example.com',
            phone: null,
            birthDate: null,
            gender: null,
            status: BeneficiaryStatus.ACTIVE,
            progressPercent: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      };

      const command: CreateBeneficiaryCommand = {
        organizationId: 'org-456',
        firstName: 'No',
        lastName: 'Phone',
        email: 'nophone@example.com',
        generateTempPassword: false,
      };

      const result = await mockUseCase.execute(command);

      expect(result.beneficiary.phone).toBeNull();
      expect(result.tempPassword).toBeUndefined();
    });

    it('should propagate errors from use case', async () => {
      const mockUseCase: CreateBeneficiaryUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('Creation failed')),
      };

      const command: CreateBeneficiaryCommand = {
        organizationId: 'org-error',
        firstName: 'Error',
        lastName: 'Case',
        email: 'error@example.com',
        generateTempPassword: true,
      };

      await expect(mockUseCase.execute(command)).rejects.toThrow('Creation failed');
    });
  });
});
