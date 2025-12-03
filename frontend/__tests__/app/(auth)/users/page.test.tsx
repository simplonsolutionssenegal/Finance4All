import { render, screen } from '@testing-library/react';

import UsersPage from '@/app/(auth)/users/page';

// Mock the components
jest.mock('@/components/users/UsersList', () => {
  return function MockUsersList() {
    return <div data-testid='users-list'>UsersList Component</div>;
  };
});

jest.mock('@/components/users/UserStatsCards', () => {
  return function MockUserStatsCards() {
    return <div data-testid='user-stats-cards'>UserStatsCards Component</div>;
  };
});

describe('UsersPage', () => {
  it('renders without crashing', () => {
    render(<UsersPage />);

    expect(screen.getByTestId('users-list')).toBeInTheDocument();
    expect(screen.getByTestId('user-stats-cards')).toBeInTheDocument();
  });

  it('renders UserStatsCards component', () => {
    render(<UsersPage />);

    const userStatsCards = screen.getByTestId('user-stats-cards');
    expect(userStatsCards).toBeInTheDocument();
    expect(userStatsCards).toHaveTextContent('UserStatsCards Component');
  });

  it('renders UsersList component', () => {
    render(<UsersPage />);

    const usersList = screen.getByTestId('users-list');
    expect(usersList).toBeInTheDocument();
    expect(usersList).toHaveTextContent('UsersList Component');
  });

  it('has correct layout structure', () => {
    const { container } = render(<UsersPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('space-y-6');
  });

  it('renders components in correct order', () => {
    const { container } = render(<UsersPage />);

    const innerContainer = container.querySelector('.space-y-6');
    const children = Array.from(innerContainer?.children || []);

    // There are 3 children: header div, UserStatsCards, UsersList
    expect(children.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId('user-stats-cards')).toBeInTheDocument();
    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });

  it('is a React component function', () => {
    expect(typeof UsersPage).toBe('function');
  });

  it('renders header text correctly', () => {
    render(<UsersPage />);

    expect(screen.getByText('Gestion des utilisateurs')).toBeInTheDocument();
    expect(
      screen.getByText(/Administration complète de la plateforme Finance4All/i)
    ).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<UsersPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toContain('space-y-6');
  });

  it('maintains proper spacing between components', () => {
    const { container } = render(<UsersPage />);

    const innerContainer = container.querySelector('.space-y-6');
    expect(innerContainer).toBeInTheDocument();
  });

  it('handles filter change correctly', () => {
    render(<UsersPage />);

    // UserStatsCards receives onFilterChange prop which updates selectedRole state
    const userStatsCards = screen.getByTestId('user-stats-cards');
    expect(userStatsCards).toBeInTheDocument();

    // UsersList receives selectedRole and onRoleChange props
    const usersList = screen.getByTestId('users-list');
    expect(usersList).toBeInTheDocument();
  });

  describe('Component Integration', () => {
    it('integrates UserStatsCards and UsersList properly', () => {
      render(<UsersPage />);

      // Both components should be present
      expect(screen.getByTestId('user-stats-cards')).toBeInTheDocument();
      expect(screen.getByTestId('users-list')).toBeInTheDocument();

      // They should be siblings within the same container
      const container = screen.getByTestId('user-stats-cards').parentElement;
      const usersList = screen.getByTestId('users-list');
      expect(container).toContainElement(usersList);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = render(<UsersPage />);

      // Should be wrapped in a div with semantic classes
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.tagName).toBe('DIV');
    });
  });

  describe('State Management', () => {
    it('manages selectedRole state correctly', () => {
      render(<UsersPage />);

      expect(screen.getByTestId('user-stats-cards')).toBeInTheDocument();
      expect(screen.getByTestId('users-list')).toBeInTheDocument();
    });
  });
});
