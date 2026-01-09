import { auth } from '@clerk/nextjs/server';
import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';

import BeneficiaireDashboardPage from '@/app/(auth)/beneficiaire-dashboard/page';
import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

jest.mock('@/components/beneficiaire/BeneficiaireDashboard', () => {
  return jest.fn(() => (
    <div data-testid='beneficiaire-dashboard'>Beneficiaire Dashboard Component</div>
  ));
});

describe('BeneficiaireDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication checks', () => {
    it('should redirect to login when userId is not present', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(auth).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should redirect to login when userId is undefined', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: undefined });

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(auth).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should redirect to login when auth returns empty object', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({});

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(auth).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });
  });

  describe('Authenticated user', () => {
    it('should render BeneficiaireDashboard when userId is present', async () => {
      // Arrange
      const mockUserId = 'user_123456';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: mockUserId });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(auth).toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: mockUserId }, undefined);
    });

    it('should pass userId to BeneficiaireDashboard component', async () => {
      // Arrange
      const mockUserId = 'user_clerk_789';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: mockUserId });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: mockUserId }, undefined);
    });

    it('should handle different userId formats', async () => {
      // Arrange
      const mockUserId = 'clerk_user_with_special_chars_123-456';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: mockUserId });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: mockUserId }, undefined);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Component rendering', () => {
    it('should return JSX element when authenticated', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      const result = await BeneficiaireDashboardPage();

      // Assert
      expect(result).not.toBeNull();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should render the correct component structure', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_456' });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should handle auth errors gracefully', async () => {
      // Arrange
      const authError = new Error('Auth service unavailable');
      (auth as unknown as jest.Mock).mockRejectedValue(authError);

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('Auth service unavailable');
      expect(redirect).not.toHaveBeenCalled();
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should propagate unexpected errors', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected error');
      (auth as unknown as jest.Mock).mockImplementation(() => {
        throw unexpectedError;
      });

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('Unexpected error');
    });
  });

  describe('Integration scenarios', () => {
    it('should call auth exactly once per page load', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_123' });

      // Act
      await BeneficiaireDashboardPage();

      // Assert
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it('should not call redirect when user is authenticated', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'user_authenticated' });

      // Act
      await BeneficiaireDashboardPage();

      // Assert
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should not render dashboard when redirecting', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalled();
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should handle auth with additional properties', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: 'user_123',
        orgId: 'org_456',
        sessionId: 'session_789',
      });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: 'user_123' }, undefined);
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string userId as unauthenticated', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: '' });

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only userId as authenticated', async () => {
      // Arrange
      const whitespaceUserId = '   ';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: whitespaceUserId });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      // Whitespace is truthy, so it should be treated as authenticated
      expect(redirect).not.toHaveBeenCalled();
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: whitespaceUserId }, undefined);
    });

    it('should handle very long userId strings', async () => {
      // Arrange
      const longUserId = `user_${'a'.repeat(1000)}`;
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: longUserId });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: longUserId }, undefined);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should handle special characters in userId', async () => {
      // Arrange
      const specialUserId = 'user_123-456_789@domain.com';
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: specialUserId });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: specialUserId }, undefined);
    });
  });

  describe('Async behavior', () => {
    it('should wait for auth resolution before rendering', async () => {
      // Arrange
      let resolveAuth: (value: any) => void;
      const authPromise = new Promise(resolve => {
        resolveAuth = resolve;
      });
      (auth as unknown as jest.Mock).mockReturnValue(authPromise);

      // Act
      const pagePromise = BeneficiaireDashboardPage();

      // Assert - Dashboard should not be called yet
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();

      // Resolve auth
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resolveAuth!({ userId: 'user_123' });
      const result = await pagePromise;
      render(result);

      // Assert - Dashboard should now be called
      expect(BeneficiaireDashboard).toHaveBeenCalled();
    });

    it('should handle slow auth response', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve({ userId: 'user_slow' }), 100);
          })
      );

      // Act
      const startTime = Date.now();
      const result = await BeneficiaireDashboardPage();
      const endTime = Date.now();
      render(result);

      // Assert
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: 'user_slow' }, undefined);
    });
  });

  describe('Security', () => {
    it('should redirect unauthenticated users immediately', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should not expose dashboard to unauthenticated users', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: undefined });

      // Act & Assert
      await expect(BeneficiaireDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should only accept valid userId from auth', async () => {
      // Arrange
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'valid_user_123' });

      // Act
      const result = await BeneficiaireDashboardPage();
      render(result);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith({ userId: 'valid_user_123' }, undefined);
    });
  });
});
