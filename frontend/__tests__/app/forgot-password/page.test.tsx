import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ForgotPassword from "@/app/forgot-password/page";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useClerk: jest.fn(() => ({
    client: {
      signIn: {
        create: jest.fn(),
      },
    },
    session: null,
  })),
}));

// Mock the useForgotPassword hook
jest.mock("@/hooks/useForgotPassword", () => ({
  useForgotPassword: jest.fn(() => ({
    isLoading: false,
    error: null,
    success: false,
    successMessage: null,
    sendResetLink: jest.fn(),
    resetState: jest.fn(),
  })),
}));

describe("ForgotPassword", () => {
  const mockSendResetLink = jest.fn();
  const mockResetState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: false,
      successMessage: null,
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });
  });

  it("renders without crashing", () => {
    render(<ForgotPassword />);
    expect(screen.getByText("Mot de passe oublié")).toBeInTheDocument();
  });

  it("displays the correct content", () => {
    render(<ForgotPassword />);
    const title = screen.getByText("Mot de passe oublié");
    const subtitle = screen.getByText("Entrez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé");
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<ForgotPassword />);
    expect(screen.getByLabelText("Email*")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ForgotPassword />);
    const submitButton = screen.getByRole("button", { name: /envoyer le lien de réinitialisation/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("renders back to login link", () => {
    render(<ForgotPassword />);
    const backLink = screen.getByText("← Retour à la connexion");
    expect(backLink).toBeInTheDocument();
  });

  it("should be a function that returns JSX", () => {
    expect(typeof ForgotPassword).toBe("function");
    const { container } = render(<ForgotPassword />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("displays left section content", () => {
    render(<ForgotPassword />);
    expect(screen.getByText("Réinitialisez votre mot de passe")).toBeInTheDocument();
  });

  it("displays email validation message", () => {
    render(<ForgotPassword />);
    expect(screen.getByText("Assurez-vous de vérifier vos courriers indésirables si vous ne recevez pas notre e-mail dans quelques minutes.")).toBeInTheDocument();
  });

  it("handles email input change", () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("shows validation error for empty email", async () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    const form = emailInput.closest("form");
    
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText("Le champ email est requis.")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    const form = emailInput.closest("form");
    
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText("Veuillez entrer une adresse email valide.")).toBeInTheDocument();
    });
  });

  it("calls sendResetLink with valid email", async () => {
    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    const form = emailInput.closest("form");
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockSendResetLink).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("displays loading state", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: true,
      error: null,
      success: false,
      successMessage: null,
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    expect(screen.getByText("Envoi en cours...")).toBeInTheDocument();
  });

  it("displays error message", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: "Erreur lors de l'envoi",
      success: false,
      successMessage: null,
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    expect(screen.getByText("Erreur lors de l'envoi")).toBeInTheDocument();
  });

  it("displays success message", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: true,
      successMessage: "Lien envoyé avec succès !",
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    expect(screen.getByText("Lien envoyé avec succès !")).toBeInTheDocument();
    expect(screen.getByText("Lien envoyé !")).toBeInTheDocument();
  });

  it("shows resend button when success", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: true,
      successMessage: "Lien envoyé avec succès !",
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    expect(screen.getByText("Renvoyer le lien de réinitialisation")).toBeInTheDocument();
  });

  it("calls resetState when resend button is clicked", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: true,
      successMessage: "Lien envoyé avec succès !",
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    const resendButton = screen.getByText("Renvoyer le lien de réinitialisation");
    fireEvent.click(resendButton);
    
    expect(mockResetState).toHaveBeenCalled();
  });

  it("clears email error when typing in email field", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: false,
      successMessage: null,
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    
    // First trigger validation error
    fireEvent.change(emailInput, { target: { value: "" } });
    const form = emailInput.closest("form");
    fireEvent.submit(form!);
    
    // Then type in the field to clear the error
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    
    // The error should be cleared (this tests line 21-22)
    expect(screen.queryByText("Le champ email est requis.")).not.toBeInTheDocument();
  });

  it("calls resetState when typing in email field after error", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: "Some error message",
      success: false,
      successMessage: null,
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    
    // Type in the field to trigger resetState (line 24-26)
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    
    expect(mockResetState).toHaveBeenCalled();
  });

  it("displays success state correctly", () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: true,
      successMessage: "Lien envoyé avec succès !",
      sendResetLink: mockSendResetLink,
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    
    // Verify that success state is displayed correctly
    expect(screen.getByText("Lien envoyé avec succès !")).toBeInTheDocument();
    expect(screen.getByText("Lien envoyé !")).toBeInTheDocument();
    expect(screen.getByText("Renvoyer le lien de réinitialisation")).toBeInTheDocument();
  });

  it("handles form submission error", async () => {
    const { useForgotPassword } = require("@/hooks/useForgotPassword");
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    useForgotPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: false,
      successMessage: null,
      sendResetLink: jest.fn().mockRejectedValue(new Error("API Error")),
      resetState: mockResetState,
    });

    render(<ForgotPassword />);
    const emailInput = screen.getByPlaceholderText("Votre email");
    const form = emailInput.closest("form");
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Erreur lors de l'envoi:", expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});
