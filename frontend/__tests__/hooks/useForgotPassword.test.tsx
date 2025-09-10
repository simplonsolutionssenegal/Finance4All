import { renderHook, act } from "@testing-library/react";

import { useForgotPassword } from "@/hooks/useForgotPassword";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useClerk: jest.fn(),
}));

// Mock API client
jest.mock("@/lib/api", () => ({
  apiClient: {
    forgotPassword: jest.fn(),
  },
}));

// Mock fetch (no longer needed but kept for compatibility)
global.fetch = jest.fn();

const mockUseClerk = require("@clerk/nextjs").useClerk;

const mockApiClient = require("@/lib/api").apiClient;

describe("useForgotPassword hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockApiClient.forgotPassword.mockClear();
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

    mockApiClient.forgotPassword.mockResolvedValue({
      status: "success",
      message: "Lien de réinitialisation envoyé avec succès",
      data: { success: true },
    });

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
    expect(mockApiClient.forgotPassword).toHaveBeenCalledWith("test@example.com");
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

    mockApiClient.forgotPassword.mockResolvedValue({
      status: "error",
      message: "Aucun compte n'est associé à cette adresse email",
      data: { success: false },
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Aucun compte n'est associé à cette adresse email");
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

    mockApiClient.forgotPassword.mockRejectedValue(new Error("Erreur de connexion au serveur"));

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Erreur de connexion au serveur");
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

    mockApiClient.forgotPassword.mockResolvedValue({
      status: "success",
      message: "Success",
      data: { success: true },
    });

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(mockApiClient.forgotPassword).toHaveBeenCalledWith("test@example.com");
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

    mockApiClient.forgotPassword.mockResolvedValue({
      invalid: "response",
    } as any);

    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.sendResetLink("test@example.com");
    });

    expect(result.current.error).toBe("Erreur inconnue du serveur");
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
