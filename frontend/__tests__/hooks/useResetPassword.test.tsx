import { renderHook, act } from "@testing-library/react";

import { useResetPassword } from "@/hooks/useResetPassword";

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

// Mock API client
jest.mock("@/lib/api", () => ({
  apiClient: {
    resetPassword: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockUseUser = require("@clerk/nextjs").useUser;

const mockApiClient = require("@/lib/api").apiClient;

describe("useResetPassword hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockApiClient.resetPassword.mockClear();
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

    mockApiClient.resetPassword.mockResolvedValue({
      status: "success",
      message: "Mot de passe réinitialisé avec succès",
      data: { success: true },
    });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(result.current.success).toBe(true);
    expect(result.current.successMessage).toBe("Mot de passe réinitialisé avec succès");
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(mockApiClient.resetPassword).toHaveBeenCalledWith("user123", "newPassword123");
  });

  it("should handle API error response", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    mockApiClient.resetPassword.mockResolvedValue({
      status: "error",
      message: "Erreur lors de la réinitialisation",
      data: { success: false },
    });

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

    mockApiClient.resetPassword.mockRejectedValue(new Error("Network error"));

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

    mockApiClient.resetPassword.mockResolvedValue({
      status: "success",
      message: "Success",
      data: { success: true },
    });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(mockApiClient.resetPassword).toHaveBeenCalledWith("user123", "newPassword123");
  });

  it("should handle invalid API response format", async () => {
    mockUseUser.mockReturnValue({
      user: { id: "user123" },
    });

    mockApiClient.resetPassword.mockResolvedValue({
      invalid: "response",
    } as any);

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.resetPassword("newPassword123");
    });

    expect(result.current.error).toBe("Format de réponse invalide du serveur");
    expect(result.current.success).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
