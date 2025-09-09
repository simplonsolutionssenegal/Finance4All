import { renderHook, act } from "@testing-library/react";

import { useResetPassword } from "@/hooks/useResetPassword";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseUser = require("@clerk/nextjs").useUser;

describe("useResetPassword hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should be a function", () => {
    expect(typeof useResetPassword).toBe("function");
  });

  it("should initialize with correct default values", () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    const { result } = renderHook(() => useResetPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.successMessage).toBe(null);
    expect(typeof result.current.resetPassword).toBe("function");
    expect(typeof result.current.resetState).toBe("function");
  });

  it("should handle successful password reset", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        status: "success",
        message: "Mot de passe réinitialisé avec succès",
        data: { success: true },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(result.current.success).toBe(true);
    expect(result.current.successMessage).toBe("Mot de passe réinitialisé avec succès");
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle API error response", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        status: "error",
        message: "Erreur lors de la réinitialisation",
        data: { success: false },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(result.current.error).toBe("Erreur lors de la réinitialisation");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle unauthenticated user", async () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(result.current.error).toBe("Utilisateur non authentifié. Veuillez vous connecter.");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle network error", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should reset state correctly", () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    const { result } = renderHook(() => useResetPassword());

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
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
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

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/reset-password"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "user123",
          newPassword: "newPassword123",
        }),
      }
    );
  });

  it("should handle invalid API response format", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        invalid: "response",
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(result.current.error).toBe("Format de réponse invalide du serveur");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
