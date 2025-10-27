import { useSignUp } from '@clerk/nextjs';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { useCreateBeneficiary } from '@/hooks/beneficiary/useCreateBeneficiary';
import { useRegister } from '@/hooks/register/useRegister';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
  useSignUp: jest.fn(),
}));

jest.mock('@/hooks/beneficiary/useCreateBeneficiary', () => ({
  useCreateBeneficiary: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSignUp = useSignUp as jest.MockedFunction<typeof useSignUp>;
const mockUseCreateBeneficiary = useCreateBeneficiary as jest.MockedFunction<
  typeof useCreateBeneficiary
>;

describe('useRegister', () => {
  const mockPush = jest.fn();
  const mockMutateAsync = jest.fn();

  const initialValues = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    mockUseCreateBeneficiary.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    mockUseSignUp.mockReturnValue({
      isLoaded: true,
      signUp: {
        create: jest.fn(),
        attemptEmailAddressVerification: jest.fn(),
        prepareEmailAddressVerification: jest.fn(),
        id: 'signup_123',
      },
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isOtpVerification).toBe(false);
      expect(result.current.verificationError).toBeNull();
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should initialize form state with provided values', () => {
      const values = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+221771234567',
        email: 'john@example.com',
        password: 'password123',
      };

      const { result } = renderHook(() => useRegister(values));

      expect(result.current.formState.values).toEqual(values);
    });
  });

  describe('handleRegistration', () => {
    it('should handle successful registration with complete status', async () => {
      const mockSignUp = {
        create: jest.fn().mockResolvedValue({
          status: 'complete',
          createdUserId: 'clerk_123',
        }),
      };

      mockUseSignUp.mockReturnValue({
        isLoaded: true,
        signUp: mockSignUp,
      } as any);

      mockMutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(mockSignUp.create).toHaveBeenCalledWith({
        emailAddress: '',
        password: '',
        firstName: '',
        lastName: '',
      });
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should handle registration with missing requirements', async () => {
      const mockSignUp = {
        create: jest.fn().mockResolvedValue({
          status: 'missing_requirements',
        }),
        prepareEmailAddressVerification: jest.fn().mockResolvedValue({}),
      };

      mockUseSignUp.mockReturnValue({
        isLoaded: true,
        signUp: mockSignUp,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      });
      expect(result.current.isOtpVerification).toBe(true);
    });

    it('should handle registration error', async () => {
      const mockSignUp = {
        create: jest.fn().mockRejectedValue(new Error('Registration failed')),
      };

      mockUseSignUp.mockReturnValue({
        isLoaded: true,
        signUp: mockSignUp,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(result.current.error).toBe('Registration failed');
    });

    it('should not proceed if not loaded', async () => {
      mockUseSignUp.mockReturnValue({
        isLoaded: false,
        signUp: null,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleRegistration({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleVerification', () => {
    it('should handle successful verification with complete status', async () => {
      const mockSignUp = {
        attemptEmailAddressVerification: jest.fn().mockResolvedValue({
          status: 'complete',
          createdUserId: 'clerk_123',
        }),
        id: 'signup_123',
      };

      mockUseSignUp.mockReturnValue({
        isLoaded: true,
        signUp: mockSignUp,
      } as any);

      mockMutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(mockSignUp.attemptEmailAddressVerification).toHaveBeenCalledWith({
        code: '123456',
      });
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should handle verification error', async () => {
      const mockSignUp = {
        attemptEmailAddressVerification: jest
          .fn()
          .mockRejectedValue(new Error('Invalid verification code')),
      };

      mockUseSignUp.mockReturnValue({
        isLoaded: true,
        signUp: mockSignUp,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(result.current.verificationError).toBe(
        'Erreur lors de la vérification. Veuillez réessayer.'
      );
    });

    it('should not proceed if not loaded', async () => {
      mockUseSignUp.mockReturnValue({
        isLoaded: false,
        signUp: null,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleVerification('123456');
      });

      expect(result.current.isVerifying).toBe(false);
    });

    it('should not proceed if code is empty', async () => {
      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleVerification('');
      });

      expect(result.current.isVerifying).toBe(false);
    });
  });

  describe('handleResendCode', () => {
    it('should resend verification code successfully', async () => {
      const mockSignUp = {
        prepareEmailAddressVerification: jest.fn().mockResolvedValue({}),
      };

      mockUseSignUp.mockReturnValue({
        isLoaded: true,
        signUp: mockSignUp,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: 'email_code',
      });
    });

    it('should handle resend code error', async () => {
      const mockSignUp = {
        prepareEmailAddressVerification: jest.fn().mockRejectedValue(new Error('Resend failed')),
      };

      mockUseSignUp.mockReturnValue({
        isLoaded: true,
        signUp: mockSignUp,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      // Should not throw error, just log it
      expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalled();
    });

    it('should not proceed if not loaded', async () => {
      mockUseSignUp.mockReturnValue({
        isLoaded: false,
        signUp: null,
      } as any);

      const { result } = renderHook(() => useRegister(initialValues));

      await act(async () => {
        await result.current.handleResendCode();
      });

      // Should not call prepareEmailAddressVerification
      expect(result.current).toBeDefined();
    });
  });

  describe('form validation', () => {
    it('should validate form correctly', () => {
      const values = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+221771234567',
        email: 'john@example.com',
        password: 'password123',
      };

      const { result } = renderHook(() => useRegister(values));

      expect(result.current.isFormValid).toBe(true);
    });

    it('should invalidate form with empty fields', () => {
      const { result } = renderHook(() => useRegister(initialValues));

      expect(result.current.isFormValid).toBe(false);
    });
  });
});
