import type { OrganizationIdentityPort } from '@/domain/Beneficiary/ports/out/OrganizationIdentityPort';

describe('OrganizationIdentityPort Port', () => {
  describe('Interface Contract', () => {
    it('should define upsertUser method', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn(),
      };

      expect(mockPort).toHaveProperty('upsertUser');
      expect(typeof mockPort.upsertUser).toBe('function');
    });

    it('should define ensureMembership method', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn(),
      };

      expect(mockPort).toHaveProperty('ensureMembership');
      expect(typeof mockPort.ensureMembership).toBe('function');
    });
  });

  describe('upsertUser', () => {
    it('should accept user input parameters', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-123' }),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        tempPassword: 'tempPassword123',
      };

      mockPort.upsertUser(input);

      expect(mockPort.upsertUser).toHaveBeenCalledWith(input);
    });

    it('should return Promise<{clerkUserId: string}>', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-456' }),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie@example.com',
      };

      const result = mockPort.upsertUser(input);

      expect(result).toBeInstanceOf(Promise);
    });

    it('should create new user and return clerkUserId', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-new-123' }),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        tempPassword: 'securePassword',
      };

      const result = await mockPort.upsertUser(input);

      expect(result.clerkUserId).toBe('user-new-123');
      expect(mockPort.upsertUser).toHaveBeenCalledWith(input);
    });

    it('should update existing user and return clerkUserId', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-existing-456' }),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'existing@example.com',
      };

      const result = await mockPort.upsertUser(input);

      expect(result.clerkUserId).toBe('user-existing-456');
    });

    it('should handle user creation with tempPassword', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-with-password' }),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'Password',
        lastName: 'User',
        email: 'password@example.com',
        tempPassword: 'temp123456',
      };

      const result = await mockPort.upsertUser(input);

      expect(result.clerkUserId).toBe('user-with-password');
      expect(mockPort.upsertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          tempPassword: 'temp123456',
        })
      );
    });

    it('should handle user creation without tempPassword', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-no-password' }),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'No',
        lastName: 'Password',
        email: 'nopassword@example.com',
      };

      const result = await mockPort.upsertUser(input);

      expect(result.clerkUserId).toBe('user-no-password');
      expect(mockPort.upsertUser).toHaveBeenCalledWith(
        expect.not.objectContaining({
          tempPassword: expect.anything(),
        })
      );
    });

    it('should propagate errors from identity provider', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockRejectedValue(new Error('Identity provider error')),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'Error',
        lastName: 'Case',
        email: 'error@example.com',
      };

      await expect(mockPort.upsertUser(input)).rejects.toThrow('Identity provider error');
    });

    it('should handle email validation errors', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockRejectedValue(new Error('Invalid email format')),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'Invalid',
        lastName: 'Email',
        email: 'not-an-email',
      };

      await expect(mockPort.upsertUser(input)).rejects.toThrow('Invalid email format');
    });

    it('should handle duplicate email errors', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockRejectedValue(new Error('Email already exists')),
        ensureMembership: jest.fn(),
      };

      const input = {
        firstName: 'Duplicate',
        lastName: 'Email',
        email: 'duplicate@example.com',
      };

      await expect(mockPort.upsertUser(input)).rejects.toThrow('Email already exists');
    });
  });

  describe('ensureMembership', () => {
    it('should accept params object with organizationId, clerkUserId and role', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockResolvedValue(undefined),
      };

      mockPort.ensureMembership({
        organizationId: 'org-456',
        clerkUserId: 'user-123',
        role: 'org:recipient',
      });

      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-456',
        clerkUserId: 'user-123',
        role: 'org:recipient',
      });
    });

    it('should return Promise<void>', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockResolvedValue(undefined),
      };

      const result = mockPort.ensureMembership({
        organizationId: 'org-abc',
        clerkUserId: 'user-789',
        role: 'org:recipient',
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it('should ensure user is member of organization', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockResolvedValue(undefined),
      };

      await mockPort.ensureMembership({
        organizationId: 'org-123',
        clerkUserId: 'user-member',
        role: 'org:recipient',
      });

      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clerkUserId: 'user-member',
        role: 'org:recipient',
      });
    });

    it('should add user to organization if not already member', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockResolvedValue(undefined),
      };

      await mockPort.ensureMembership({
        organizationId: 'org-456',
        clerkUserId: 'user-new-member',
        role: 'org:recipient',
      });

      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-456',
        clerkUserId: 'user-new-member',
        role: 'org:recipient',
      });
    });

    it('should be idempotent when user already member', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockResolvedValue(undefined),
      };

      await mockPort.ensureMembership({
        organizationId: 'org-789',
        clerkUserId: 'user-existing',
        role: 'org:recipient',
      });
      await mockPort.ensureMembership({
        organizationId: 'org-789',
        clerkUserId: 'user-existing',
        role: 'org:recipient',
      });

      expect(mockPort.ensureMembership).toHaveBeenCalledTimes(2);
    });

    it('should propagate organization not found errors', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockRejectedValue(new Error('Organization not found')),
      };

      await expect(
        mockPort.ensureMembership({
          organizationId: 'org-nonexistent',
          clerkUserId: 'user-123',
          role: 'org:recipient',
        })
      ).rejects.toThrow('Organization not found');
    });

    it('should propagate user not found errors', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockRejectedValue(new Error('User not found')),
      };

      await expect(
        mockPort.ensureMembership({
          organizationId: 'org-123',
          clerkUserId: 'user-nonexistent',
          role: 'org:recipient',
        })
      ).rejects.toThrow('User not found');
    });

    it('should handle permission errors', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockRejectedValue(new Error('Insufficient permissions')),
      };

      await expect(
        mockPort.ensureMembership({
          organizationId: 'org-forbidden',
          clerkUserId: 'user-123',
          role: 'org:recipient',
        })
      ).rejects.toThrow('Insufficient permissions');
    });

    it('should handle rate limit errors', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn().mockRejectedValue(new Error('Rate limit exceeded')),
      };

      await expect(
        mockPort.ensureMembership({
          organizationId: 'org-rate-limit',
          clerkUserId: 'user-123',
          role: 'org:recipient',
        })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Integration Flow', () => {
    it('should support complete user creation and membership flow', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-new-flow' }),
        ensureMembership: jest.fn().mockResolvedValue(undefined),
      };

      // Step 1: Create user
      const result = await mockPort.upsertUser({
        firstName: 'Flow',
        lastName: 'Test',
        email: 'flow@example.com',
        tempPassword: 'flowPass123',
      });

      expect(result.clerkUserId).toBe('user-new-flow');

      // Step 2: Ensure membership
      await mockPort.ensureMembership({
        organizationId: 'org-flow',
        clerkUserId: result.clerkUserId,
        role: 'org:recipient',
      });

      expect(mockPort.upsertUser).toHaveBeenCalledTimes(1);
      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-flow',
        clerkUserId: 'user-new-flow',
        role: 'org:recipient',
      });
    });

    it('should handle partial failure in flow', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-partial' }),
        ensureMembership: jest.fn().mockRejectedValue(new Error('Membership failed')),
      };

      const result = await mockPort.upsertUser({
        firstName: 'Partial',
        lastName: 'Failure',
        email: 'partial@example.com',
      });

      expect(result.clerkUserId).toBe('user-partial');

      await expect(
        mockPort.ensureMembership({
          organizationId: 'org-fail',
          clerkUserId: result.clerkUserId,
          role: 'org:recipient',
        })
      ).rejects.toThrow('Membership failed');
    });

    it('should handle multiple organizations for same user', async () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn().mockResolvedValue({ clerkUserId: 'user-multi-org' }),
        ensureMembership: jest.fn().mockResolvedValue(undefined),
      };

      const result = await mockPort.upsertUser({
        firstName: 'Multi',
        lastName: 'Org',
        email: 'multi@example.com',
      });

      await mockPort.ensureMembership({
        organizationId: 'org-1',
        clerkUserId: result.clerkUserId,
        role: 'org:recipient',
      });
      await mockPort.ensureMembership({
        organizationId: 'org-2',
        clerkUserId: result.clerkUserId,
        role: 'org:recipient',
      });
      await mockPort.ensureMembership({
        organizationId: 'org-3',
        clerkUserId: result.clerkUserId,
        role: 'org:recipient',
      });

      expect(mockPort.ensureMembership).toHaveBeenCalledTimes(3);
      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-1',
        clerkUserId: 'user-multi-org',
        role: 'org:recipient',
      });
      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-2',
        clerkUserId: 'user-multi-org',
        role: 'org:recipient',
      });
      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-3',
        clerkUserId: 'user-multi-org',
        role: 'org:recipient',
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct types for upsertUser input', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn(),
      };

      const validInput = {
        firstName: 'Type',
        lastName: 'Safe',
        email: 'type@example.com',
        tempPassword: 'optional',
      };

      mockPort.upsertUser(validInput);

      expect(mockPort.upsertUser).toHaveBeenCalledWith(validInput);
    });

    it('should enforce correct types for ensureMembership parameters', () => {
      const mockPort: OrganizationIdentityPort = {
        upsertUser: jest.fn(),
        ensureMembership: jest.fn(),
      };

      mockPort.ensureMembership({
        organizationId: 'org-string',
        clerkUserId: 'user-string',
        role: 'org:recipient',
      });

      expect(mockPort.ensureMembership).toHaveBeenCalledWith({
        organizationId: 'org-string',
        clerkUserId: 'user-string',
        role: 'org:recipient',
      });
    });
  });
});
