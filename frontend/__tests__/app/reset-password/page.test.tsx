import { render, screen } from "@testing-library/react";

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
    expect(screen.getByText("Votre mot de passe doit contenir au moins 8 caractères pour être sécurisé.")).toBeInTheDocument();
  });
});
