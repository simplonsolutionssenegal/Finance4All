import { renderHook, act } from "@testing-library/react";

import { useForgotPassword } from "@/hooks/useForgotPassword";

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

const mockUseClerk = require("@clerk/nextjs").useClerk;
const mockUseSignIn = require("@clerk/nextjs").useSignIn;
const mockUseRouter = require("next/navigation").useRouter;

describe.skip("useForgotPassword hook", () => {
  const mockPush = jest.fn();
  const mockSignIn = {
    create: jest.fn(),
    attemptFirstFactor: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseClerk.mockReturnValue({ session: null });
    mockUseSignIn.mockReturnValue({ signIn: mockSignIn });
  });

  it("should be a function", () => {
    expect(typeof useForgotPassword).toBe("function");
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useForgotPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.successMessage).toBe(null);
    expect(typeof result.current.sendResetLink).toBe("function");
    expect(typeof result.current.resetPassword).toBe("function");
    expect(typeof result.current.resetState).toBe("function");
  });

  it("should handle successful password reset link sending", async () => {
    mockSignIn.create.mockResolvedValue({});

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.success).toBe(true);
    expect(result.current.successMessage).toBe("Un lien de réinitialisation a été envoyé à votre email.");
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(mockSignIn.create).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      identifier: "test@example.com",
    });
  });

  it("should handle account not found error", async () => {
    const error = new Error("Couldn't find your account");
    mockSignIn.create.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Aucun compte n'est associé à cette adresse email");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle already signed in error", async () => {
    const error = new Error("You're already signed in");
    mockSignIn.create.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle generic error", async () => {
    const error = new Error("Some other error");
    mockSignIn.create.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Une erreur est survenue lors de l'envoi de l'email");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle already authenticated user", async () => {
    mockUseClerk.mockReturnValue({ session: { id: "session123" } });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle unexpected error", async () => {
    mockSignIn.create.mockImplementation(() => {
      throw "String error";
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Une erreur inattendue est survenue");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle successful password reset", async () => {
    mockSignIn.attemptFirstFactor.mockResolvedValue({ status: 'complete' });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.success).toBe(true);
    expect(result.current.successMessage).toBe("Mot de passe réinitialisé avec succès");
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockSignIn.attemptFirstFactor).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      code: "123456",
      password: "newPassword123",
    });
  });

  it("should handle password reset failure", async () => {
    mockSignIn.attemptFirstFactor.mockResolvedValue({ status: 'needs_second_factor' });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe("Erreur lors de la réinitialisation du mot de passe");
    expect(result.current.success).toBe(false);
  });

  it("should handle password reset error", async () => {
    const error = {
      errors: [{ longMessage: "Invalid code" }]
    };
    mockSignIn.attemptFirstFactor.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe("Invalid code");
    expect(result.current.success).toBe(false);
  });

  it("should handle password breach error with message", async () => {
    const error = {
      errors: [{ longMessage: "Password has been found in an online data breach." }]
    };
    mockSignIn.attemptFirstFactor.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe("Password has been found in an online data breach.");
    expect(result.current.success).toBe(false);
  });

  it("should handle password breach error with code", async () => {
    const error = {
      errors: [{ code: "form_password_pwned", longMessage: "Some other message" }]
    };
    mockSignIn.attemptFirstFactor.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe("Ce mot de passe a été trouvé dans une fuite de données en ligne. Veuillez en choisir un autre.");
    expect(result.current.success).toBe(false);
  });

  it("should handle password reset with try-catch error", async () => {
    mockSignIn.attemptFirstFactor.mockImplementation(() => {
      throw new Error("Server error");
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe("Une erreur est survenue lors de la réinitialisation du mot de passe");
    expect(result.current.success).toBe(false);
  });

  it("should handle console error logging in resetPassword", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = {
      errors: [{ longMessage: "Test error message" }]
    };
    mockSignIn.attemptFirstFactor.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(consoleSpy).toHaveBeenCalledWith('error', '[object Object]');
    consoleSpy.mockRestore();
  });

  it("should handle different error message formats", async () => {
    const error = new Error("Custom error message");
    mockSignIn.create.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Une erreur est survenue lors de l'envoi de l'email");
  });

  it("should handle resetPassword without loading state", async () => {
    mockSignIn.attemptFirstFactor.mockResolvedValue({ status: 'complete' });

    const { result } = renderHook(() => useForgotPassword());

    // resetPassword doesn't set loading state
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should handle password reset with different error formats", async () => {
    const error = {
      errors: [{ longMessage: "Different error message" }]
    };
    mockSignIn.attemptFirstFactor.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe("Different error message");
    expect(result.current.success).toBe(false);
  });

  it("should handle password reset with non-string error", async () => {
    const error = { errors: [{ longMessage: 123 }] };
    mockSignIn.attemptFirstFactor.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    // The hook returns the non-string value as is
    expect(result.current.error).toBe(123);
    expect(result.current.success).toBe(false);
  });

  it("should handle null signIn", async () => {
    mockUseSignIn.mockReturnValue({ signIn: null });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    // Should not throw error when signIn is null
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it("should handle null signIn for resetPassword", async () => {
    mockUseSignIn.mockReturnValue({ signIn: null });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    // Should not throw error when signIn is null
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it("should handle undefined signIn", async () => {
    mockUseSignIn.mockReturnValue({ signIn: undefined });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    // Should not throw error when signIn is undefined
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it("should handle undefined signIn for resetPassword", async () => {
    mockUseSignIn.mockReturnValue({ signIn: undefined });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    // Should not throw error when signIn is undefined
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it("should handle resetPassword with try-catch error and no signIn", async () => {
    mockUseSignIn.mockReturnValue({ signIn: null });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it("should handle resetPassword with try-catch error and undefined signIn", async () => {
    mockUseSignIn.mockReturnValue({ signIn: undefined });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
  });

  it("should handle resetPassword with signIn but no attemptFirstFactor", async () => {
    mockUseSignIn.mockReturnValue({ 
      signIn: {
        create: jest.fn(),
        attemptFirstFactor: undefined
      }
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123", "123456");
    });

    expect(result.current.error).toBe("Une erreur est survenue lors de la réinitialisation du mot de passe");
    expect(result.current.success).toBe(false);
  });

  it("should handle sendResetLink with signIn but no create method", async () => {
    mockUseSignIn.mockReturnValue({ 
      signIn: {
        create: undefined,
        attemptFirstFactor: jest.fn()
      }
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Une erreur inattendue est survenue");
    expect(result.current.success).toBe(false);
  });
});