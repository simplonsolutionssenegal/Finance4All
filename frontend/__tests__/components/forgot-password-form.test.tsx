/* eslint-disable import/order */
import { render, screen, fireEvent } from '@testing-library/react';
import { ForgotPasswordForm } from '@/components/forgot-password-form';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useClerk: jest.fn(),
  useSignIn: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock des hooks personnalisés
jest.mock('@/hooks/useFormState');
jest.mock('@/hooks/forgot-password/useForgotPassword');

// Mock des composants UI
jest.mock('@/components/password-input', () => ({
  PasswordInput: ({ onChange, value, ...props }: any) => (
    <input
      {...props}
      type='password'
      value={value}
      onChange={onChange}
      data-testid='password-input'
    />
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input {...props} value={value} onChange={onChange} data-testid='input' />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick} data-testid='button'>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => (
    <label {...props} data-testid='label'>
      {children}
    </label>
  ),
}));

jest.mock('@/components/ui/input-otp', () => ({
  InputOTP: ({
    onChange,
    value,
    children,
    containerClassName: _containerClassName,
    ...props
  }: any) => (
    <div {...props} data-testid='input-otp'>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        data-testid='otp-input'
        maxLength={6}
      />
      {children}
    </div>
  ),
  InputOTPGroup: ({ children, ...props }: any) => (
    <div {...props} data-testid='input-otp-group'>
      {children}
    </div>
  ),
  InputOTPSlot: ({ index, ...props }: any) => (
    <input {...props} data-testid={`otp-slot-${index}`} key={index} />
  ),
}));

// Mock des fonctions de validation
jest.mock('@/lib/validation', () => ({
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  validateOTPCode: jest.fn(),
}));

import { useForgotPassword } from '@/hooks/forgot-password/useForgotPassword';
import { validateEmail, validatePassword, validateOTPCode } from '@/lib/validation';

const mockUseForgotPassword = useForgotPassword as jest.MockedFunction<typeof useForgotPassword>;
const mockValidateEmail = validateEmail as jest.MockedFunction<typeof validateEmail>;
const mockValidatePassword = validatePassword as jest.MockedFunction<typeof validatePassword>;
const mockValidateOTPCode = validateOTPCode as jest.MockedFunction<typeof validateOTPCode>;

