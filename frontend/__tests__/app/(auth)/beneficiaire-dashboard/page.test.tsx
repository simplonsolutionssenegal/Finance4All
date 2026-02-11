import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { render, screen, waitFor } from '@testing-library/react';

import BeneficiaireDashboardPage from '@/app/(auth)/beneficiaire-dashboard/page';
import BeneficiaireDashboard from '@/components/beneficiaire/BeneficiaireDashboard';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/beneficiaire/BeneficiaireDashboard', () => {
  return jest.fn(() => (
    <div data-testid='beneficiaire-dashboard'>Beneficiaire Dashboard Component</div>
  ));
});

describe('BeneficiaireDashboardPage (Client Component)', () => {
  let mockPush: jest.Mock;
  let mockRouter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockRouter = { push: mockPush };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Authentication checks', () => {
    it('should redirect to login when user is not present', async () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is undefined', async () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: undefined, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should show loading state when Clerk is not loaded', () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: false });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });
  });

  describe('Authenticated user', () => {
    it('should render BeneficiaireDashboard when user is present', () => {
      // Arrange
      const mockUser = { id: 'user_123456' };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(mockPush).not.toHaveBeenCalled();
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id }),
        expect.anything()
      );
    });

    it('should pass userId to BeneficiaireDashboard component', () => {
      // Arrange
      const mockUser = { id: 'user_clerk_789' };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id }),
        expect.anything()
      );
    });

    it('should handle different userId formats', () => {
      // Arrange
      const mockUser = { id: 'clerk_user_with_special_chars_123-456' };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id }),
        expect.anything()
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when Clerk is not loaded', () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: false });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
      expect(screen.getByText('Chargement...')).toHaveClass('animate-pulse');
    });

    it('should not show dashboard when not loaded', () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: { id: 'user_123' }, isLoaded: false });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(screen.getByText('Chargement...')).toBeInTheDocument();
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should hide loading state once loaded', () => {
      // Arrange
      const mockUser = { id: 'user_123' };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should return null when loaded but no user', async () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: true });

      // Act
      const { container } = render(<BeneficiaireDashboardPage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
      expect(
        container.querySelector('[data-testid="beneficiaire-dashboard"]')
      ).not.toBeInTheDocument();
    });

    it('should handle user with additional properties', () => {
      // Arrange
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user_123' }),
        expect.anything()
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle very long userId strings', () => {
      // Arrange
      const longUserId = `user_${'a'.repeat(1000)}`;
      const mockUser = { id: longUserId };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: longUserId }),
        expect.anything()
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle special characters in userId', () => {
      // Arrange
      const specialUserId = 'user_123-456_789@domain.com';
      const mockUser = { id: specialUserId };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: specialUserId }),
        expect.anything()
      );
    });
  });

  describe('Client-side behavior', () => {
    it('should use client-side hooks', () => {
      // Arrange
      const mockUser = { id: 'user_123' };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(useUser).toHaveBeenCalled();
      expect(useRouter).toHaveBeenCalled();
    });

    it('should call useRouter for navigation', async () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should not render dashboard when redirecting', async () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });
  });

  describe('Security', () => {
    it('should redirect unauthenticated users immediately', async () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: null, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should not expose dashboard to unauthenticated users', async () => {
      // Arrange
      (useUser as jest.Mock).mockReturnValue({ user: undefined, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
      expect(BeneficiaireDashboard).not.toHaveBeenCalled();
    });

    it('should only accept valid user from Clerk', () => {
      // Arrange
      const mockUser = { id: 'valid_user_123' };
      (useUser as jest.Mock).mockReturnValue({ user: mockUser, isLoaded: true });

      // Act
      render(<BeneficiaireDashboardPage />);

      // Assert
      expect(BeneficiaireDashboard).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'valid_user_123' }),
        expect.anything()
      );
    });
  });
});
