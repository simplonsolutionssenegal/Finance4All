import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserStatsCards from '@/components/users/UserStatsCards';

// Mock Clerk hooks
const mockUseOrganization = jest.fn();
const mockUseUser = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useOrganization: () => mockUseOrganization(),
  useUser: () => mockUseUser(),
}));

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

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUser.mockReturnValue({
    user: { organizationMemberships: [] },
  });
});

describe('UserStatsCards', () => {
  describe('No Data State', () => {
    it('renders default stats when no memberships data', () => {
      mockUseOrganization.mockReturnValue({
        memberships: undefined,
        invitations: undefined,
      });

      render(<UserStatsCards />);

      // All values should be 0
      expect(screen.getByText('Total actifs')).toBeInTheDocument();
      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
      expect(screen.getByText('Organisations')).toBeInTheDocument();
      expect(screen.getByText('Bénéficiaires')).toBeInTheDocument();
      expect(screen.getByText('Archivés')).toBeInTheDocument();

      // Values should be 0
      const values = screen.getAllByText('0');
      expect(values.length).toBeGreaterThanOrEqual(5);
    });

    it('renders default stats when memberships data is null', () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: null },
        invitations: undefined,
      });

      render(<UserStatsCards />);

      const values = screen.getAllByText('0');
      expect(values.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('With Memberships Data', () => {
    const mockMemberships = {
      data: [
        {
          id: 'mem_1',
          role: 'org:admin',
          publicUserData: {
            userId: 'user_1',
            firstName: 'John',
            lastName: 'Doe',
            identifier: 'john.doe@example.com',
          },
        },
        {
          id: 'mem_2',
          role: 'org:member',
          publicUserData: {
            userId: 'user_2',
            firstName: 'Jane',
            lastName: 'Smith',
            identifier: 'jane.smith@example.com',
          },
        },
        {
          id: 'mem_3',
          role: 'org:recipient',
          publicUserData: {
            userId: 'user_3',
            firstName: 'Bob',
            lastName: 'Johnson',
            identifier: 'bob@example.com',
          },
        },
        {
          id: 'mem_4',
          role: 'org:admin',
          publicUserData: null, // Inactive user - should not be counted
        },
      ],
    };

    beforeEach(() => {
      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: { organizationMemberships: [{ organization: { id: 'org_1' } }] },
      });
    });

    it('calculates and displays correct total actifs', () => {
      render(<UserStatsCards />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Total actifs')).toBeInTheDocument();
    });

    it('calculates and displays correct administrateurs', () => {
      render(<UserStatsCards />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
    });

    it('calculates and displays correct bénéficiaires', () => {
      const { container } = render(<UserStatsCards />);

      expect(screen.getByText('Bénéficiaires')).toBeInTheDocument();
      // Find the card containing "Bénéficiaires" and check its value
      const beneficiairesCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(
        card => card.textContent?.includes('Bénéficiaires')
      );
      expect(beneficiairesCard?.textContent).toContain('1');
    });

    it('calculates and displays correct organisations count', () => {
      const { container } = render(<UserStatsCards />);

      expect(screen.getByText('Organisations')).toBeInTheDocument();
      // Find the card containing "Organisations" and check its value
      const orgCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Organisations')
      );
      expect(orgCard?.textContent).toContain('1');
    });

    it('displays archivés as 0', () => {
      render(<UserStatsCards />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Archivés')).toBeInTheDocument();
    });
  });

  describe('Single Admin Case', () => {
    it('displays single admin count correctly', () => {
      const mockMemberships = {
        data: [
          {
            id: 'mem_1',
            role: 'org:admin',
            publicUserData: {
              userId: 'user_1',
              firstName: 'John',
              lastName: 'Doe',
              identifier: 'john.doe@example.com',
            },
          },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: { organizationMemberships: [{ organization: { id: 'org_1' } }] },
      });

      const { container } = render(<UserStatsCards />);

      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
      expect(screen.getByText('Total actifs')).toBeInTheDocument();

      // Check admin card value
      const adminCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Administrateurs')
      );
      expect(adminCard?.textContent).toContain('1');
    });
  });

  describe('All Active Users', () => {
    it('handles all active users correctly', () => {
      const mockMemberships = {
        data: [
          {
            id: 'mem_1',
            role: 'org:admin',
            publicUserData: {
              userId: 'user_1',
              firstName: 'John',
              lastName: 'Doe',
              identifier: 'john.doe@example.com',
            },
          },
          {
            id: 'mem_2',
            role: 'org:member',
            publicUserData: {
              userId: 'user_2',
              firstName: 'Jane',
              lastName: 'Smith',
              identifier: 'jane.smith@example.com',
            },
          },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: { organizationMemberships: [{ organization: { id: 'org_1' } }] },
      });

      render(<UserStatsCards />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Total actifs
      expect(screen.getByText('Total actifs')).toBeInTheDocument();
    });
  });

  describe('Icons and Styling', () => {
    it('renders correct icons for each stat card', () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });

      render(<UserStatsCards />);

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByTestId('building2-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-check-icon')).toBeInTheDocument();
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    });

    it('renders stat cards with correct structure', () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });

      render(<UserStatsCards />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(5);

      const cardContents = screen.getAllByTestId('card-content');
      expect(cardContents).toHaveLength(5);
    });

    it('applies correct CSS classes to cards', () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });

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
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });

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
    it('handles empty data array', () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });

      render(<UserStatsCards />);

      expect(screen.getByText('Total actifs')).toBeInTheDocument();
      expect(screen.getByText('Administrateurs')).toBeInTheDocument();
      expect(screen.getByText('Organisations')).toBeInTheDocument();
      expect(screen.getByText('Bénéficiaires')).toBeInTheDocument();
      expect(screen.getByText('Archivés')).toBeInTheDocument();

      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThanOrEqual(5);
    });

    it('handles all inactive users', () => {
      const mockMemberships = {
        data: [
          {
            id: 'mem_1',
            role: 'org:admin',
            publicUserData: null,
          },
          {
            id: 'mem_2',
            role: 'org:member',
            publicUserData: null,
          },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: { organizationMemberships: [] },
      });

      const { container } = render(<UserStatsCards />);

      expect(screen.getByText('Total actifs')).toBeInTheDocument();
      // Check total actifs card value
      const totalCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Total actifs')
      );
      expect(totalCard?.textContent).toContain('0');
    });

    it('handles users without publicUserData', () => {
      const mockMemberships = {
        data: [
          {
            id: 'mem_1',
            role: 'org:admin',
            publicUserData: null,
          },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: { organizationMemberships: [] },
      });

      const { container } = render(<UserStatsCards />);

      // Should not count users without publicUserData
      const totalCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Total actifs')
      );
      expect(totalCard?.textContent).toContain('0');
    });
  });

  describe('Role Filtering', () => {
    it('correctly counts admins vs other roles', () => {
      const mockMemberships = {
        data: [
          { id: 'mem_1', role: 'org:admin', publicUserData: { userId: '1' } },
          { id: 'mem_2', role: 'org:member', publicUserData: { userId: '2' } },
          { id: 'mem_3', role: 'org:recipient', publicUserData: { userId: '3' } },
          { id: 'mem_4', role: 'org:admin', publicUserData: { userId: '4' } },
        ],
      };

      mockUseOrganization.mockReturnValue({
        memberships: mockMemberships,
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: { organizationMemberships: [{ organization: { id: 'org_1' } }] },
      });

      const { container } = render(<UserStatsCards />);

      // Check admin card
      const adminCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Administrateurs')
      );
      expect(adminCard?.textContent).toContain('2');

      // Check recipient card
      const recipientCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(
        card => card.textContent?.includes('Bénéficiaires')
      );
      expect(recipientCard?.textContent).toContain('1');
    });
  });

  describe('Organization Count', () => {
    it('displays correct organization count from user memberships', () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: {
          organizationMemberships: [
            { organization: { id: 'org_1' } },
            { organization: { id: 'org_2' } },
          ],
        },
      });

      render(<UserStatsCards />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Organisations')).toBeInTheDocument();
    });

    it('displays 0 when user has no organization memberships', () => {
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });
      mockUseUser.mockReturnValue({
        user: { organizationMemberships: [] },
      });

      const { container } = render(<UserStatsCards />);

      expect(screen.getByText('Organisations')).toBeInTheDocument();
      // Find the card containing "Organisations" and check its value
      const orgCard = Array.from(container.querySelectorAll('[data-testid="card"]')).find(card =>
        card.textContent?.includes('Organisations')
      );
      expect(orgCard?.textContent).toContain('0');
    });
  });

  describe('Clickable Cards and Filtering', () => {
    const mockOnFilterChange = jest.fn();

    beforeEach(() => {
      mockOnFilterChange.mockClear();
      mockUseOrganization.mockReturnValue({
        memberships: { data: [] },
        invitations: { data: [], isLoading: false },
      });
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

      // Find the Administrateurs card (second card)
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
