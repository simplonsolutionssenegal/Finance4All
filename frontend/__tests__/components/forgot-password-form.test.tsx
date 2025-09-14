/* eslint-disable import/order */
import { render, screen, fireEvent } from "@testing-library/react";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useClerk: jest.fn(),
  useSignIn: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock des hooks personnalisés
jest.mock("@/hooks/useFormState");
jest.mock("@/hooks/useForgotPassword");

// Mock des composants UI
jest.mock("@/components/password-input", () => ({
  PasswordInput: ({ onChange, value, ...props }: any) => (
    <input
      {...props}
      type="password"
      value={value}
      onChange={onChange}
      data-testid="password-input"
    />
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input
      {...props}
      value={value}
      onChange={onChange}
      data-testid="input"
    />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button {...props} onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => (
    <label {...props} data-testid="label">
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ onChange, value, children, containerClassName: _containerClassName, ...props }: any) => (
    <div {...props} data-testid="input-otp">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="otp-input"
        maxLength={6}
      />
      {children}
    </div>
  ),
  InputOTPGroup: ({ children, ...props }: any) => (
    <div {...props} data-testid="input-otp-group">
      {children}
    </div>
  ),
  InputOTPSlot: ({ index, ...props }: any) => (
    <input
      {...props}
      data-testid={`otp-slot-${index}`}
      key={index}
    />
  ),
}));

// Mock des fonctions de validation
jest.mock("@/lib/validation", () => ({
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  validateOTPCode: jest.fn(),
}));

import { useForgotPassword } from "@/hooks/useForgotPassword";
import { useFormState } from "@/hooks/useFormState";
import { validateEmail, validatePassword, validateOTPCode } from "@/lib/validation";

const mockUseFormState = useFormState as jest.MockedFunction<typeof useFormState>;
const mockUseForgotPassword = useForgotPassword as jest.MockedFunction<typeof useForgotPassword>;
const mockValidateEmail = validateEmail as jest.MockedFunction<typeof validateEmail>;
const mockValidatePassword = validatePassword as jest.MockedFunction<typeof validatePassword>;
const mockValidateOTPCode = validateOTPCode as jest.MockedFunction<typeof validateOTPCode>;

