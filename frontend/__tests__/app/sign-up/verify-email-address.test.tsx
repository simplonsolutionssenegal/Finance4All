import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock matchMedia (Next/Image or UI may depend on it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockAttempt = jest.fn();
const mockPrepare = jest.fn();
const mockSetActive = jest.fn();
const mockUseSignUp = jest.fn();
const mockUseSession = jest.fn();
const mockUseUser = jest.fn();

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@clerk/nextjs', () => ({
  useSignUp: () => mockUseSignUp(),
  useSession: () => mockUseSession(),
  useUser: () => mockUseUser(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// registerUser backend
const mockRegisterUser = jest.fn().mockResolvedValue({ success: true });
jest.mock('@/lib/api/auth', () => ({
  registerUser: (...args: any[]) => mockRegisterUser(...args),
}));

describe('VerifyEmailAddress page', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ session: null });
    mockUseUser.mockReturnValue({ user: null });
    mockUseSignUp.mockReturnValue({
      isLoaded: true,
      setActive: mockSetActive,
      signUp: {
        status: 'needs_verification',
        attemptEmailAddressVerification: mockAttempt,
        prepareEmailAddressVerification: mockPrepare,
        createdUserId: 'user_1',
      },
    });
  });

  it('rend le formulaire et soumet un code valide avec succès', async () => {
    mockAttempt.mockResolvedValueOnce({
      status: 'complete',
      createdSessionId: 'sess_1',
      createdUserId: 'user_1',
    });

    await act(async () => {
      const { default: Page } = await import('@/app/sign-up/verify-email-address/page');
      render(<Page />);
    });

    fireEvent.change(screen.getByLabelText(/code de vérification/i), {
      target: { value: '123456' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /vérifier mon email/i }));
    });

    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_1' });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('affiche une erreur si le code est incorrect', async () => {
    mockAttempt.mockRejectedValueOnce({ errors: [{ code: 'form_code_incorrect' }] });

    await act(async () => {
      const { default: Page } = await import('@/app/sign-up/verify-email-address/page');
      render(<Page />);
    });

    fireEvent.change(screen.getByLabelText(/code de vérification/i), {
      target: { value: '000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /vérifier mon email/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/code incorrect/i);
    });
  });

  it('renvoie un nouveau code avec succès', async () => {
    mockPrepare.mockResolvedValueOnce({});

    await act(async () => {
      const { default: Page } = await import('@/app/sign-up/verify-email-address/page');
      render(<Page />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /renvoyer le code/i }));
    });

    const { toast } = require('sonner');
    expect(toast.success).toHaveBeenCalledWith('Nouveau code envoyé !');
  });

  it('redirige vers le dashboard si la session est déjà active', async () => {
    mockUseSession.mockReturnValue({ session: { id: 'sess_1' } });

    await act(async () => {
      const { default: Page } = await import('@/app/sign-up/verify-email-address/page');
      render(<Page />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it("notifie si l'email est déjà vérifié et active la session si possible", async () => {
    // simulate error message containing 'already been verified'
    mockAttempt.mockRejectedValueOnce({ message: 'Email has already been verified' });
    mockUseSignUp.mockReturnValue({
      isLoaded: true,
      setActive: mockSetActive,
      signUp: {
        status: 'complete',
        createdSessionId: 'sess_2',
        attemptEmailAddressVerification: mockAttempt,
        prepareEmailAddressVerification: mockPrepare,
        createdUserId: 'user_2',
      },
    });

    await act(async () => {
      const { default: Page } = await import('@/app/sign-up/verify-email-address/page');
      render(<Page />);
    });

    fireEvent.change(screen.getByLabelText(/code de vérification/i), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: /vérifier mon email/i }));

    const { toast } = require('sonner');
    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_2' });
      expect(toast.success).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
