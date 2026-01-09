import { ClerkOrganizationIdentityService } from '@/infrastructure/services/ClerkOrganizationIdentityService';
import { clerkClient } from '@clerk/express';

// Mock Clerk client
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
      createUser: jest.fn(),
    },
    organizations: {
      createOrganizationMembership: jest.fn(),
    },
  },
}));

describe('ClerkOrganizationIdentityService', () => {
  let service: ClerkOrganizationIdentityService;

  beforeEach(() => {
    service = new ClerkOrganizationIdentityService();
    jest.clearAllMocks();
  });

  describe('upsertUser', () => {
    describe('when user exists', () => {
      it('should return existing user clerkUserId without creating new user', async () => {
        const existingUser = {
          id: 'user_existing123',
          emailAddress: ['existing@example.com'],
          firstName: 'Existing',
          lastName: 'User',
        };

        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: [existingUser],
        });

        const params = {
          email: 'existing@example.com',
          firstName: 'Existing',
          lastName: 'User',
        };

        const result = await service.upsertUser(params);

        expect(clerkClient.users.getUserList).toHaveBeenCalledWith({
          emailAddress: ['existing@example.com'],
        });
        expect(clerkClient.users.createUser).not.toHaveBeenCalled();
        expect(result).toEqual({ clerkUserId: 'user_existing123' });
      });

      it('should return existing user even with tempPassword provided', async () => {
        const existingUser = {
          id: 'user_existing456',
          emailAddress: ['user@example.com'],
          firstName: 'Test',
          lastName: 'User',
        };

        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: [existingUser],
        });

        const params = {
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          tempPassword: 'temp123',
        };

        const result = await service.upsertUser(params);

        expect(clerkClient.users.createUser).not.toHaveBeenCalled();
        expect(result).toEqual({ clerkUserId: 'user_existing456' });
      });
    });

    describe('when user does not exist', () => {
      it('should create new user without password', async () => {
        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: [],
        });

        const newUser = {
          id: 'user_new123',
          emailAddress: ['new@example.com'],
          firstName: 'New',
          lastName: 'User',
        };

        (clerkClient.users.createUser as jest.Mock).mockResolvedValue(newUser);

        const params = {
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
        };

        const result = await service.upsertUser(params);

        expect(clerkClient.users.getUserList).toHaveBeenCalledWith({
          emailAddress: ['new@example.com'],
        });
        expect(clerkClient.users.createUser).toHaveBeenCalledWith({
          emailAddress: ['new@example.com'],
          firstName: 'New',
          lastName: 'User',
        });
        expect(result).toEqual({ clerkUserId: 'user_new123' });
      });

      it('should create new user with tempPassword', async () => {
        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: [],
        });

        const newUser = {
          id: 'user_new456',
          emailAddress: ['newpass@example.com'],
          firstName: 'New',
          lastName: 'Pass',
        };

        (clerkClient.users.createUser as jest.Mock).mockResolvedValue(newUser);

        const params = {
          email: 'newpass@example.com',
          firstName: 'New',
          lastName: 'Pass',
          tempPassword: 'temp456',
        };

        const result = await service.upsertUser(params);

        expect(clerkClient.users.createUser).toHaveBeenCalledWith({
          emailAddress: ['newpass@example.com'],
          firstName: 'New',
          lastName: 'Pass',
          password: 'temp456',
        });
        expect(result).toEqual({ clerkUserId: 'user_new456' });
      });

      it('should not include password field when tempPassword is undefined', async () => {
        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: [],
        });

        const newUser = {
          id: 'user_new789',
          emailAddress: ['nopass@example.com'],
          firstName: 'No',
          lastName: 'Pass',
        };

        (clerkClient.users.createUser as jest.Mock).mockResolvedValue(newUser);

        const params = {
          email: 'nopass@example.com',
          firstName: 'No',
          lastName: 'Pass',
        };

        await service.upsertUser(params);

        const createUserCall = (clerkClient.users.createUser as jest.Mock).mock.calls[0][0];
        expect(createUserCall).not.toHaveProperty('password');
      });
    });

    describe('when getUserList returns empty data', () => {
      it('should handle null data', async () => {
        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: null,
        });

        const newUser = {
          id: 'user_nulldata',
          emailAddress: ['nulldata@example.com'],
          firstName: 'Null',
          lastName: 'Data',
        };

        (clerkClient.users.createUser as jest.Mock).mockResolvedValue(newUser);

        const params = {
          email: 'nulldata@example.com',
          firstName: 'Null',
          lastName: 'Data',
        };

        const result = await service.upsertUser(params);

        expect(clerkClient.users.createUser).toHaveBeenCalled();
        expect(result).toEqual({ clerkUserId: 'user_nulldata' });
      });

      it('should handle undefined data', async () => {
        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: undefined,
        });

        const newUser = {
          id: 'user_undefineddata',
          emailAddress: ['undefineddata@example.com'],
          firstName: 'Undefined',
          lastName: 'Data',
        };

        (clerkClient.users.createUser as jest.Mock).mockResolvedValue(newUser);

        const params = {
          email: 'undefineddata@example.com',
          firstName: 'Undefined',
          lastName: 'Data',
        };

        const result = await service.upsertUser(params);

        expect(clerkClient.users.createUser).toHaveBeenCalled();
        expect(result).toEqual({ clerkUserId: 'user_undefineddata' });
      });
    });

    describe('error handling', () => {
      it('should propagate errors from getUserList', async () => {
        const error = new Error('Clerk API error');
        (clerkClient.users.getUserList as jest.Mock).mockRejectedValue(error);

        const params = {
          email: 'error@example.com',
          firstName: 'Error',
          lastName: 'Case',
        };

        await expect(service.upsertUser(params)).rejects.toThrow('Clerk API error');
      });

      it('should propagate errors from createUser', async () => {
        (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
          data: [],
        });

        const error = new Error('User creation failed');
        (clerkClient.users.createUser as jest.Mock).mockRejectedValue(error);

        const params = {
          email: 'createerror@example.com',
          firstName: 'Create',
          lastName: 'Error',
        };

        await expect(service.upsertUser(params)).rejects.toThrow('User creation failed');
      });
    });
  });

  describe('ensureMembership', () => {
    it('should create organization membership successfully', async () => {
      (clerkClient.organizations.createOrganizationMembership as jest.Mock).mockResolvedValue({
        id: 'membership_123',
      });

      const params = {
        organizationId: 'org_123',
        clerkUserId: 'user_456',
        role: 'org:recipient' as const,
      };

      await service.ensureMembership(params);

      expect(clerkClient.organizations.createOrganizationMembership).toHaveBeenCalledWith({
        organizationId: 'org_123',
        userId: 'user_456',
        role: 'org:recipient',
      });
    });

    it('should call with correct parameters', async () => {
      (clerkClient.organizations.createOrganizationMembership as jest.Mock).mockResolvedValue({});

      const params = {
        organizationId: 'org_abc',
        clerkUserId: 'user_xyz',
        role: 'org:recipient' as const,
      };

      await service.ensureMembership(params);

      expect(clerkClient.organizations.createOrganizationMembership).toHaveBeenCalledWith({
        organizationId: 'org_abc',
        userId: 'user_xyz',
        role: 'org:recipient',
      });
    });

    it('should not throw when user is already a member', async () => {
      const error = new Error('User already member');
      (clerkClient.organizations.createOrganizationMembership as jest.Mock).mockRejectedValue(
        error
      );

      const params = {
        organizationId: 'org_789',
        clerkUserId: 'user_789',
        role: 'org:recipient' as const,
      };

      // Should not throw
      await expect(service.ensureMembership(params)).resolves.not.toThrow();
    });

    it('should silently ignore any error during membership creation', async () => {
      const error = new Error('Any error');
      (clerkClient.organizations.createOrganizationMembership as jest.Mock).mockRejectedValue(
        error
      );

      const params = {
        organizationId: 'org_error',
        clerkUserId: 'user_error',
        role: 'org:recipient' as const,
      };

      await service.ensureMembership(params);

      expect(clerkClient.organizations.createOrganizationMembership).toHaveBeenCalledWith({
        organizationId: 'org_error',
        userId: 'user_error',
        role: 'org:recipient',
      });
    });

    it('should be idempotent - safe to call multiple times', async () => {
      (clerkClient.organizations.createOrganizationMembership as jest.Mock)
        .mockResolvedValueOnce({ id: 'membership_1' })
        .mockRejectedValueOnce(new Error('Already member'));

      const params = {
        organizationId: 'org_idempotent',
        clerkUserId: 'user_idempotent',
        role: 'org:recipient' as const,
      };

      // First call succeeds
      await service.ensureMembership(params);
      // Second call fails (already member) but doesn't throw
      await service.ensureMembership(params);

      expect(clerkClient.organizations.createOrganizationMembership).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user creation and membership flow', async () => {
      // Step 1: User doesn't exist
      (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
        data: [],
      });

      const newUser = {
        id: 'user_flow123',
        emailAddress: ['flow@example.com'],
        firstName: 'Flow',
        lastName: 'Test',
      };

      (clerkClient.users.createUser as jest.Mock).mockResolvedValue(newUser);
      (clerkClient.organizations.createOrganizationMembership as jest.Mock).mockResolvedValue({});

      // Step 2: Create user
      const userParams = {
        email: 'flow@example.com',
        firstName: 'Flow',
        lastName: 'Test',
        tempPassword: 'temp123',
      };

      const userResult = await service.upsertUser(userParams);
      expect(userResult.clerkUserId).toBe('user_flow123');

      // Step 3: Add to organization
      const membershipParams = {
        organizationId: 'org_flow',
        clerkUserId: userResult.clerkUserId,
        role: 'org:recipient' as const,
      };

      await service.ensureMembership(membershipParams);

      expect(clerkClient.users.createUser).toHaveBeenCalledWith({
        emailAddress: ['flow@example.com'],
        firstName: 'Flow',
        lastName: 'Test',
        password: 'temp123',
      });
      expect(clerkClient.organizations.createOrganizationMembership).toHaveBeenCalledWith({
        organizationId: 'org_flow',
        userId: 'user_flow123',
        role: 'org:recipient',
      });
    });

    it('should handle existing user and new membership flow', async () => {
      // Step 1: User exists
      const existingUser = {
        id: 'user_existing789',
        emailAddress: ['existing@example.com'],
        firstName: 'Existing',
        lastName: 'User',
      };

      (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
        data: [existingUser],
      });
      (clerkClient.organizations.createOrganizationMembership as jest.Mock).mockResolvedValue({});

      // Step 2: Get existing user
      const userParams = {
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
      };

      const userResult = await service.upsertUser(userParams);
      expect(userResult.clerkUserId).toBe('user_existing789');
      expect(clerkClient.users.createUser).not.toHaveBeenCalled();

      // Step 3: Add to organization
      const membershipParams = {
        organizationId: 'org_new',
        clerkUserId: userResult.clerkUserId,
        role: 'org:recipient' as const,
      };

      await service.ensureMembership(membershipParams);

      expect(clerkClient.organizations.createOrganizationMembership).toHaveBeenCalledWith({
        organizationId: 'org_new',
        userId: 'user_existing789',
        role: 'org:recipient',
      });
    });
  });
});
