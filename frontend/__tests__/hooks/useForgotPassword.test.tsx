import { renderHook } from '@testing-library/react';
import { useForgotPassword } from '@/hooks/useForgotPassword';

describe.skip('useForgotPassword', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useForgotPassword());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.successMessage).toBe(null);
    expect(typeof result.current.sendResetLink).toBe('function');
    expect(typeof result.current.resetPassword).toBe('function');
    expect(typeof result.current.resetState).toBe('function');
      // Mock Clerk
      jest.mock('@clerk/nextjs', () => ({
        useSignIn: () => ({
          signIn: jest.fn(),
          setActive: jest.fn(),
        }),
      }));

      // Mock Next.js navigation
      jest.mock('next/navigation', () => ({
        useRouter: () => ({
          push: jest.fn(),
        }),
      }));
  });
  it('should reset state', () => {
    const { result } = renderHook(() => useForgotPassword());
    result.current.resetState();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.successMessage).toBe(null);
  });
});
