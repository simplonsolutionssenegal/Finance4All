import { clerkClient } from '@clerk/clerk-sdk-node';

import { ClerkService, RegisterUserSchema, VerifyEmailSchema, ResendVerificationEmailSchema, formatZodIssues } from '@/infrastructure/services/ClerkService';

// Mock Clerk SDK
jest.mock('@clerk/clerk-sdk-node', () => {
  const mockGetUser = jest.fn();
  const mockUpdateUser = jest.fn();

  return {
    clerkClient: {
      users: {
        getUser: mockGetUser,
        updateUser: mockUpdateUser,
      },
    },
  };
});

// Get references to the mocked functions
const mockGetUser = (clerkClient.users.getUser as jest.Mock);
const mockUpdateUser = (clerkClient.users.updateUser as jest.Mock);

describe('ClerkService', () => {
  let clerkService: ClerkService;

  beforeEach(() => {
    jest.clearAllMocks();
    clerkService = new ClerkService();

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('finalizeRegistration', () => {
    const mockUserData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      organisationId: 'org_123',
    };

    it('should successfully finalize registration with all data', async () => {
      const mockUser = {
        id: 'clerk_123',
        publicMetadata: {},
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUpdatedUser = {
        ...mockUser,
        publicMetadata: {
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          organisationId: 'org_123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      mockGetUser.mockResolvedValue(mockUser as any);
      mockUpdateUser.mockResolvedValue(mockUpdatedUser as any);

      const result = await clerkService.finalizeRegistration('clerk_123', mockUserData);

      expect(mockGetUser).toHaveBeenCalledWith('clerk_123');
      expect(mockUpdateUser).toHaveBeenCalledWith('clerk_123', {
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: {
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          organisationId: 'org_123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });

      expect(result).toEqual({
        success: true,
        user: {
          id: 'clerk_123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          emailVerified: true,
        },
      });
    });

    it('should successfully finalize registration without organisationId', async () => {
      const userDataWithoutOrg = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        id: 'clerk_123',
        publicMetadata: {},
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUpdatedUser = {
        ...mockUser,
        publicMetadata: {
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      mockGetUser.mockResolvedValue(mockUser as any);
      mockUpdateUser.mockResolvedValue(mockUpdatedUser as any);

      const result = await clerkService.finalizeRegistration('clerk_123', userDataWithoutOrg);

      expect(mockUpdateUser).toHaveBeenCalledWith('clerk_123', {
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: {
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });

      expect(result.success).toBe(true);
    });

    it('should preserve existing publicMetadata', async () => {
      const mockUser = {
        id: 'clerk_123',
        publicMetadata: {
          existingField: 'existingValue',
          role: 'OLD_ROLE',
        },
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUpdatedUser = {
        ...mockUser,
        publicMetadata: {
          existingField: 'existingValue',
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          organisationId: 'org_123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      mockGetUser.mockResolvedValue(mockUser as any);
      mockUpdateUser.mockResolvedValue(mockUpdatedUser as any);

      await clerkService.finalizeRegistration('clerk_123', mockUserData);

      expect(mockUpdateUser).toHaveBeenCalledWith('clerk_123', {
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: {
          existingField: 'existingValue',
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          organisationId: 'org_123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should handle missing primary email address', async () => {
      const mockUser = {
        id: 'clerk_123',
        publicMetadata: {},
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
            verification: { status: 'verified' },
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUpdatedUser = {
        id: 'clerk_123',
        publicMetadata: {
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          organisationId: 'org_123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        primaryEmailAddressId: 'email_123',
        emailAddresses: [], // No email addresses after update
        firstName: 'John',
        lastName: 'Doe',
      };

      mockGetUser.mockResolvedValue(mockUser as any);
      mockUpdateUser.mockResolvedValue(mockUpdatedUser as any);

      await expect(
        clerkService.finalizeRegistration('clerk_123', mockUserData)
      ).rejects.toThrow('Erreur lors de la finalisation de l\'inscription');
    });

    it('should handle Clerk getUser error', async () => {
      mockGetUser.mockRejectedValue(new Error('User not found'));

      await expect(
        clerkService.finalizeRegistration('clerk_123', mockUserData)
      ).rejects.toThrow('Erreur lors de la finalisation de l\'inscription');

      expect(console.error).toHaveBeenCalledWith(
        'Error finalizing registration:',
        expect.any(Error)
      );
    });

    it('should handle Clerk updateUser error', async () => {
      const mockUser = {
        id: 'clerk_123',
        publicMetadata: {},
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      mockGetUser.mockResolvedValue(mockUser as any);
      mockUpdateUser.mockRejectedValue(new Error('Update failed'));

      await expect(
        clerkService.finalizeRegistration('clerk_123', mockUserData)
      ).rejects.toThrow('Erreur lors de la finalisation de l\'inscription');

      expect(console.error).toHaveBeenCalledWith(
        'Error finalizing registration:',
        expect.any(Error)
      );
    });

    it('should handle null publicMetadata', async () => {
      const mockUser = {
        id: 'clerk_123',
        publicMetadata: null,
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUpdatedUser = {
        ...mockUser,
        publicMetadata: {
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          organisationId: 'org_123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      mockGetUser.mockResolvedValue(mockUser as any);
      mockUpdateUser.mockResolvedValue(mockUpdatedUser as any);

      const result = await clerkService.finalizeRegistration('clerk_123', mockUserData);

      expect(result.success).toBe(true);
    });

    it('should handle empty firstName and lastName', async () => {
      const mockUser = {
        id: 'clerk_123',
        publicMetadata: {},
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
          },
        ],
        firstName: null,
        lastName: null,
      };

      const mockUpdatedUser = {
        ...mockUser,
        publicMetadata: {
          role: 'BENEFICIAIRE',
          status: 'ACTIF',
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: expect.any(String),
          organisationId: 'org_123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      mockGetUser.mockResolvedValue(mockUser as any);
      mockUpdateUser.mockResolvedValue(mockUpdatedUser as any);

      const result = await clerkService.finalizeRegistration('clerk_123', mockUserData);

      expect(result).toEqual({
        success: true,
        user: {
          id: 'clerk_123',
          email: 'test@example.com',
          firstName: '',
          lastName: '',
          emailVerified: true,
        },
      });
    });
  });

  describe('getUserById', () => {
    it('should successfully get user by ID', async () => {
      const mockUser = {
        id: 'clerk_123',
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
            verification: {
              status: 'verified',
            },
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      mockGetUser.mockResolvedValue(mockUser as any);

      const result = await clerkService.getUserById('clerk_123');

      expect(mockGetUser).toHaveBeenCalledWith('clerk_123');
      expect(result).toEqual({
        id: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: true,
      });
    });

    it('should handle user not found', async () => {
      mockGetUser.mockRejectedValue(new Error('User not found'));

      const result = await clerkService.getUserById('nonexistent');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error getting user by ID:',
        expect.any(Error)
      );
    });

    it('should handle missing primary email address', async () => {
      const mockUser = {
        id: 'clerk_123',
        primaryEmailAddressId: 'email_123',
        emailAddresses: [], // No email addresses
        firstName: 'John',
        lastName: 'Doe',
      };

      mockGetUser.mockResolvedValue(mockUser as any);

      const result = await clerkService.getUserById('clerk_123');

      expect(result).toEqual({
        id: 'clerk_123',
        email: '',
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: false,
      });
    });

    it('should handle unverified email', async () => {
      const mockUser = {
        id: 'clerk_123',
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
            verification: {
              status: 'pending',
            },
          },
        ],
        firstName: 'John',
        lastName: 'Doe',
      };

      mockGetUser.mockResolvedValue(mockUser as any);

      const result = await clerkService.getUserById('clerk_123');

      expect(result).toEqual({
        id: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: false,
      });
    });

    it('should handle null firstName and lastName', async () => {
      const mockUser = {
        id: 'clerk_123',
        primaryEmailAddressId: 'email_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com',
            verification: {
              status: 'verified',
            },
          },
        ],
        firstName: null,
        lastName: null,
      };

      mockGetUser.mockResolvedValue(mockUser as any);

      const result = await clerkService.getUserById('clerk_123');

      expect(result).toEqual({
        id: 'clerk_123',
        email: 'test@example.com',
        firstName: '',
        lastName: '',
        emailVerified: true,
      });
    });
  });

  describe('Validation Schemas', () => {
    describe('RegisterUserSchema', () => {
      it('should validate correct user data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          organisationId: 'org_123',
          phoneNumber: '+1234567890',
          address: '123 Main St',
          dateOfBirth: '1990-01-01',
          gender: 'male',
        };

        const result = RegisterUserSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        };

        const result = RegisterUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject weak password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
        };

        const result = RegisterUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid firstName', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'J',
          lastName: 'Doe',
        };

        const result = RegisterUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject firstName with invalid characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John123',
          lastName: 'Doe',
        };

        const result = RegisterUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('VerifyEmailSchema', () => {
      it('should validate correct verification data', () => {
        const validData = {
          signUpId: 'signup_123',
          code: '123456',
        };

        const result = VerifyEmailSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject missing signUpId', () => {
        const invalidData = {
          code: '123456',
        };

        const result = VerifyEmailSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject missing code', () => {
        const invalidData = {
          signUpId: 'signup_123',
        };

        const result = VerifyEmailSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('ResendVerificationEmailSchema', () => {
      it('should validate correct email', () => {
        const validData = {
          email: 'test@example.com',
        };

        const result = ResendVerificationEmailSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
        };

        const result = ResendVerificationEmailSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('formatZodIssues', () => {
    it('should format single issue', () => {
      const issues = [{ message: 'Email is required' }];
      const result = formatZodIssues(issues);
      expect(result).toBe('Email is required');
    });

    it('should format multiple issues', () => {
      const issues = [
        { message: 'Email is required' },
        { message: 'Password is too short' },
      ];
      const result = formatZodIssues(issues);
      expect(result).toBe('Email is required, Password is too short');
    });

    it('should handle empty issues array', () => {
      const issues: { message: string }[] = [];
      const result = formatZodIssues(issues);
      expect(result).toBe('');
    });
  });
});
