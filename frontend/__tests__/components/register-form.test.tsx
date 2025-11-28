import { act, fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';

import { RegisterForm } from '@/components/register-form';

const OtpVerificationCardMock = jest.fn(
  ({
    title,
    email,
    errorMessage,
    codeError,
    onSubmit,
    onResend,
    onBack,
    code,
    onCodeChange,
  }: {
    title: string;
    email: string;
    errorMessage: string | null;
    codeError: string | null;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onResend: () => void;
    onBack: () => void;
    code: string;
    onCodeChange: (value: string) => void;
  }) => (
    <div data-testid='otp-card'>
      <h2>{title}</h2>
      <p>{email}</p>
      {errorMessage && (
        <div role='alert' data-testid='otp-error'>
          {errorMessage}
        </div>
      )}
      {codeError && (
        <div role='alert' data-testid='otp-code-error'>
          {codeError}
        </div>
      )}
      <input
        data-testid='otp-input'
        value={code}
        onChange={event => onCodeChange(event.target.value)}
      />
      <button
        data-testid='otp-submit'
        onClick={() =>
          onSubmit({ preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>)
        }
      >
        submit
      </button>
      <button data-testid='otp-resend' onClick={onResend}>
        resend
      </button>
      <button data-testid='otp-back' onClick={onBack}>
        back
      </button>
    </div>
  )
);

jest.mock('@/components/auth/OtpVerificationCard', () => ({
  OtpVerificationCard: (props: any) => OtpVerificationCardMock(props),
}));

jest.mock('@/hooks/auth/useSocialAuth', () => ({
  useSocialAuth: jest.fn(),
}));

jest.mock('@/hooks/beneficiary/useCreateBeneficiary', () => ({
  useCreateBeneficiary: jest.fn(),
}));

const { useSocialAuth } = require('@/hooks/auth/useSocialAuth');
const { useCreateBeneficiary } = require('@/hooks/beneficiary/useCreateBeneficiary');

function buildUseCreateBeneficiaryReturn(overrides: any = {}) {
  const base = {
    formState: {
      values: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
      },
      errors: {},
    },
    updateField: jest.fn(),
    hasError: jest.fn(() => false),
    getError: jest.fn(() => ''),
    isFormValid: false,
    isLoading: false,
    error: null,
    isLoaded: true,
    isOtpVerification: false,
    verificationError: null,
    isVerifying: false,
    verificationStrategy: null,
    verificationTarget: '',
    handleFieldChange: jest.fn(() => jest.fn()),
    handleCreateBeneficiary: jest.fn(),
    handleVerification: jest.fn(),
    handleResendCode: jest.fn(),
  };

  const merged = {
    ...base,
    ...overrides,
  };

  if (overrides.formState) {
    merged.formState = {
      values: {
        ...base.formState.values,
        ...(overrides.formState.values ?? {}),
      },
      errors: {
        ...base.formState.errors,
        ...(overrides.formState.errors ?? {}),
      },
    };
  }

  return merged;
}

beforeEach(() => {
  jest.clearAllMocks();
  (useCreateBeneficiary as jest.Mock).mockReturnValue(buildUseCreateBeneficiaryReturn());
  (useSocialAuth as jest.Mock).mockReturnValue({
    handleSocialAuth: jest.fn(),
    isLoaded: true,
    error: null,
    isLoading: false,
  });
});

describe('RegisterForm', () => {
  it('renders the registration step by default', () => {
    render(<RegisterForm />);

    expect(screen.getByText('Créer votre compte')).toBeInTheDocument();
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText('Téléphone')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer mon compte' })).toBeInTheDocument();
  });

  it('submits the registration form when valid', () => {
    const handleCreateBeneficiary = jest.fn();
    (useCreateBeneficiary as jest.Mock).mockReturnValue(
      buildUseCreateBeneficiaryReturn({
        isFormValid: true,
        handleCreateBeneficiary,
      })
    );

    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: 'Créer mon compte' });
    const form = submitButton.closest('form');
    expect(form).not.toBeNull();

    if (form) {
      fireEvent.submit(form);
    }

    expect(handleCreateBeneficiary).toHaveBeenCalledTimes(1);
  });

  it('displays API errors in the registration step', () => {
    (useCreateBeneficiary as jest.Mock).mockReturnValue(
      buildUseCreateBeneficiaryReturn({
        error: 'Une erreur est survenue.',
      })
    );

    render(<RegisterForm />);

    expect(screen.getByText('Une erreur est survenue.')).toBeInTheDocument();
  });

  it('renders the OTP verification step when required', async () => {
    const handleResendCode = jest.fn();
    const handleVerification = jest.fn();

    (useCreateBeneficiary as jest.Mock).mockReturnValue(
      buildUseCreateBeneficiaryReturn({
        isOtpVerification: true,
        verificationTarget: 'user@example.com',
        verificationError: 'Code invalide',
        isVerifying: false,
        formState: {
          values: {
            email: 'user@example.com',
          },
        },
        handleResendCode,
        handleVerification,
      })
    );

    render(<RegisterForm />);

    // Allow effects to run
    await screen.findByTestId('otp-card');

    expect(OtpVerificationCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Vérification de l'Email",
        email: 'user@example.com',
        code: '',
        resendLabel: 'Renvoyer le code',
        backLabel: 'Retour au formulaire',
      })
    );

    const otpProps =
      OtpVerificationCardMock.mock.calls[OtpVerificationCardMock.mock.calls.length - 1][0];
    act(() => {
      otpProps.onResend();
    });
    expect(handleResendCode).toHaveBeenCalledTimes(1);

    act(() => {
      otpProps.onSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });
    expect(handleVerification).toHaveBeenCalledTimes(1);
  });

  it('displays social auth error and disables social buttons when loading', () => {
    (useSocialAuth as jest.Mock).mockReturnValue({
      handleSocialAuth: jest.fn(),
      isLoaded: true,
      error: 'Vous êtes déjà connecté.',
      isLoading: true,
    });

    render(<RegisterForm />);

    // Error message from social auth is visible
    expect(screen.getByText('Vous êtes déjà connecté.')).toBeInTheDocument();

    // Social buttons are disabled while social loading
    const googleBtn = screen.getByRole('button', { name: /s'inscrire avec google/i });
    const facebookBtn = screen.getByRole('button', { name: /s'inscrire avec facebook/i });
    const appleBtn = screen.getByRole('button', { name: /s'inscrire avec apple/i });
    expect(googleBtn).toBeDisabled();
    expect(facebookBtn).toBeDisabled();
    expect(appleBtn).toBeDisabled();
  });

  it('disables social buttons when social auth is not loaded', () => {
    (useSocialAuth as jest.Mock).mockReturnValue({
      handleSocialAuth: jest.fn(),
      isLoaded: false,
      error: null,
      isLoading: false,
    });

    render(<RegisterForm />);

    const googleBtn = screen.getByRole('button', { name: /s'inscrire avec google/i });
    const facebookBtn = screen.getByRole('button', { name: /s'inscrire avec facebook/i });
    const appleBtn = screen.getByRole('button', { name: /s'inscrire avec apple/i });
    expect(googleBtn).toBeDisabled();
    expect(facebookBtn).toBeDisabled();
    expect(appleBtn).toBeDisabled();
  });

  it('shows resend spinner text when isResending is true in OTP step', async () => {
    (useCreateBeneficiary as jest.Mock).mockReturnValue(
      buildUseCreateBeneficiaryReturn({
        isOtpVerification: true,
        verificationTarget: 'user@example.com',
        isResending: true,
        isVerifying: false,
        formState: {
          values: {
            email: 'user@example.com',
          },
        },
      })
    );

    render(<RegisterForm />);
    await screen.findByTestId('otp-card');

    // The footer has the resend area with dynamic text
    expect(screen.getByText('Envoi en cours...')).toBeInTheDocument();
  });

  it('returns to step 1 when clicking back from OTP', async () => {
    (useCreateBeneficiary as jest.Mock).mockReturnValue(
      buildUseCreateBeneficiaryReturn({
        isOtpVerification: true,
        verificationTarget: 'user@example.com',
        isVerifying: false,
        formState: {
          values: {
            email: 'user@example.com',
          },
        },
      })
    );

    render(<RegisterForm />);
    await screen.findByTestId('otp-card');

    const otpProps =
      OtpVerificationCardMock.mock.calls[OtpVerificationCardMock.mock.calls.length - 1][0];
    act(() => {
      otpProps.onBack();
    });

    // After back, we should see the registration title again (step 1)
    expect(screen.getByText('Créer votre compte')).toBeInTheDocument();
  });

  it('calls social auth handlers when buttons are clicked', () => {
    const handleSocialAuth = jest.fn();
    (useSocialAuth as jest.Mock).mockReturnValue({
      handleSocialAuth,
      isLoaded: true,
      error: null,
      isLoading: false,
    });

    render(<RegisterForm />);

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire avec google/i }));
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire avec facebook/i }));
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire avec apple/i }));

    expect(handleSocialAuth).toHaveBeenCalledTimes(3);
  });
});
