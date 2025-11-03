import { fireEvent, render, screen } from '@testing-library/react';
import { Mail } from 'lucide-react';

import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';

const buttonMock = jest.fn(
  ({
    children,
    disabled,
    type,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    type?: string;
    onClick?: () => void;
  }) => (
    <button
      data-testid={`button-${type ?? 'button'}`}
      disabled={disabled}
      onClick={onClick}
      type={type as 'button' | 'submit'}
    >
      {children}
    </button>
  )
);

const inputOTPContext: { onChange?: (value: string) => void } = {};

const InputOTPSlotMock = jest.fn(({ index, className }: { index: number; className?: string }) => (
  <input data-testid='otp-slot' data-index={index} className={className} readOnly />
));

jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => buttonMock(props),
}));

jest.mock('@/components/ui/input-otp', () => ({
  InputOTP: ({
    children,
    value,
    onChange,
  }: {
    children: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
  }) => {
    inputOTPContext.onChange = onChange;
    return (
      <div data-testid='input-otp' data-value={value}>
        {children}
      </div>
    );
  },
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='input-otp-group'>{children}</div>
  ),
  InputOTPSlot: (props: any) => InputOTPSlotMock(props),
}));

describe('OtpVerificationCard', () => {
  const defaultProps = {
    icon: Mail,
    title: 'Vérification',
    description: 'Nous avons envoyé un code à',
    email: 'user@example.com',
    code: '123456',
    onCodeChange: jest.fn(),
    onSubmit: jest.fn(),
    onBack: jest.fn(),
    backLabel: 'Retour',
    onResend: jest.fn(),
    resendLabel: 'Renvoyer',
    isSubmitting: false,
    submitLabel: 'Continuer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    inputOTPContext.onChange = undefined;
  });

  it('renders the title, description and email', () => {
    render(<OtpVerificationCard {...defaultProps} />);

    expect(screen.getByText('Vérification')).toBeInTheDocument();
    expect(screen.getByText(/Nous avons envoyé un code/)).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('calls onSubmit when the form is submitted', () => {
    render(<OtpVerificationCard {...defaultProps} />);

    const form = screen.getByText('Vérification').closest('form');
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onResend when the helper button is clicked', () => {
    render(<OtpVerificationCard {...defaultProps} showResendHelper />);

    fireEvent.click(screen.getByRole('button', { name: 'Renvoyer' }));
    expect(defaultProps.onResend).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when the back button is clicked', () => {
    render(<OtpVerificationCard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('button-button'));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('displays error messages when provided', () => {
    render(
      <OtpVerificationCard
        {...defaultProps}
        errorMessage='Erreur globale'
        codeError='Code invalide'
      />
    );

    expect(screen.getByText('Erreur globale')).toBeInTheDocument();
    expect(screen.getByText('Code invalide')).toBeInTheDocument();
  });

  it('disables submit button when isSubmitDisabled is true', () => {
    render(<OtpVerificationCard {...defaultProps} isSubmitDisabled />);

    expect(screen.getByTestId('button-submit')).toBeDisabled();
  });

  it('uses the loading label when submitting', () => {
    render(<OtpVerificationCard {...defaultProps} isSubmitting />);

    expect(screen.getByText('Vérification...')).toBeInTheDocument();
  });

  it('renders the expected number of OTP slots', () => {
    render(<OtpVerificationCard {...defaultProps} otpLength={4} />);

    const slots = screen.getAllByTestId('otp-slot');
    expect(slots).toHaveLength(4);
  });

  it('forwards changes from the OTP input', () => {
    render(<OtpVerificationCard {...defaultProps} />);

    inputOTPContext.onChange?.('654321');
    expect(defaultProps.onCodeChange).toHaveBeenCalledWith('654321');
  });
});