describe('ForgotPasswordForm', () => {
  const mockFormState = {
    values: {
      email: '',
      password: '',
      code: '',
    },
    errors: {},
  };

  const mockForgotPasswordState = {
    formState: mockFormState,
    updateField: jest.fn(),
    setFieldError: jest.fn(),
    hasError: jest.fn((_field: string) => false),
    getError: jest.fn((_field: string) => ''),
    isFormValid: true,
    step: 1,
    setStep: jest.fn(),
    isLoading: false,
    error: null,
    success: false,
    successMessage: null,
    handleEmailChange: jest.fn(),
    handlePasswordChange: jest.fn(),
    handleCodeChange: jest.fn(),
    handleSendResetLink: jest.fn(),
    handleResetPassword: jest.fn(),
    handleResetForm: jest.fn(),
    handlePreviousStep: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseForgotPassword.mockReturnValue(mockForgotPasswordState);

    mockValidateEmail.mockReturnValue('');
    mockValidatePassword.mockReturnValue('');
    mockValidateOTPCode.mockReturnValue('');
  });

  it('should render the form with correct title and description', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    expect(screen.getByText('Entrez votre email pour réinitialiser')).toBeInTheDocument();
  });

  it('should render step 1 form (email input) by default', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('amadou@example.com')).toBeInTheDocument();
    expect(screen.getByText('Envoyer le lien de réinitialisation')).toBeInTheDocument();
  });

  it('should update email field when user types', () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('amadou@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(mockForgotPasswordState.handleEmailChange).toHaveBeenCalled();
  });

  it('should show email validation error', () => {
    mockForgotPasswordState.hasError.mockReturnValue(true);
    mockForgotPasswordState.getError.mockReturnValue('Email invalide');

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Email invalide')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should show general error message', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      error: 'Erreur générale',
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Erreur générale')).toBeInTheDocument();
  });

  it('should show success message on step 1', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      successMessage: 'Email envoyé avec succès',
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Email envoyé avec succès')).toBeInTheDocument();
  });

  it('should handle form submission with valid email', () => {
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText('Envoyer le lien de réinitialisation');
    fireEvent.click(submitButton);

    expect(mockForgotPasswordState.handleSendResetLink).toHaveBeenCalled();
  });

  it('should handle form submission with invalid email', () => {
    mockValidateEmail.mockReturnValue('Email invalide');

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText('Envoyer le lien de réinitialisation');
    fireEvent.click(submitButton);

    expect(mockForgotPasswordState.handleSendResetLink).toHaveBeenCalled();
  });

  it('should transition to step 2 when email is sent successfully', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Code de réinitialisation')).toBeInTheDocument();
    expect(screen.getByText('Réinitialiser le mot de passe')).toBeInTheDocument();
  });

  it('should update password field when user types', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });

    expect(mockForgotPasswordState.handlePasswordChange).toHaveBeenCalled();
  });

  it('should update OTP code when user types', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);

    const otpInput = screen.getByTestId('otp-input');
    fireEvent.change(otpInput, { target: { value: '123456' } });

    expect(mockForgotPasswordState.handleCodeChange).toHaveBeenCalled();
  });

  it('should handle step 2 form submission with valid data', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText('Réinitialiser le mot de passe');
    fireEvent.click(submitButton);

    expect(mockForgotPasswordState.handleResetPassword).toHaveBeenCalled();
  });

  it('should handle step 2 form submission with invalid password', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    mockValidatePassword.mockReturnValue('Mot de passe trop faible');

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText('Réinitialiser le mot de passe');
    fireEvent.click(submitButton);

    expect(mockForgotPasswordState.handleResetPassword).toHaveBeenCalled();
  });

  it('should handle step 2 form submission with invalid OTP code', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    mockValidateOTPCode.mockReturnValue('Code invalide');

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText('Réinitialiser le mot de passe');
    fireEvent.click(submitButton);

    expect(mockForgotPasswordState.handleResetPassword).toHaveBeenCalled();
  });

  it('should show loading state on button', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      isLoading: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Envoi en cours...')).toBeInTheDocument();
  });

  it('should show loading state on step 2 button', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
      isLoading: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Réinitialisation en cours...')).toBeInTheDocument();
  });

  it('should disable button when form is invalid', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      isFormValid: false,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText('Envoyer le lien de réinitialisation');
    expect(submitButton).toBeDisabled();
  });

  it('should show reset form button when success on step 1', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      successMessage: 'Email envoyé',
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Renvoyer le lien de réinitialisation')).toBeInTheDocument();
  });

  it('should handle reset form button click', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      successMessage: 'Email envoyé',
    });

    render(<ForgotPasswordForm />);

    const resetButton = screen.getByText('Renvoyer le lien de réinitialisation');
    fireEvent.click(resetButton);

    expect(mockForgotPasswordState.handleResetForm).toHaveBeenCalled();
  });

  it('should show previous button on step 2', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText('← Précédent')).toBeInTheDocument();
  });

  it('should handle previous button click', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);

    const previousButton = screen.getByText('← Précédent');
    fireEvent.click(previousButton);

    expect(mockForgotPasswordState.handlePreviousStep).toHaveBeenCalled();
  });

  it('should clear error when user types in email field', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      error: 'Some error',
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('amadou@example.com');
    fireEvent.change(emailInput, { target: { value: 't' } });

    expect(mockForgotPasswordState.handleEmailChange).toHaveBeenCalled();
  });

  it('should clear error when user types in password field', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
      error: 'Some error',
    });

    render(<ForgotPasswordForm />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'p' } });

    expect(mockForgotPasswordState.handlePasswordChange).toHaveBeenCalled();
  });

  it('should clear error when user types in OTP field', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
      error: 'Some error',
    });

    render(<ForgotPasswordForm />);

    const otpInput = screen.getByTestId('otp-input');
    fireEvent.change(otpInput, { target: { value: '1' } });

    expect(mockForgotPasswordState.handleCodeChange).toHaveBeenCalled();
  });

  it('should show password validation error', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    mockForgotPasswordState.hasError.mockImplementation((field: string) => field === 'password');
    mockForgotPasswordState.getError.mockImplementation((field: string) =>
      field === 'password' ? 'Mot de passe trop faible' : ''
    );

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Mot de passe trop faible')).toBeInTheDocument();
  });

  it('should show OTP validation error', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    mockForgotPasswordState.hasError.mockImplementation((field: string) => field === 'code');
    mockForgotPasswordState.getError.mockImplementation((field: string) =>
      field === 'code' ? 'Code invalide' : ''
    );

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Code invalide')).toBeInTheDocument();
  });

  it('should render OTP slots correctly', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);

    // Vérifier que les 6 slots OTP sont rendus
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`otp-slot-${i}`)).toBeInTheDocument();
    }
  });

  it('should have proper accessibility attributes', () => {
    mockForgotPasswordState.hasError.mockReturnValue(true);

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText('amadou@example.com');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('should have proper accessibility attributes for password field', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    mockForgotPasswordState.hasError.mockImplementation((field: string) => field === 'password');

    render(<ForgotPasswordForm />);

    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
  });

  it('should handle button text changes correctly', () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      isLoading: true,
    });

    render(<ForgotPasswordForm />);
    expect(screen.getByText('Envoi en cours...')).toBeInTheDocument();
  });

  it('should handle cleanup on unmount', () => {
    const { unmount } = render(<ForgotPasswordForm />);

    unmount();

    expect(mockForgotPasswordState.handlePreviousStep).toHaveBeenCalled();
  });

  it('should handle step transition correctly', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText('Envoyer le lien de réinitialisation')).toBeInTheDocument();

    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      step: 2,
      success: true,
    });

    render(<ForgotPasswordForm />);
    expect(screen.getByText('Réinitialiser le mot de passe')).toBeInTheDocument();
  });
});
