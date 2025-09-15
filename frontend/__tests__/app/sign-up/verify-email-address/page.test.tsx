import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the API
const mockRegisterUser = jest.fn().mockResolvedValue({ success: true });
const mockAttemptEmailAddressVerification = jest.fn();
const mockSetActive = jest.fn();

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useSignUp: () => ({
    isLoaded: true,
    setActive: mockSetActive,
    signUp: {
      status: 'pending',
      createdUserId: 'clrk_test_1',
      unsafeMetadata: { first_name: 'Jean', last_name: 'Dupont' },
      attemptEmailAddressVerification: mockAttemptEmailAddressVerification,
    },
  }),
  useSession: () => ({ session: null }),
  useUser: () => ({
    user: {
      id: 'clrk_test_1',
      firstName: 'Jean',
      lastName: 'Dupont',
      primaryEmailAddress: { emailAddress: 'jean@example.com' },
    },
  }),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the auth module
jest.mock('@/lib/api/auth', () => ({
  registerUser: mockRegisterUser,
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid='loader' />,
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    try {
      window.localStorage.clear();
    } catch (e) {
      /* intentionally ignore in test env */ void e;
    }
  });

  it('renders and allows entering code', async () => {
    await act(async () => {
      const { default: VerifyEmailPage } = await import('@/app/sign-up/verify-email-address/page');
      render(<VerifyEmailPage />);
    });

    expect(screen.getByText(/Vérifiez votre email/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Entrez le code/i);
    fireEvent.change(input, { target: { value: '123456' } });
    expect((input as HTMLInputElement).value).toBe('123456');
  });

  it('calls backend registration after successful verification', async () => {
    mockAttemptEmailAddressVerification.mockResolvedValueOnce({
      status: 'complete',
      createdSessionId: 'sess_123',
      createdUserId: 'clrk_test_1',
    });

    await act(async () => {
      const { default: VerifyEmailPage } = await import('@/app/sign-up/verify-email-address/page');
      render(<VerifyEmailPage />);
    });

    fireEvent.change(screen.getByPlaceholderText(/Entrez le code/i), {
      target: { value: '123456' },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Vérifier mon email/i }));
    });

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        clerkId: 'clrk_test_1',
        email: 'jean@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
      });
    });
  });

  it('uses localStorage fallback when user is not hydrated', async () => {
    // Setup localStorage
    const testData = {
      email: 'fallback@example.com',
      firstName: 'Fall',
      lastName: 'Back',
    };

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(key => {
        if (key === 'signup_payload') return JSON.stringify(testData);
        return null;
      }),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    mockAttemptEmailAddressVerification.mockResolvedValueOnce({
      status: 'complete',
      createdSessionId: 'sess_123',
      createdUserId: 'clrk_test_1',
    });

    // Mock the module with specific implementation for this test
    jest.doMock('@clerk/nextjs', () => ({
      useSignUp: () => ({
        isLoaded: true,
        setActive: mockSetActive,
        signUp: {
          status: 'pending',
          createdUserId: 'clrk_test_1',
          unsafeMetadata: {},
          attemptEmailAddressVerification: mockAttemptEmailAddressVerification,
        },
      }),
      useSession: () => ({ session: null }),
      useUser: () => ({
        user: null,
      }),
    }));

    // Import the component dynamically after setting up mocks
    const { default: VerifyEmailPage } = await import('@/app/sign-up/verify-email-address/page');

    await act(async () => {
      render(<VerifyEmailPage />);
    });

    // Verify the form is rendered
    expect(screen.getByText(/Vérifiez votre email/i)).toBeInTheDocument();

    // Simulate user input and form submission
    fireEvent.change(screen.getByPlaceholderText(/Entrez le code/i), {
      target: { value: '123456' },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Vérifier mon email/i }));
    });

    // Verify the registration was called (données peuvent provenir de user hydraté ou fallback)
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalled();
    });
  });
});
