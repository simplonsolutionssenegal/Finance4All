import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import Sidebar from '@/components/dashboard/Sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="layout-dashboard-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('renders the dashboard header', () => {
    render(<Sidebar />);

    expect(screen.getByText('+ Dashboard')).toBeInTheDocument();
  });

  it('renders the menu section', () => {
    render(<Sidebar />);

    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('renders all menu items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Institutions partenaires')).toBeInTheDocument();
    expect(screen.getByText('Cours & Formations')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders menu item icons', () => {
    render(<Sidebar />);

    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('building2-icon')).toBeInTheDocument();
    expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('renders badges for menu items that have them', () => {
    render(<Sidebar />);

    expect(screen.getByText('32')).toBeInTheDocument(); // Institutions badge
    expect(screen.getByText('10')).toBeInTheDocument(); // Notifications badge
  });

  it('highlights the active menu item', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<Sidebar />);

    const overviewButton = screen.getByRole('button', { name: /overview/i });
    expect(overviewButton).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('does not highlight inactive menu items', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<Sidebar />);

    const usersButton = screen.getByRole('button', { name: /utilisateurs/i });
    expect(usersButton).toHaveClass('text-gray-700', 'hover:bg-gray-50');
    expect(usersButton).not.toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('renders user profile section', () => {
    render(<Sidebar />);

    expect(screen.getByText('Jaafar')).toBeInTheDocument();
    expect(screen.getByText('dgueye.ext@simplon.co')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // Avatar fallback
  });

  it('renders logout button', () => {
    render(<Sidebar />);

    expect(screen.getByText('Log out')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  it('has correct sidebar styling', () => {
    const { container } = render(<Sidebar />);

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass(
      'w-64',
      'h-full',
      'bg-white',
      'border-r',
      'border-gray-200',
      'flex',
      'flex-col'
    );
  });

  it('renders navigation links with correct hrefs', () => {
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /overview/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /institutions partenaires/i })).toHaveAttribute('href', '/institutions');
    expect(screen.getByRole('link', { name: /cours & formations/i })).toHaveAttribute('href', '/formations');
    expect(screen.getByRole('link', { name: /utilisateurs/i })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: /notifications/i })).toHaveAttribute('href', '/notifications');
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
  });

  it('renders avatar with correct styling', () => {
    render(<Sidebar />);

    const avatarFallback = screen.getByText('J');
    expect(avatarFallback).toHaveClass('bg-teal-500', 'text-white');
  });

  it('renders badges with correct styling', () => {
    const { container } = render(<Sidebar />);

    const badges = container.querySelectorAll('.bg-gray-800.text-white');
    expect(badges.length).toBe(2); // Should have 2 badges (32 and 10)
  });

  it('changes active state based on pathname', () => {
    // Test with users page active
    mockUsePathname.mockReturnValue('/users');
    render(<Sidebar />);

    const usersButton = screen.getByRole('button', { name: /utilisateurs/i });
    expect(usersButton).toHaveClass('bg-blue-50', 'text-blue-700');

    const overviewButton = screen.getByRole('button', { name: /overview/i });
    expect(overviewButton).toHaveClass('text-gray-700', 'hover:bg-gray-50');
  });

  it('renders profile section at the bottom', () => {
    const { container } = render(<Sidebar />);

    const profileSection = container.querySelector('.mt-auto');
    expect(profileSection).toBeInTheDocument();
    expect(profileSection).toHaveClass('border-t', 'border-gray-200');
  });
});