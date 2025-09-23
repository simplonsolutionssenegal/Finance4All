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
    expect(mainContainer).toHaveClass('min-h-full', 'bg-gray-50');

    const innerContainer = mainContainer.firstChild as HTMLElement;
    expect(innerContainer).toHaveClass('space-y-6');
  });

  it('renders components in correct order', () => {
    const { container } = render(<UsersPage />);

    const innerContainer = container.querySelector('.space-y-6');
    const children = Array.from(innerContainer?.children || []);

    expect(children).toHaveLength(2);
    expect(children[0]).toHaveAttribute('data-testid', 'user-stats-cards');
    expect(children[1]).toHaveAttribute('data-testid', 'users-list');
  });

  it('is a React component function', () => {
    expect(typeof UsersPage).toBe('function');
  });

  it('returns JSX element', () => {
    const result = UsersPage();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });

  it('applies correct CSS classes for responsive design', () => {
    const { container } = render(<UsersPage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toContain('min-h-full');
    expect(mainContainer.className).toContain('bg-gray-50');
  });

  it('maintains proper spacing between components', () => {
    const { container } = render(<UsersPage />);

    const innerContainer = container.querySelector('.space-y-6');
    expect(innerContainer).toBeInTheDocument();
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

  describe('Layout Responsiveness', () => {
    it('uses background color for full page coverage', () => {
      const { container } = render(<UsersPage />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('bg-gray-50');
    });

    it('ensures minimum full height', () => {
      const { container } = render(<UsersPage />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('min-h-full');
    });
  });
});
