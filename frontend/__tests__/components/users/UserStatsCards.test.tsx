import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserStatsCards from '@/components/users/UserStatsCards';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
    onClick,
    role,
    tabIndex,
    onKeyDown,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    role?: string;
    tabIndex?: number;
    onKeyDown?: (e: React.KeyboardEvent) => void;
  }) => (
    <div
      data-testid='card'
      className={className}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='card-content' className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='card-header' className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, variant, size }: any) => (
    <button data-testid='button' className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Users: (props: any) => <div data-testid='users-icon' {...props} />,
  Shield: (props: any) => <div data-testid='shield-icon' {...props} />,
  Building2: (props: any) => <div data-testid='building2-icon' {...props} />,
  UserCheck: (props: any) => <div data-testid='user-check-icon' {...props} />,
  Archive: (props: any) => <div data-testid='archive-icon' {...props} />,
}));

const mockStats = {
  totalUsers: 10,
  totalOrganizations: 3,
  adminsOrg: 2,
  membersOrg: 1,
  recipients: 4,
  platformAdmins: 1,
  platformMembers: 1,
};

describe('UserStatsCards', () => {
  describe('No Data State', () => {
    it('renders default stats when no stats prop is provided', () => {
      render(<UserStatsCards />);

      // All labels should be present
      expect(screen.getByText('Total actifs')).toBeInTheDocument();
      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
      expect(screen.getByText('Organisations')).toBeInTheDocument();
      expect(screen.getByText('Bénéficiaires')).toBeInTheDocument();
      expect(screen.getByText('Archivés')).toBeInTheDocument();

      // Values should be 0
      const values = screen.getAllByText('0');
      expect(values.length).toBeGreaterThanOrEqual(5);
    });

    it('renders default stats when stats is undefined', () => {
      render(<UserStatsCards stats={undefined} />);

      const values = screen.getAllByText('0');
      expect(values.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('With Stats Data', () => {
    it('calculates and displays correct total actifs', () => {
      render(<UserStatsCards stats={mockStats} />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Total actifs')).toBeInTheDocument();
    });

    it('calculates and displays correct administrateurs', () => {
      // adminsOrg(2) + platformAdmins(1) + platformMembers(1) = 4
      const { container } = render(<UserStatsCards stats={mockStats} />);

      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
      const adminCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Administrateurs')
      );
      expect(adminCard?.textContent).toContain('4');
    });

    it('calculates and displays correct bénéficiaires', () => {
      const { container } = render(<UserStatsCards stats={mockStats} />);

      expect(screen.getByText('Bénéficiaires')).toBeInTheDocument();
      const beneficiairesCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(
        card => card.textContent?.includes('Bénéficiaires')
      );
      expect(beneficiairesCard?.textContent).toContain('4');
    });

    it('calculates and displays correct organisations count', () => {
      const { container } = render(<UserStatsCards stats={mockStats} />);

      expect(screen.getByText('Organisations')).toBeInTheDocument();
      const orgCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Organisations')
      );
      expect(orgCard?.textContent).toContain('3');
    });

    it('displays archivés as 0', () => {
      render(<UserStatsCards stats={mockStats} />);

      expect(screen.getByText('Archivés')).toBeInTheDocument();
      const { container } = render(<UserStatsCards stats={mockStats} />);
      const archivedCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(
        card => card.textContent?.includes('Archivés')
      );
      expect(archivedCard?.textContent).toContain('0');
    });
  });

  describe('Loading State', () => {
    it('displays loading indicators when isLoading is true', () => {
      render(<UserStatsCards stats={mockStats} isLoading />);

      // All cards except Archivés should show '...'
      const loadingIndicators = screen.getAllByText('...');
      expect(loadingIndicators).toHaveLength(4);

      // Archivés always shows '0'
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Single Stat Values', () => {
    it('displays single admin count correctly', () => {
      const stats = {
        totalUsers: 1,
        totalOrganizations: 1,
        adminsOrg: 1,
        membersOrg: 0,
        recipients: 0,
        platformAdmins: 0,
        platformMembers: 0,
      };

      const { container } = render(<UserStatsCards stats={stats} />);

      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
      expect(screen.getByText('Total actifs')).toBeInTheDocument();

      const adminCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Administrateurs')
      );
      expect(adminCard?.textContent).toContain('1');
    });
  });

  describe('Icons and Styling', () => {
    it('renders correct icons for each stat card', () => {
      render(<UserStatsCards />);

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByTestId('building2-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-check-icon')).toBeInTheDocument();
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    });

    it('renders stat cards with correct structure', () => {
      render(<UserStatsCards />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(5);

      const cardContents = screen.getAllByTestId('card-content');
      expect(cardContents).toHaveLength(5);
    });

    it('applies correct CSS classes to cards', () => {
      render(<UserStatsCards />);

      const cards = screen.getAllByTestId('card');
      cards.forEach(card => {
        expect(card).toHaveClass('relative', 'bg-white', 'shadow-sm', 'border', 'rounded-2xl');
        // Cards should not have cursor-pointer when onFilterChange is not provided
        expect(card.className).not.toContain('cursor-pointer');
      });
    });
  });

  describe('Grid Layout', () => {
    it('renders cards in a responsive grid', () => {
      const { container } = render(<UserStatsCards />);

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-5',
        'gap-4'
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles all-zero stats', () => {
      const zeroStats = {
        totalUsers: 0,
        totalOrganizations: 0,
        adminsOrg: 0,
        membersOrg: 0,
        recipients: 0,
        platformAdmins: 0,
        platformMembers: 0,
      };

      render(<UserStatsCards stats={zeroStats} />);

      expect(screen.getByText('Total actifs')).toBeInTheDocument();
      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
      expect(screen.getByText('Organisations')).toBeInTheDocument();
      expect(screen.getByText('Bénéficiaires')).toBeInTheDocument();
      expect(screen.getByText('Archivés')).toBeInTheDocument();

      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThanOrEqual(5);
    });

    it('handles large stat values', () => {
      const largeStats = {
        totalUsers: 99999,
        totalOrganizations: 500,
        adminsOrg: 100,
        membersOrg: 200,
        recipients: 300,
        platformAdmins: 50,
        platformMembers: 50,
      };

      render(<UserStatsCards stats={largeStats} />);

      expect(screen.getByText('99999')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      // adminsOrg(100) + platformAdmins(50) + platformMembers(50) = 200
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
    });
  });

  describe('Role Filtering', () => {
    it('correctly displays admins, recipients, and organisations', () => {
      const stats = {
        totalUsers: 7,
        totalOrganizations: 2,
        adminsOrg: 2,
        membersOrg: 1,
        recipients: 3,
        platformAdmins: 1,
        platformMembers: 0,
      };

      const { container } = render(<UserStatsCards stats={stats} />);

      // Check admin card: adminsOrg(2) + platformAdmins(1) + platformMembers(0) = 3
      const adminCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Administrateurs')
      );
      expect(adminCard?.textContent).toContain('3');

      // Check recipient card
      const recipientCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(
        card => card.textContent?.includes('Bénéficiaires')
      );
      expect(recipientCard?.textContent).toContain('3');

      // Check organisations card
      const orgCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Organisations')
      );
      expect(orgCard?.textContent).toContain('2');
    });
  });

  describe('Clickable Cards and Filtering', () => {
    const mockOnFilterChange = jest.fn();

    beforeEach(() => {
      mockOnFilterChange.mockClear();
    });

    it('makes cards clickable when onFilterChange is provided', () => {
      render(<UserStatsCards onFilterChange={mockOnFilterChange} />);

      const cards = screen.getAllByTestId('card');
      cards.forEach(card => {
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('tabIndex', '0');
        expect(card.className).toContain('cursor-pointer');
      });
    });

    it('does not make cards clickable when onFilterChange is not provided', () => {
      render(<UserStatsCards />);

      const cards = screen.getAllByTestId('card');
      cards.forEach(card => {
        expect(card).not.toHaveAttribute('role', 'button');
        expect(card).not.toHaveAttribute('tabIndex');
      });
    });

    it('calls onFilterChange with correct filter value when card is clicked', async () => {
      const user = userEvent.setup();
      render(<UserStatsCards onFilterChange={mockOnFilterChange} />);

      const cards = screen.getAllByTestId('card');
      const adminCard = cards.find(card => card.textContent?.includes('Administrateurs'));

      if (adminCard) {
        await user.click(adminCard);
        expect(mockOnFilterChange).toHaveBeenCalledWith('org:admin');
      }
    });

    it('calls onFilterChange with "all" when clicking Total actifs card', async () => {
      const user = userEvent.setup();
      render(<UserStatsCards onFilterChange={mockOnFilterChange} />);

      const cards = screen.getAllByTestId('card');
      const totalCard = cards.find(card => card.textContent?.includes('Total actifs'));

      if (totalCard) {
        await user.click(totalCard);
        expect(mockOnFilterChange).toHaveBeenCalledWith('all');
      }
    });

    it('calls onFilterChange with "org:member" when clicking Organisations card', async () => {
      const user = userEvent.setup();
      render(<UserStatsCards onFilterChange={mockOnFilterChange} />);

      const cards = screen.getAllByTestId('card');
      const orgCard = cards.find(card => card.textContent?.includes('Organisations'));

      if (orgCard) {
        await user.click(orgCard);
        expect(mockOnFilterChange).toHaveBeenCalledWith('org:member');
      }
    });

    it('calls onFilterChange with "org:recipient" when clicking Bénéficiaires card', async () => {
      const user = userEvent.setup();
      render(<UserStatsCards onFilterChange={mockOnFilterChange} />);

      const cards = screen.getAllByTestId('card');
      const recipientCard = cards.find(card => card.textContent?.includes('Bénéficiaires'));

      if (recipientCard) {
        await user.click(recipientCard);
        expect(mockOnFilterChange).toHaveBeenCalledWith('org:recipient');
      }
    });

    it('toggles filter to "all" when clicking already selected card', async () => {
      const user = userEvent.setup();
      render(<UserStatsCards onFilterChange={mockOnFilterChange} selectedRole='org:admin' />);

      const cards = screen.getAllByTestId('card');
      const adminCard = cards.find(card => card.textContent?.includes('Administrateurs'));

      if (adminCard) {
        await user.click(adminCard);
        // Should toggle to 'all' since it's already selected
        expect(mockOnFilterChange).toHaveBeenCalledWith('all');
      }
    });

    it('does not apply selected styling when card is clicked', () => {
      render(<UserStatsCards onFilterChange={mockOnFilterChange} selectedRole='org:admin' />);

      const cards = screen.getAllByTestId('card');
      const adminCard = cards.find(card => card.textContent?.includes('Administrateurs'));

      if (adminCard) {
        // Cards should not have selected styling, only hover effects
        expect(adminCard.className).not.toContain('border-primary-400');
        expect(adminCard.className).not.toContain('bg-primary-50');
        expect(adminCard.className).toContain('border-gray-100');
      }
    });

    it('handles keyboard navigation with Enter key', async () => {
      const user = userEvent.setup();
      render(<UserStatsCards onFilterChange={mockOnFilterChange} />);

      const cards = screen.getAllByTestId('card');
      const adminCard = cards.find(card => card.textContent?.includes('Administrateurs'));

      if (adminCard) {
        adminCard.focus();
        await user.keyboard('{Enter}');
        expect(mockOnFilterChange).toHaveBeenCalledWith('org:admin');
      }
    });

    it('handles keyboard navigation with Space key', async () => {
      const user = userEvent.setup();
      render(<UserStatsCards onFilterChange={mockOnFilterChange} />);

      const cards = screen.getAllByTestId('card');
      const adminCard = cards.find(card => card.textContent?.includes('Administrateurs'));

      if (adminCard) {
        adminCard.focus();
        await user.keyboard(' ');
        expect(mockOnFilterChange).toHaveBeenCalledWith('org:admin');
      }
    });

    it('keeps default text color regardless of selection', () => {
      render(<UserStatsCards onFilterChange={mockOnFilterChange} selectedRole='org:admin' />);

      const cards = screen.getAllByTestId('card');
      const adminCard = cards.find(card => card.textContent?.includes('Administrateurs'));

      if (adminCard) {
        // Check if the value text keeps default gray color
        const valueText = adminCard.querySelector('.text-4xl');
        expect(valueText?.className).toContain('text-gray-900');
        expect(valueText?.className).not.toContain('text-primary-600');
      }
    });
  });
});
