import { useClerk, useUser } from '@clerk/nextjs';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { useLogout } from '@/hooks/useLogout';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useClerk: jest.fn(),
  useUser: jest.fn(),
}));

const mockPush = jest.fn();
const mockSignOut = jest.fn();
const mockRouter = {
  push: mockPush,
};

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });
  });

  it('should initialize with correct default values', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
    });

    const { result } = renderHook(() => useLogout());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isUserLoaded).toBe(true);
    expect(result.current.hasActiveSession).toBe(true);
    expect(typeof result.current.logout).toBe('function');
  });

  it('should handle logout successfully when user is loaded and has session', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
    });

    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(result.current.isLoading).toBe(false);
  });

  it('should redirect to login when user is null', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle logout error gracefully', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSignOut.mockRejectedValue(new Error('Logout failed'));

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la déconnexion:',
      expect.any(Error)
    );
    expect(result.current.isLoading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should set loading state correctly during logout', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
    });

    let resolveSignOut: () => void;
    const signOutPromise = new Promise<void>(resolve => {
      resolveSignOut = resolve;
    });
    mockSignOut.mockReturnValue(signOutPromise);

    const { result } = renderHook(() => useLogout());

    // Start logout
    act(() => {
      result.current.logout();
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);

    // Complete logout
    await act(async () => {
      resolveSignOut?.();
      await signOutPromise;
    });

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
  });

  it('should return correct user loaded state', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: false,
    });

    const { result } = renderHook(() => useLogout());

    expect(result.current.isUserLoaded).toBe(false);
  });

  it('should return correct active session state', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });

    const { result } = renderHook(() => useLogout());

    expect(result.current.hasActiveSession).toBe(false);
  });

  it('should handle multiple logout calls', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isLoaded: true,
    });

    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout());

    // Call logout multiple times
    await act(async () => {
      await Promise.all([
        result.current.logout(),
        result.current.logout(),
        result.current.logout(),
      ]);
    });

    expect(mockSignOut).toHaveBeenCalledTimes(3);
    expect(mockPush).toHaveBeenCalledTimes(3);
  });
});
