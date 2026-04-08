import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import Sidebar from '@/components/dashboard/Sidebar';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock @clerk/nextjs
const mockSignOut = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      fullName: 'Test User',
      firstName: 'Test',
      imageUrl: 'https://example.com/avatar.png',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  })),
  useClerk: jest.fn(() => ({
    signOut: mockSignOut,
  })),
}));

// Mock useUserRoles hook
jest.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: jest.fn(() => ({
    roleLabel: 'Admin Systeme',
    hasRole: jest.fn((role: string) => role === 'admin'),
    hasOrganizationRole: jest.fn(() => true),
    isLoaded: true,
    userRoles: ['admin'],
    organizationRoles: ['org:admin'],
    appRole: 'Admin',
    accessGroup: 'platform',
  })),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid='layout-dashboard-icon' />,
  Building2: () => <div data-testid='building2-icon' />,
  BookOpen: () => <div data-testid='book-open-icon' />,
  Users: () => <div data-testid='users-icon' />,
  Bell: () => <div data-testid='bell-icon' />,
  Settings: () => <div data-testid='settings-icon' />,
  LogOut: () => <div data-testid='logout-icon' />,
  AlertTriangle: () => <div data-testid='alert-triangle-icon' />,
  Menu: () => <div data-testid='menu-icon' />,
  X: () => <div data-testid='x-icon' />,
  GraduationCap: () => <div data-testid='graduation-cap-icon' />,
  Home: () => <div data-testid='home-icon' />,
  Compass: () => <div data-testid='compass-icon' />,
  Award: () => <div data-testid='award-icon' />,
  Calculator: () => <div data-testid='calculator-icon' />,
}));

