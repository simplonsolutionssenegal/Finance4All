import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';

import { LoginForm } from '@/components/login-form';

const InputFieldMock = jest.fn(
  ({
    id,
    label,
    placeholder,
    value,
    onChange,
    hasError,
    errorMessage,
    disabled,
  }: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    hasError: boolean;
    errorMessage?: string;
    disabled: boolean;
  }) => (
    <div data-testid={`input-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && errorMessage ? (
        <span id={`${id}-error`} role='alert'>
          {errorMessage}
        </span>
      ) : null}
    </div>
  )
);

const SubmitButtonMock = jest.fn(
  ({
    children,
    disabled,
    isLoading,
  }: {
    children: React.ReactNode;
    disabled: boolean;
    isLoading: boolean;
  }) => (
    <button data-testid='submit-button' type='submit' disabled={disabled}>
      {isLoading ? 'Loading…' : children}
    </button>
  )
);

const OtpVerificationCardMock = jest.fn(
  ({
    title,
    email,
    code,
    onCodeChange,
    onSubmit,
    onBack,
    onResend,
    submitLabel,
    loadingLabel,
    isSubmitting,
    errorMessage,
    codeError,
  }: {
    title: string;
    email: string;
    code: string;
    onCodeChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onBack: () => void;
    onResend: () => void;
    submitLabel: string;
    loadingLabel: string;
    isSubmitting: boolean;
    errorMessage?: string | null;
    codeError?: string | null;
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
        disabled={isSubmitting}
      >
        {isSubmitting ? loadingLabel : submitLabel}
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

jest.mock('@/components/auth/FormComponents', () => ({
  InputField: (props: any) => InputFieldMock(props),
  SubmitButton: (props: any) => SubmitButtonMock(props),
}));

jest.mock('@/components/auth/OtpVerificationCard', () => ({
  OtpVerificationCard: (props: any) => OtpVerificationCardMock(props),
}));

jest.mock('@/hooks/login/useLogin', () => ({
  useLogin: jest.fn(),
}));

const { useLogin } = require('@/hooks/login/useLogin');

function buildUseLoginReturn(overrides: any = {}) {
  const base = {
    formState: {
      values: {
        email: '',
        code: '',
      },
      errors: {},
    },
    hasError: jest.fn(() => false),
    getError: jest.fn(() => ''),
    isFormValid: true,
    isLoading: false,
    error: null,
    isLoaded: true,
    success: false,
    successMessage: null,
    step: 1,
    setStep: jest.fn(),
    handleFieldChange: jest.fn(() => jest.fn()),
    handleCodeChange: jest.fn(),
    handleSendOTP: jest.fn(),
    handleVerifyOTP: jest.fn(),
    handlePreviousStep: jest.fn(),
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
  (useLogin as jest.Mock).mockReturnValue(buildUseLoginReturn());
});

describe('LoginForm', () => {
  it('renders the email step by default', () => {
    render(<LoginForm />);

    expect(screen.getByText('Bienvenue !')).toBeInTheDocument();
    expect(screen.getByText('Connectez-vous avec votre adresse email')).toBeInTheDocument();
    expect(InputFieldMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'email',
        label: 'Adresse email',
        placeholder: 'votre@email.com',
        type: 'email',
      })
    );
    expect(screen.getByText('Recevoir le code OTP')).toBeInTheDocument();
  });

  it('submits the email form via handleSendOTP', () => {
    const handleSendOTP = jest.fn();
    (useLogin as jest.Mock).mockReturnValue(
      buildUseLoginReturn({
        handleSendOTP,
      })
    );

    render(<LoginForm />);

    const submitButton = screen.getByTestId('submit-button');
    const form = submitButton.closest('form');
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }

    expect(handleSendOTP).toHaveBeenCalledTimes(1);
  });

  it('displays success feedback after sending the code', () => {
    (useLogin as jest.Mock).mockReturnValue(
      buildUseLoginReturn({
        success: true,
        successMessage: 'Un code a été envoyé.',
      })
    );

    render(<LoginForm />);

    expect(screen.getByText('Un code a été envoyé.')).toBeInTheDocument();
  });

  it('shows an error message when present', () => {
    (useLogin as jest.Mock).mockReturnValue(
      buildUseLoginReturn({
        error: 'Adresse email inconnue.',
      })
    );

    render(<LoginForm />);

    expect(screen.getByText('Adresse email inconnue.')).toBeInTheDocument();
  });

  it('renders the OTP verification step when step equals 2', () => {
    const handleVerifyOTP = jest.fn();
    const handleResendCode = jest.fn();
    const handlePreviousStep = jest.fn();
    const handleCodeChange = jest.fn();

    (useLogin as jest.Mock).mockReturnValue(
      buildUseLoginReturn({
        step: 2,
        formState: {
          values: {
            email: 'user@example.com',
            code: '123456',
          },
        },
        handleVerifyOTP,
        handleResendCode,
        handlePreviousStep,
        handleCodeChange,
      })
    );

    render(<LoginForm />);

    expect(OtpVerificationCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        code: '123456',
        submitLabel: 'Se connecter',
        loadingLabel: 'Vérification...',
      })
    );

    fireEvent.change(screen.getByTestId('otp-input'), { target: { value: '654321' } });
    expect(handleCodeChange).toHaveBeenCalledWith('654321');

    fireEvent.click(screen.getByTestId('otp-submit'));
    expect(handleVerifyOTP).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('otp-resend'));
    expect(handleResendCode).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('otp-back'));
    expect(handlePreviousStep).toHaveBeenCalledTimes(1);
  });

  it('displays code validation errors in the OTP step', () => {
    (useLogin as jest.Mock).mockReturnValue(
      buildUseLoginReturn({
        step: 2,
        formState: {
          values: {
            email: 'user@example.com',
            code: '',
          },
        },
        hasError: jest.fn((field: string) => field === 'code'),
        getError: jest.fn(() => 'Le code est requis.'),
      })
    );

    render(<LoginForm />);

    const otpProps = OtpVerificationCardMock.mock.calls[0][0];
    expect(otpProps.codeError).toBe('Le code est requis.');
  });

  it('disables the submit button when the form is invalid', () => {
    (useLogin as jest.Mock).mockReturnValue(
      buildUseLoginReturn({
        isFormValid: false,
      })
    );

    render(<LoginForm />);

    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });
});
