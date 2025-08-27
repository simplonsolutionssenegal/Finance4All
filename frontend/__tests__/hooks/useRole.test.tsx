import { renderHook } from "@testing-library/react";

import { useRole } from "@/hooks/useRole";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

const mockUseSession = require("next-auth/react").useSession;

describe("useRole hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be a function", () => {
    expect(typeof useRole).toBe("function");
  });

  it("returns true when user has the required role", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["admin", "user", "moderator"],
      },
    });

    const { result } = renderHook(() => useRole("admin"));
    expect(result.current).toBe(true);
  });

  it("returns false when user does not have the required role", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["user", "moderator"],
      },
    });

    const { result } = renderHook(() => useRole("admin"));
    expect(result.current).toBe(false);
  });

  it("returns false when roles array is empty", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: [],
      },
    });

    const { result } = renderHook(() => useRole("admin"));
    expect(result.current).toBe(false);
  });

  it("handles case-sensitive role matching", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["Admin", "User"],
      },
    });

    const { result: result1 } = renderHook(() => useRole("admin"));
    expect(result1.current).toBe(false);

    const { result: result2 } = renderHook(() => useRole("Admin"));
    expect(result2.current).toBe(true);
  });

  it("works with different role types", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["user", "premium", "subscriber"],
      },
    });

    const { result: userResult } = renderHook(() => useRole("user"));
    expect(userResult.current).toBe(true);

    const { result: premiumResult } = renderHook(() => useRole("premium"));
    expect(premiumResult.current).toBe(true);

    const { result: adminResult } = renderHook(() => useRole("admin"));
    expect(adminResult.current).toBe(false);
  });

  it("handles empty string role", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["user", "admin", ""],
      },
    });

    const { result } = renderHook(() => useRole(""));
    expect(result.current).toBe(true);
  });

  it("handles whitespace in roles", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["user", " admin ", "moderator"],
      },
    });

    const { result: exactResult } = renderHook(() => useRole(" admin "));
    expect(exactResult.current).toBe(true);

    const { result: trimmedResult } = renderHook(() => useRole("admin"));
    expect(trimmedResult.current).toBe(false);
  });

  it("re-evaluates when session changes", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["user"],
      },
    });

    const { result, rerender } = renderHook(() => useRole("admin"));
    expect(result.current).toBe(false);

    mockUseSession.mockReturnValue({
      data: {
        roles: ["user", "admin"],
      },
    });

    rerender();
    expect(result.current).toBe(true);
  });

  it("handles role parameter change", () => {
    mockUseSession.mockReturnValue({
      data: {
        roles: ["user", "admin", "moderator"],
      },
    });

    const { result, rerender } = renderHook(
      ({ role }) => useRole(role),
      { initialProps: { role: "user" } }
    );

    expect(result.current).toBe(true);

    rerender({ role: "admin" });
    expect(result.current).toBe(true);

    rerender({ role: "superuser" });
    expect(result.current).toBe(false);
  });
});