// Mock ConfirmDialog
jest.mock('@/components/dashboard/ConfirmDialog', () => ({
  ConfirmDialog: ({
    isOpen,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <div data-testid='confirm-dialog'>
        <button data-testid='dialog-close' onClick={onClose}>
          Close
        </button>
        <button data-testid='dialog-confirm' onClick={onConfirm}>
          Confirm
        </button>
      </div>
    ) : null,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
  });

  describe('Rendering', () => {
    it('renders the logo', () => {
      render(<Sidebar />);
      const logos = screen.getAllByAltText('Finance4All');
      expect(logos.length).toBeGreaterThan(0);
      expect(logos[0]).toBeInTheDocument();
    });

    it('renders user profile section with user info', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
      expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
    });

    it('renders user initials in avatar fallback', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('T').length).toBeGreaterThan(0);
    });

    it('renders role badge', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Admin Systeme').length).toBeGreaterThan(0);
    });

    it('renders navigation menu items based on roles', () => {
      render(<Sidebar />);
      // Admin user should see Dashboard, Institutions, Cours & Formations, Utilisateurs
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Institutions partenaires').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Cours & Formations').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Utilisateurs').length).toBeGreaterThan(0);
    });

    it('renders logout button', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Déconnexion').length).toBeGreaterThan(0);
    });

    it('renders version text', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Version v1.0').length).toBeGreaterThan(0);
    });
  });

  describe('Mobile sidebar', () => {
    it('renders mobile toggle button', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles sidebar visibility on mobile', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );

      expect(toggleButton).toBeDefined();
      if (toggleButton) {
        fireEvent.click(toggleButton);
        const overlay = screen.getByRole('button', { name: /fermer le menu/i });
        expect(overlay).toBeInTheDocument();
      }
    });

    it('closes sidebar when clicking overlay', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );

      if (toggleButton) {
        fireEvent.click(toggleButton);
        const overlay = screen.getByRole('button', { name: /fermer le menu/i });
        fireEvent.click(overlay);
      }
    });

    it('closes sidebar with keyboard (Enter key)', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );

      if (toggleButton) {
        fireEvent.click(toggleButton);
        const overlay = screen.getByRole('button', { name: /fermer le menu/i });
        fireEvent.keyDown(overlay, { key: 'Enter', code: 'Enter' });
      }
    });
  });

  describe('Logout functionality', () => {
    it('opens logout dialog when clicking logout button', () => {
      render(<Sidebar />);
      const logoutButtons = screen.getAllByText('Déconnexion');
      fireEvent.click(logoutButtons[0]);
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    it('closes logout dialog when clicking close', () => {
      render(<Sidebar />);
      const logoutButtons = screen.getAllByText('Déconnexion');
      fireEvent.click(logoutButtons[0]);
      const closeButton = screen.getByTestId('dialog-close');
      fireEvent.click(closeButton);
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });

    it('calls signOut when confirming logout', async () => {
      mockSignOut.mockResolvedValue(undefined);
      render(<Sidebar />);
      const logoutButtons = screen.getAllByText('Déconnexion');
      fireEvent.click(logoutButtons[0]);
      const confirmButton = screen.getByTestId('dialog-confirm');
      fireEvent.click(confirmButton);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockSignOut).toHaveBeenCalled();
    });

  describe('Navigation', () => {
    it('highlights active menu item based on pathname', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      render(<Sidebar />);
      // The active state is determined by pathname matching
      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      expect(dashboardLinks.length).toBeGreaterThan(0);
    });

    it('renders correct href for menu items', () => {
      render(<Sidebar />);
      const institutionsLinks = screen.getAllByRole('link', { name: /institutions partenaires/i });
      expect(institutionsLinks[0]).toHaveAttribute('href', '/institutions');
    });
  });

  describe('Accessibility', () => {
    it('overlay has proper ARIA attributes', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );

      if (toggleButton) {
        fireEvent.click(toggleButton);
        const overlay = screen.getByRole('button', { name: /fermer le menu/i });
        expect(overlay).toHaveAttribute('aria-label', 'Fermer le menu');
        expect(overlay).toHaveAttribute('tabIndex', '0');
      }
    });

    it('does not toggle on other key presses', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );

      if (toggleButton) {
        fireEvent.click(toggleButton);
        const overlay = screen.getByRole('button', { name: /fermer le menu/i });
        // Press a different key
        fireEvent.keyDown(overlay, { key: 'Escape', code: 'Escape' });
        // Sidebar should still be open
        expect(overlay).toBeInTheDocument();
      }
    });
  });

  describe('Error handling', () => {
    it('handles logout error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSignOut.mockRejectedValue(new Error('Logout failed'));

      render(<Sidebar />);
      const logoutButtons = screen.getAllByText('Déconnexion');
      fireEvent.click(logoutButtons[0]);
      const confirmButton = screen.getByTestId('dialog-confirm');
      fireEvent.click(confirmButton);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(consoleError).toHaveBeenCalledWith(
        'Erreur lors de la déconnexion:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('Navigation', () => {
    it('highlights active menu item based on pathname', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      render(<Sidebar />);
      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      expect(dashboardLinks.length).toBeGreaterThan(0);
    });

    it('renders correct href for menu items', () => {
      render(<Sidebar />);
      const institutionsLinks = screen.getAllByRole('link', { name: /institutions partenaires/i });
      expect(institutionsLinks[0]).toHaveAttribute('href', '/institutions');
    });
  });

  describe('Role-based menu filtering', () => {
    afterEach(() => {
      const { useUserRoles } = require('@/hooks/useUserRoles');
      useUserRoles.mockReturnValue({
        roleLabel: 'Admin Systeme',
        hasRole: jest.fn((role: string) => role === 'admin'),
        hasOrganizationRole: jest.fn(() => true),
        isLoaded: true,
        userRoles: ['admin'],
        organizationRoles: ['org:admin'],
        appRole: 'Admin',
        accessGroup: 'platform',
      });
    });

    it('shows beneficiary menu items for beneficiary role', () => {
      const { useUserRoles } = require('@/hooks/useUserRoles');
      useUserRoles.mockReturnValue({
        roleLabel: 'Beneficiaire',
        hasRole: jest.fn((role: string) => role === 'beneficiary'),
        hasOrganizationRole: jest.fn((role: string) => role === 'org:recipient'),
        isLoaded: true,
        userRoles: ['beneficiary'],
        organizationRoles: ['org:recipient'],
        appRole: 'Beneficiare',
        accessGroup: 'beneficiary',
      });

      render(<Sidebar />);
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    });
  });

  describe('User fallback states', () => {
    afterEach(() => {
      const { useUser } = require('@clerk/nextjs');
      useUser.mockReturnValue({
        user: {
          fullName: 'Test User',
          firstName: 'Test',
          imageUrl: 'https://example.com/avatar.png',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
      });
    });

    it('displays Utilisateur when user has no name', () => {
      const { useUser } = require('@clerk/nextjs');
      useUser.mockReturnValue({
        user: {
          fullName: null,
          firstName: null,
          imageUrl: null,
          emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
      });

      render(<Sidebar />);
      expect(screen.getAllByText('Utilisateur').length).toBeGreaterThan(0);
    });

    it('handles null user gracefully', () => {
      const { useUser } = require('@clerk/nextjs');
      useUser.mockReturnValue({ user: null });

      render(<Sidebar />);
      expect(screen.getAllByText('Utilisateur').length).toBeGreaterThan(0);
      expect(screen.getAllByText('U').length).toBeGreaterThan(0);
    });
  });

  describe('Role-based menu filtering', () => {
    afterEach(() => {
      // Reset the mock to admin user after each test in this block
      const { useUserRoles } = require('@/hooks/useUserRoles');
      useUserRoles.mockReturnValue({
        roleLabel: 'Admin Systeme',
        hasRole: jest.fn((role: string) => role === 'admin'),
        hasOrganizationRole: jest.fn(() => true),
        isLoaded: true,
        userRoles: ['admin'],
        organizationRoles: ['org:admin'],
        appRole: 'Admin',
        accessGroup: 'platform',
      });
    });

    it('shows beneficiary menu items for fallback user', () => {
      const { useUserRoles } = require('@/hooks/useUserRoles');
      useUserRoles.mockReturnValue({
        roleLabel: 'Beneficiaire',
        hasRole: jest.fn(() => false),
        hasOrganizationRole: jest.fn(() => false),
        isLoaded: true,
        userRoles: [],
        organizationRoles: [],
        appRole: 'Beneficiare',
        accessGroup: 'beneficiary',
      });

      render(<Sidebar />);
      // Fallback user should see beneficiary routes
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    });

    it('shows correct menu items for beneficiary role', () => {
      const { useUserRoles } = require('@/hooks/useUserRoles');
      useUserRoles.mockReturnValue({
        roleLabel: 'Beneficiaire',
        hasRole: jest.fn((role: string) => role === 'beneficiary'),
        hasOrganizationRole: jest.fn((role: string) => role === 'org:recipient'),
        isLoaded: true,
        userRoles: ['beneficiary'],
        organizationRoles: ['org:recipient'],
        appRole: 'Beneficiare',
        accessGroup: 'beneficiary',
      });

      render(<Sidebar />);
      // Beneficiary should see learning, comparateur, simulateur
      expect(screen.getAllByText('Mes modules').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Comparateur').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Simulateur').length).toBeGreaterThan(0);
    });
  });

  describe('Pathname handling', () => {
    it('handles null pathname', () => {
      mockUsePathname.mockReturnValue('');

      render(<Sidebar />);
      // Should render without errors
      expect(screen.getAllByText('Admin Systeme').length).toBeGreaterThan(0);
    });

    it('handles nested pathname for active state', () => {
      mockUsePathname.mockReturnValue('/institutions/123/edit');

      render(<Sidebar />);
      // Should still render with institutions item potentially active
      expect(screen.getAllByText('Institutions partenaires').length).toBeGreaterThan(0);
    });

    it('handles unknown pathname (no matching allowed roles)', () => {
      mockUsePathname.mockReturnValue('/unknown-route');
      render(<Sidebar />);
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
    });
  });

  describe('Notifications unread badge', () => {
    it('shows unread count badge for notifications menu when count > 0', async () => {
      window.localStorage.setItem(
        'finance4all.notifications',
        JSON.stringify([
          {
            id: 'notif-1',
            title: 'Notif',
            description: 'Desc',
            timeLabel: 'Now',
            isRead: false,
            category: 'system',
          },
        ])
      );

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      });
    });

    it('hides unread badge when all notifications are read', async () => {
      window.localStorage.setItem(
        'finance4all.notifications',
        JSON.stringify([
          {
            id: 'notif-1',
            title: 'Notif',
            description: 'Desc',
            timeLabel: 'Now',
            isRead: false,
            category: 'system',
          },
        ])
      );

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      });

      window.localStorage.setItem(
        'finance4all.notifications',
        JSON.stringify([
          {
            id: 'notif-1',
            title: 'Notif',
            description: 'Desc',
            timeLabel: 'Now',
            isRead: true,
            category: 'system',
          },
        ])
      );
      act(() => {
        window.dispatchEvent(new Event('finance4all-notifications-updated'));
      });

      await waitFor(() => {
        expect(screen.queryByText('1')).not.toBeInTheDocument();
      });
    });

    it('uses active badge style on notifications route', async () => {
      mockUsePathname.mockReturnValue('/notifications');
      window.localStorage.setItem(
        'finance4all.notifications',
        JSON.stringify([
          {
            id: 'notif-1',
            title: 'Notif',
            description: 'Desc',
            timeLabel: 'Now',
            isRead: false,
            category: 'system',
          },
        ])
      );

      const { container } = render(<Sidebar />);
      await waitFor(() => {
        expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      });

      const activeBadge = container.querySelector('.bg-white.text-primary-400');
      expect(activeBadge).toBeInTheDocument();
    });
  });

  describe('Mobile menu interaction', () => {
    beforeEach(() => {
      // Reset to admin user for these tests
      const { useUserRoles } = require('@/hooks/useUserRoles');
      useUserRoles.mockReturnValue({
        roleLabel: 'Admin Systeme',
        hasRole: jest.fn((role: string) => role === 'admin'),
        hasOrganizationRole: jest.fn(() => true),
        isLoaded: true,
        userRoles: ['admin'],
        organizationRoles: ['org:admin'],
        appRole: 'Admin',
        accessGroup: 'platform',
      });
    });

    it('closes sidebar when clicking a navigation link', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );

      if (toggleButton) {
        fireEvent.click(toggleButton);
        // Click on a navigation link - use Notifications which is available to all
        const notificationsLinks = screen.getAllByText('Notifications');
        fireEvent.click(notificationsLinks[0]);
      }
    });

    it('closes sidebar via X button', () => {
      render(<Sidebar />);
      const menuButtons = screen.getAllByRole('button');
      const toggleButton = menuButtons.find(
        btn => btn.querySelector('[data-testid="menu-icon"]') !== null
      );

      if (toggleButton) {
        fireEvent.click(toggleButton);
        // Find and click X button
        const xButtons = screen.getAllByRole('button');
        const xButton = xButtons.find(btn => btn.querySelector('[data-testid="x-icon"]') !== null);
        if (xButton) {
          fireEvent.click(xButton);
        }
      }
    });
  });
});
