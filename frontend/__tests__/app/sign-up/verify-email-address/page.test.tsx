import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/lib/api/auth', () => ({
  registerUser: jest.fn().mockResolvedValue({ success: true }),
}));

const mockAttemptEmailAddressVerification = jest.fn();
const mockSetActive = jest.fn();

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

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
import { registerUser } from '@/lib/api/auth';

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
    const { default: VerifyEmailPage } = await import('@/app/sign-up/verify-email-address/page');
    render(<VerifyEmailPage />);
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

    const { default: VerifyEmailPage } = await import('@/app/sign-up/verify-email-address/page');
    render(<VerifyEmailPage />);

    fireEvent.change(screen.getByPlaceholderText(/Entrez le code/i), {
      target: { value: '123456' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /Vérifier mon email/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        clerkId: 'clrk_test_1',
        email: 'jean@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
      });
    });
  });

  it('uses localStorage fallback when user is not hydrated', async () => {
    // Put payload in localStorage
    window.localStorage.setItem(
      'signup_payload',
      JSON.stringify({
        email: 'fallback@example.com',
        firstName: 'Fall',
        lastName: 'Back',
      })
    );

    mockAttemptEmailAddressVerification.mockResolvedValueOnce({
      status: 'complete',
      createdSessionId: 'sess_123',
      createdUserId: 'clrk_test_1',
    });

    // Ensure a clean module registry before isolation
    jest.resetModules();
    // Re-import component with isolated module context and specific mocks
    await jest.isolateModulesAsync(async () => {
      // Re-apply the auth mock within this isolated module context
      jest.doMock('@/lib/api/auth', () => ({
        registerUser,
      }));
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: jest.fn() }),
      }));
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
        useUser: () => ({ user: { id: 'clrk_test_1', primaryEmailAddress: { emailAddress: '' } } }),
      }));

      const { default: VerifyEmailPageLocal } = await import(
        '@/app/sign-up/verify-email-address/page'
      );
      render(<VerifyEmailPageLocal />);

      fireEvent.change(screen.getByPlaceholderText(/Entrez le code/i), {
        target: { value: '123456' },
      });
      fireEvent.submit(screen.getByRole('button', { name: /Vérifier mon email/i }));

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith({
          clerkId: 'clrk_test_1',
          email: 'fallback@example.com',
          firstName: 'Fall',
          lastName: 'Back',
        });
      });
    });
  });
});
