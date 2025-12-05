import type { UpdateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/UpdateBeneficiaryUseCase';
import type {
  UpdateBeneficiaryCommand,
  Beneficiary,
} from '@/domain/Beneficiary/entities/Beneficiary';
// eslint-disable-next-line no-duplicate-imports
import { BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';

describe('UpdateBeneficiaryUseCase Port', () => {
  describe('Interface Contract', () => {
    it('should define execute method', () => {
      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn(),
      };

      expect(mockUseCase).toHaveProperty('execute');
      expect(typeof mockUseCase.execute).toBe('function');
    });

    it('should accept UpdateBeneficiaryCommand', () => {
      const mockExecute = jest.fn().mockResolvedValue({
        id: 'ben-1',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phone: '+221771234567',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: mockExecute,
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-1',
        organizationId: 'org-123',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+221771234567',
        status: 'ACTIVE',
      };

      mockUseCase.execute(command);

      expect(mockExecute).toHaveBeenCalledWith(command);
    });

    it('should return Promise<Beneficiary>', () => {
      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue({} as Beneficiary),
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-1',
        organizationId: 'org-123',
      };

      const result = mockUseCase.execute(command);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('UpdateBeneficiaryCommand', () => {
    it('should have required beneficiaryId and organizationId fields', () => {
      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-1',
        organizationId: 'org-123',
      };

      expect(command.beneficiaryId).toBe('ben-1');
      expect(command.organizationId).toBe('org-123');
    });

    it('should accept optional firstName', () => {
      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-2',
        organizationId: 'org-456',
        firstName: 'Marie',
      };

      expect(command.firstName).toBe('Marie');
    });

    it('should accept optional lastName', () => {
      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-3',
        organizationId: 'org-789',
        lastName: 'Martin',
      };

      expect(command.lastName).toBe('Martin');
    });

    it('should accept optional phone', () => {
      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-4',
        organizationId: 'org-abc',
        phone: '+221771234567',
      };

      expect(command.phone).toBe('+221771234567');
    });

    it('should accept optional status', () => {
      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-5',
        organizationId: 'org-def',
        status: 'INACTIVE',
      };

      expect(command.status).toBe('INACTIVE');
    });

    it('should accept all optional fields together', () => {
      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-7',
        organizationId: 'org-jkl',
        firstName: 'Paul',
        lastName: 'Diop',
        phone: '+221778888888',
        status: 'ACTIVE',
      };

      expect(command.beneficiaryId).toBe('ben-7');
      expect(command.organizationId).toBe('org-jkl');
      expect(command.firstName).toBe('Paul');
      expect(command.lastName).toBe('Diop');
      expect(command.phone).toBe('+221778888888');
      expect(command.status).toBe('ACTIVE');
    });

    it('should work with only required fields', () => {
      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-8',
        organizationId: 'org-mno',
      };

      expect(command.firstName).toBeUndefined();
      expect(command.lastName).toBeUndefined();
      expect(command.phone).toBeUndefined();
      expect(command.status).toBeUndefined();
    });

    it('should accept partial updates', () => {
      const onlyNameCommand: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-9',
        organizationId: 'org-pqr',
        firstName: 'NewName',
      };

      const onlyStatusCommand: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-10',
        organizationId: 'org-stu',
        status: 'INACTIVE',
      };

      expect(onlyNameCommand.firstName).toBe('NewName');
      expect(onlyStatusCommand.status).toBe('INACTIVE');
    });
  });

  describe('Use Case Execution', () => {
    it('should execute with valid command and return updated beneficiary', async () => {
      const expectedBeneficiary: Beneficiary = {
        id: 'ben-update',
        organizationId: 'org-123',
        clerkUserId: 'clerk-123',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        phone: '+221771234567',
        status: BeneficiaryStatus.ACTIVE,
        progressPercent: 60,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue(expectedBeneficiary),
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-update',
        organizationId: 'org-123',
        firstName: 'Updated',
        lastName: 'Name',
      };

      const result = await mockUseCase.execute(command);

      expect(result).toEqual(expectedBeneficiary);
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
    });

    it('should handle command with only status update', async () => {
      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue({
          id: 'ben-status',
          organizationId: 'org-456',
          clerkUserId: 'clerk-456',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: null,
          status: BeneficiaryStatus.INACTIVE,
          progressPercent: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-status',
        organizationId: 'org-456',
        status: 'INACTIVE',
      };

      const result = await mockUseCase.execute(command);

      expect(result.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should handle command with phone update to null', async () => {
      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue({
          id: 'ben-no-phone',
          organizationId: 'org-789',
          clerkUserId: 'clerk-789',
          firstName: 'No',
          lastName: 'Phone',
          email: 'nophone@example.com',
          phone: null,
          status: BeneficiaryStatus.ACTIVE,
          progressPercent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-no-phone',
        organizationId: 'org-789',
        phone: null,
      };

      const result = await mockUseCase.execute(command);

      expect(result.phone).toBeNull();
    });

    it('should handle all fields update', async () => {
      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn().mockResolvedValue({
          id: 'ben-all',
          organizationId: 'org-all',
          clerkUserId: 'clerk-all',
          firstName: 'Complete',
          lastName: 'Update',
          email: 'complete@example.com',
          phone: '+221779999999',
          status: BeneficiaryStatus.INACTIVE,
          progressPercent: 85,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-all',
        organizationId: 'org-all',
        firstName: 'Complete',
        lastName: 'Update',
        phone: '+221779999999',
        status: 'INACTIVE',
      };

      const result = await mockUseCase.execute(command);

      expect(result.firstName).toBe('Complete');
      expect(result.lastName).toBe('Update');
      expect(result.phone).toBe('+221779999999');
      expect(result.status).toBe(BeneficiaryStatus.INACTIVE);
    });

    it('should propagate errors from use case', async () => {
      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('Update failed')),
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'ben-error',
        organizationId: 'org-error',
      };

      await expect(mockUseCase.execute(command)).rejects.toThrow('Update failed');
    });

    it('should handle beneficiary not found error', async () => {
      const mockUseCase: UpdateBeneficiaryUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('Beneficiary not found')),
      };

      const command: UpdateBeneficiaryCommand = {
        beneficiaryId: 'non-existent',
        organizationId: 'org-123',
        firstName: 'Updated',
      };

      await expect(mockUseCase.execute(command)).rejects.toThrow('Beneficiary not found');
    });
  });
});