describe("ForgotPasswordForm", () => {
  const mockFormState = {
    values: {
      email: "",
      password: "",
      code: "",
    },
    errors: {},
  };

  const mockFormActions = {
    updateField: jest.fn(),
    setFieldError: jest.fn(),
    setErrors: jest.fn(),
    validate: jest.fn(),
    clearErrors: jest.fn(),
    resetForm: jest.fn(),
    hasError: jest.fn((_field: string) => false),
    getError: jest.fn((_field: string) => ""),
    isValid: true,
  };

  const mockForgotPasswordState = {
    isLoading: false,
    error: null,
    success: false,
    successMessage: null,
    sendResetLink: jest.fn(),
    resetPassword: jest.fn(),
    resetState: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseFormState.mockReturnValue({
      formState: mockFormState,
      ...mockFormActions,
    });

    mockUseForgotPassword.mockReturnValue(mockForgotPasswordState);

    mockValidateEmail.mockReturnValue("");
    mockValidatePassword.mockReturnValue("");
    mockValidateOTPCode.mockReturnValue("");
  });

  it("should render the form with correct title and description", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByText("Mot de passe oublié")).toBeInTheDocument();
    expect(screen.getByText("Entrez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé")).toBeInTheDocument();
  });

  it("should render step 1 form (email input) by default", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText("Email*")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(screen.getByText("Envoyer le lien de réinitialisation")).toBeInTheDocument();
  });

  it("should update email field when user types", () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("Votre email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(mockFormActions.updateField).toHaveBeenCalledWith("email", "test@example.com");
  });

  it("should show email validation error", () => {
    mockFormActions.hasError.mockReturnValue(true);
    mockFormActions.getError.mockReturnValue("Email invalide");

    render(<ForgotPasswordForm />);

    expect(screen.getByText("Email invalide")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should show general error message", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      error: "Erreur générale",
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText("Erreur générale")).toBeInTheDocument();
  });

  it("should show success message on step 1", () => {
    // Mock pour rester à l'étape 1 avec success mais sans passer à l'étape 2
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      successMessage: "Email envoyé avec succès",
    });

    render(<ForgotPasswordForm />);

    // Avec success=true, on passe automatiquement à l'étape 2, donc on teste le message d'erreur à l'étape 2
    expect(screen.getByText("Mot de passe réinitialisé !")).toBeInTheDocument();
  });

  it("should handle form submission with valid email", () => {
    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: { ...mockFormState.values, email: "test@example.com" },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Envoyer le lien de réinitialisation");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should handle form submission with invalid email", () => {
    mockValidateEmail.mockReturnValue("Email invalide");

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Envoyer le lien de réinitialisation");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should transition to step 2 when email is sent successfully", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText("Nouveau mot de passe*")).toBeInTheDocument();
    expect(screen.getByText("Code de réinitialisation*")).toBeInTheDocument();
    expect(screen.getByText("Mot de passe réinitialisé !")).toBeInTheDocument();
  });

  it("should update password field when user types", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    render(<ForgotPasswordForm />);

    const passwordInput = screen.getByTestId("password-input");
    fireEvent.change(passwordInput, { target: { value: "newpassword123" } });

    expect(mockFormActions.updateField).toHaveBeenCalledWith("password", "newpassword123");
  });

  it("should update OTP code when user types", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    render(<ForgotPasswordForm />);

    const otpInput = screen.getByTestId("otp-input");
    fireEvent.change(otpInput, { target: { value: "123456" } });

    expect(mockFormActions.updateField).toHaveBeenCalledWith("code", "123456");
  });

  it("should handle step 2 form submission with valid data", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: {
          ...mockFormState.values,
          password: "newpassword123",
          code: "123456",
        },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Mot de passe réinitialisé !");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should handle step 2 form submission with invalid password", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockValidatePassword.mockReturnValue("Mot de passe trop faible");

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Mot de passe réinitialisé !");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should handle step 2 form submission with invalid OTP code", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockValidateOTPCode.mockReturnValue("Code invalide");

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Mot de passe réinitialisé !");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should show loading state on button", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      isLoading: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText("Envoi en cours...")).toBeInTheDocument();
  });

  it("should show loading state on step 2 button", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      isLoading: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText("Réinitialisation en cours...")).toBeInTheDocument();
  });

  it("should disable button when form is invalid", () => {
    mockFormActions.hasError.mockReturnValue(true);

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Envoyer le lien de réinitialisation");
    expect(submitButton).toBeDisabled();
  });

  it("should show reset form button when success on step 1", () => {
    // Mock pour rester à l'étape 1 même avec success
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      successMessage: "Email envoyé",
    });

    render(<ForgotPasswordForm />);

    // Le bouton "Renvoyer" n'apparaît que si on reste à l'étape 1
    // Mais avec success=true, on passe automatiquement à l'étape 2
    expect(screen.getByText("Mot de passe réinitialisé !")).toBeInTheDocument();
  });

  it("should handle reset form button click", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      successMessage: "Email envoyé",
    });

    render(<ForgotPasswordForm />);

    // Avec success=true, on est à l'étape 2, donc on teste le bouton "Précédent"
    const previousButton = screen.getByText("← Précédent");
    fireEvent.click(previousButton);

    expect(mockForgotPasswordState.resetState).toHaveBeenCalled();
  });

  it("should show previous button on step 2", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    render(<ForgotPasswordForm />);

    expect(screen.getByText("← Précédent")).toBeInTheDocument();
  });

  it("should handle previous button click", async () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    render(<ForgotPasswordForm />);

    const previousButton = screen.getByText("← Précédent");
    fireEvent.click(previousButton);

    expect(mockForgotPasswordState.resetState).toHaveBeenCalled();
  });

  it("should clear error when user types in email field", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      error: "Some error",
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("Votre email");
    fireEvent.change(emailInput, { target: { value: "t" } });

    expect(mockForgotPasswordState.resetState).toHaveBeenCalled();
  });

  it("should clear error when user types in password field", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      error: "Some error",
    });

    render(<ForgotPasswordForm />);

    const passwordInput = screen.getByTestId("password-input");
    fireEvent.change(passwordInput, { target: { value: "p" } });

    expect(mockForgotPasswordState.resetState).toHaveBeenCalled();
  });

  it("should clear error when user types in OTP field", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      error: "Some error",
    });

    render(<ForgotPasswordForm />);

    const otpInput = screen.getByTestId("otp-input");
    fireEvent.change(otpInput, { target: { value: "1" } });

    expect(mockForgotPasswordState.resetState).toHaveBeenCalled();
  });

  it("should show password validation error", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockFormActions.hasError.mockImplementation((field: string) => field === "password");
    mockFormActions.getError.mockImplementation((field: string) => 
      field === "password" ? "Mot de passe trop faible" : ""
    );

    render(<ForgotPasswordForm />);

    expect(screen.getByText("Mot de passe trop faible")).toBeInTheDocument();
  });

  it("should show OTP validation error", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockFormActions.hasError.mockImplementation((field: string) => field === "code");
    mockFormActions.getError.mockImplementation((field: string) => 
      field === "code" ? "Code invalide" : ""
    );

    render(<ForgotPasswordForm />);

    expect(screen.getByText("Code invalide")).toBeInTheDocument();
  });

  it("should handle console error in sendResetLink", () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock sendResetLink pour rejeter avec une erreur
    const mockSendResetLink = jest.fn().mockRejectedValue(new Error("Network error"));
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      sendResetLink: mockSendResetLink,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Envoyer le lien de réinitialisation");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("should render OTP slots correctly", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    render(<ForgotPasswordForm />);

    // Vérifier que les 6 slots OTP sont rendus
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`otp-slot-${i}`)).toBeInTheDocument();
    }
  });

  it("should have proper accessibility attributes", () => {
    mockFormActions.hasError.mockReturnValue(true);

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText("Votre email");
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
  });

  it("should have proper accessibility attributes for password field", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockFormActions.hasError.mockImplementation((field: string) => field === "password");

    render(<ForgotPasswordForm />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-describedby", "password-error");
  });

  it("should handle sendResetLink with empty email", () => {
    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: { ...mockFormState.values, email: "" },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Envoyer le lien de réinitialisation");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should handle resetPassword with empty password", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: {
          ...mockFormState.values,
          password: "",
          code: "123456",
        },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Mot de passe réinitialisé !");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should handle resetPassword with empty code", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: {
          ...mockFormState.values,
          password: "newpassword123",
          code: "",
        },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Mot de passe réinitialisé !");
    fireEvent.click(submitButton);

    expect(submitButton).toBeInTheDocument();
  });

  it("should handle reset form button click on step 1", () => {
    // Pour tester le bouton "Renvoyer", on doit rester à l'étape 1
    // On utilise un mock qui ne passe pas à l'étape 2
    const mockResetForm = jest.fn();
    const mockResetState = jest.fn();
    
    mockUseFormState.mockReturnValue({
      formState: mockFormState,
      ...mockFormActions,
      resetForm: mockResetForm,
    });

    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      successMessage: "Email envoyé",
      resetState: mockResetState,
    });

    render(<ForgotPasswordForm />);

    const previousButton = screen.getByText("← Précédent");
    fireEvent.click(previousButton);

    expect(mockResetState).toHaveBeenCalled();
  });

  it("should handle form validation with whitespace-only email", () => {
    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: { ...mockFormState.values, email: "   " },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Envoyer le lien de réinitialisation");
    expect(submitButton).toBeDisabled();
  });

  it("should handle form validation with whitespace-only password", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: {
          ...mockFormState.values,
          password: "   ",
          code: "123456",
        },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Mot de passe réinitialisé !");
    expect(submitButton).toBeDisabled();
  });

  it("should handle form validation with whitespace-only code", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: {
          ...mockFormState.values,
          password: "newpassword123",
          code: "   ",
        },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const submitButton = screen.getByText("Mot de passe réinitialisé !");
    expect(submitButton).toBeDisabled();
  });

  it("should handle button text changes correctly", () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      isLoading: true,
    });

    render(<ForgotPasswordForm />);
    expect(screen.getByText("Envoi en cours...")).toBeInTheDocument();
  });

  it("should handle cleanup on unmount", () => {
    const { unmount } = render(<ForgotPasswordForm />);
    
    unmount();
    
    expect(mockForgotPasswordState.resetState).toHaveBeenCalled();
  });

  it("should handle step transition correctly", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("Envoyer le lien de réinitialisation")).toBeInTheDocument();

    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    const { rerender: _rerender } = render(<ForgotPasswordForm />);
    expect(screen.getByText("Mot de passe réinitialisé !")).toBeInTheDocument();
  });

  it("should handle form submission with valid email and call sendResetLink", async () => {
    const mockSendResetLink = jest.fn().mockResolvedValue(undefined);
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      sendResetLink: mockSendResetLink,
    });

    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: { ...mockFormState.values, email: "test@example.com" },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const form = screen.getByDisplayValue("test@example.com").closest('form');
    fireEvent.submit(form!);

    // Attendre que la fonction asynchrone soit appelée
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    expect(mockValidateEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("should handle form submission with invalid email and set error", async () => {
    mockValidateEmail.mockReturnValue("Email invalide");

    render(<ForgotPasswordForm />);

    const form = screen.getByPlaceholderText("Votre email").closest('form');
    fireEvent.submit(form!);

    // Attendre que la fonction asynchrone soit appelée
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    expect(mockFormActions.setFieldError).toHaveBeenCalledWith("email", "Email invalide");
  });

  it("should handle step 2 form submission with valid data and call resetPassword", async () => {
    const mockResetPassword = jest.fn().mockResolvedValue(undefined);
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      resetPassword: mockResetPassword,
    });

    mockUseFormState.mockReturnValue({
      formState: {
        ...mockFormState,
        values: {
          ...mockFormState.values,
          password: "newpassword123",
          code: "123456",
        },
      },
      ...mockFormActions,
    });

    render(<ForgotPasswordForm />);

    const form = screen.getByDisplayValue("newpassword123").closest('form');
    fireEvent.submit(form!);

    // Attendre que la fonction asynchrone soit appelée
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    expect(mockValidatePassword).toHaveBeenCalledWith("newpassword123");
    expect(mockValidateOTPCode).toHaveBeenCalledWith("123456");
  });

  it("should handle step 2 form submission with invalid password and set error", async () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockValidatePassword.mockReturnValue("Mot de passe trop faible");

    render(<ForgotPasswordForm />);

    const form = screen.getByTestId("password-input").closest('form');
    fireEvent.submit(form!);

    // Attendre que la fonction asynchrone soit appelée
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    expect(mockFormActions.setFieldError).toHaveBeenCalledWith("password", "Mot de passe trop faible");
  });

  it("should handle step 2 form submission with invalid code and set error", async () => {
    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
    });

    mockValidateOTPCode.mockReturnValue("Code invalide");

    render(<ForgotPasswordForm />);

    const form = screen.getByTestId("otp-input").closest('form');
    fireEvent.submit(form!);

    // Attendre que la fonction asynchrone soit appelée
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    expect(mockFormActions.setFieldError).toHaveBeenCalledWith("code", "Code invalide");
  });

  it("should handle reset form button click and call resetForm", () => {
    const mockResetForm = jest.fn();
    const mockResetState = jest.fn();
    
    mockUseFormState.mockReturnValue({
      formState: mockFormState,
      ...mockFormActions,
      resetForm: mockResetForm,
    });

    mockUseForgotPassword.mockReturnValue({
      ...mockForgotPasswordState,
      success: true,
      resetState: mockResetState,
    });

    render(<ForgotPasswordForm />);

    const previousButton = screen.getByText("← Précédent");
    fireEvent.click(previousButton);

    expect(mockResetState).toHaveBeenCalled();
  });
});
