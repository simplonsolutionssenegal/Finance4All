import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ResetPassword from "@/app/reset-password/page";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(() => ({
    user: { id: "user123" },
  })),
}));

// Mock the useResetPassword hook
jest.mock("@/hooks/useResetPassword", () => ({
  useResetPassword: jest.fn(() => ({
    isLoading: false,
    error: null,
    success: false,
    successMessage: null,
    resetPassword: jest.fn(),
    resetState: jest.fn(),
  })),
}));

describe("ResetPassword", () => {
  const mockResetPassword = jest.fn();
  const mockResetState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { useResetPassword } = require("@/hooks/useResetPassword");
    useResetPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: false,
      successMessage: null,
      resetPassword: mockResetPassword,
      resetState: mockResetState,
    });
  });

  it("renders without crashing", () => {
    render(<ResetPassword />);
    expect(screen.getByText("Nouveau mot de passe")).toBeInTheDocument();
  });

  it("displays the correct content", () => {
    render(<ResetPassword />);
    const title = screen.getByText("Nouveau mot de passe");
    const subtitle = screen.getByText("Entrez votre nouveau mot de passe sécurisé");
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<ResetPassword />);
    expect(screen.getByLabelText("Nouveau mot de passe*")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmer le mot de passe*")).toBeInTheDocument();
  });

  it("renders eye icons for password visibility", () => {
    render(<ResetPassword />);
    const eyeIcons = screen.getAllByRole("button");
    // Should have 3 buttons: 2 eye icons + 1 submit button
    expect(eyeIcons).toHaveLength(3);
  });

  it("renders submit button", () => {
    render(<ResetPassword />);
    const submitButton = screen.getByRole("button", { name: /réinitialiser le mot de passe/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("renders back to login link", () => {
    render(<ResetPassword />);
    const backLink = screen.getByText("← Retour à la connexion");
    expect(backLink).toBeInTheDocument();
  });

  it("should be a function that returns JSX", () => {
    expect(typeof ResetPassword).toBe("function");
    const { container } = render(<ResetPassword />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("displays left section content", () => {
    render(<ResetPassword />);
    expect(screen.getByText("Créez votre nouveau mot de passe")).toBeInTheDocument();
  });

  it("displays password requirements", () => {
    render(<ResetPassword />);
    expect(screen.getByText("Votre mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial pour être sécurisé.")).toBeInTheDocument();
  });

  it("handles password input changes", () => {
    render(<ResetPassword />);
    const newPasswordInput = screen.getByPlaceholderText("Votre nouveau mot de passe");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirmez votre nouveau mot de passe");
    
    fireEvent.change(newPasswordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newPassword123" } });
    
    expect(newPasswordInput).toHaveValue("newPassword123");
    expect(confirmPasswordInput).toHaveValue("newPassword123");
  });

  it("shows validation error for empty new password", async () => {
    render(<ResetPassword />);
    const submitButton = screen.getByRole("button", { name: /réinitialiser le mot de passe/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Le nouveau mot de passe est requis.")).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    render(<ResetPassword />);
    const newPasswordInput = screen.getByPlaceholderText("Votre nouveau mot de passe");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirmez votre nouveau mot de passe");
    const submitButton = screen.getByRole("button", { name: /réinitialiser le mot de passe/i });
    
    fireEvent.change(newPasswordInput, { target: { value: "123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Le mot de passe doit contenir au moins 8 caractères.")).toBeInTheDocument();
    });
  });

  it("shows validation error for password mismatch", async () => {
    render(<ResetPassword />);
    const newPasswordInput = screen.getByPlaceholderText("Votre nouveau mot de passe");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirmez votre nouveau mot de passe");
    const submitButton = screen.getByRole("button", { name: /réinitialiser le mot de passe/i });
    
    fireEvent.change(newPasswordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "differentPassword123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("Les mots de passe ne correspondent pas.")).toBeInTheDocument();
    });
  });

  it("calls resetPassword with valid passwords", async () => {
    render(<ResetPassword />);
    const newPasswordInput = screen.getByPlaceholderText("Votre nouveau mot de passe");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirmez votre nouveau mot de passe");
    const submitButton = screen.getByRole("button", { name: /réinitialiser le mot de passe/i });
    
    fireEvent.change(newPasswordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newPassword123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("newPassword123");
    });
  });

  it("displays loading state", () => {
    const { useResetPassword } = require("@/hooks/useResetPassword");
    useResetPassword.mockReturnValue({
      isLoading: true,
      error: null,
      success: false,
      successMessage: null,
      resetPassword: mockResetPassword,
      resetState: mockResetState,
    });

    render(<ResetPassword />);
    expect(screen.getByText("Réinitialisation en cours...")).toBeInTheDocument();
  });

  it("displays error message", () => {
    const { useResetPassword } = require("@/hooks/useResetPassword");
    useResetPassword.mockReturnValue({
      isLoading: false,
      error: "Erreur lors de la réinitialisation",
      success: false,
      successMessage: null,
      resetPassword: mockResetPassword,
      resetState: mockResetState,
    });

    render(<ResetPassword />);
    expect(screen.getByText("Erreur lors de la réinitialisation")).toBeInTheDocument();
  });

  it("displays success message", () => {
    const { useResetPassword } = require("@/hooks/useResetPassword");
    useResetPassword.mockReturnValue({
      isLoading: false,
      error: null,
      success: true,
      successMessage: "Mot de passe réinitialisé avec succès !",
      resetPassword: mockResetPassword,
      resetState: mockResetState,
    });

    render(<ResetPassword />);
    expect(screen.getByText("Mot de passe réinitialisé avec succès !")).toBeInTheDocument();
    expect(screen.getByText("Mot de passe modifié !")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<ResetPassword />);
    const newPasswordInput = screen.getByPlaceholderText("Votre nouveau mot de passe");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirmez votre nouveau mot de passe");
    
    // Initially passwords should be hidden
    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    
    // Click eye icons to show passwords
    const eyeButtons = screen.getAllByRole("button");
    const newPasswordEyeButton = eyeButtons[0];
    const confirmPasswordEyeButton = eyeButtons[1];
    
    fireEvent.click(newPasswordEyeButton);
    expect(newPasswordInput).toHaveAttribute("type", "text");
    
    fireEvent.click(confirmPasswordEyeButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
  });
});
