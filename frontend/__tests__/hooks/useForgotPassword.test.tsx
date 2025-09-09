import { renderHook, act } from "@testing-library/react";

import { useForgotPassword } from "@/hooks/useForgotPassword";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useClerk: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseClerk = require("@clerk/nextjs").useClerk;

describe("useForgotPassword hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should be a function", () => {
    expect(typeof useForgotPassword).toBe("function");
  });

  it("should initialize with correct default values", () => {
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: jest.fn(),
        },
      },
      session: null,
    });

    const { result } = renderHook(() => useForgotPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.successMessage).toBe(null);
    expect(typeof result.current.sendResetLink).toBe("function");
    expect(typeof result.current.resetState).toBe("function");
  });

  it("should handle successful password reset link sending", async () => {
    const mockSignInCreate = jest.fn().mockResolvedValue({});
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: mockSignInCreate,
        },
      },
      session: null,
    });

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: "success",
        message: "Lien de réinitialisation envoyé avec succès",
        data: { success: true },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.success).toBe(true);
    expect(result.current.successMessage).toBe("Lien de réinitialisation envoyé avec succès");
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(mockSignInCreate).toHaveBeenCalledWith({
      strategy: "email_link",
      identifier: "test@example.com",
      redirectUrl: expect.stringContaining("/reset-password"),
    });
  });

  it("should handle API error response", async () => {
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: jest.fn(),
        },
      },
      session: null,
    });

    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        status: "error",
        message: "Erreur lors de l'envoi du lien",
        data: { success: false },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Erreur lors de l'envoi du lien");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle already authenticated user", async () => {
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: jest.fn(),
        },
      },
      session: { id: "session123" },
    });

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: "success",
        message: "Success",
        data: { success: true },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Vous êtes déjà connecté. Veuillez utiliser la page de changement de mot de passe dans votre profil.");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle network error", async () => {
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: jest.fn(),
        },
      },
      session: null,
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should reset state correctly", () => {
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: jest.fn(),
        },
      },
      session: null,
    });

    const { result } = renderHook(() => useForgotPassword());

    // Set some state first
    act(() => {
      result.current.resetState();
    });

    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.successMessage).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it("should make correct API call", async () => {
    const mockSignInCreate = jest.fn().mockResolvedValue({});
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: mockSignInCreate,
        },
      },
      session: null,
    });

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: "success",
        message: "Success",
        data: { success: true },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/forgot-password"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
        }),
      }
    );
  });

  it("should handle invalid API response format", async () => {
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: jest.fn(),
        },
      },
      session: null,
    });

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        invalid: "response",
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Format de réponse invalide du serveur");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle Clerk signIn creation failure", async () => {
    const mockSignInCreate = jest.fn().mockRejectedValue(new Error("Clerk error"));
    mockUseClerk.mockReturnValue({
      client: {
        signIn: {
          create: mockSignInCreate,
        },
      },
      session: null,
    });

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: "success",
        message: "Success",
        data: { success: true },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Clerk error");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
