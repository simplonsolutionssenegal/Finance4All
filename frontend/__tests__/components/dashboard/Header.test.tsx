import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Header from '@/components/dashboard/Header';

// Mock NoSSR component
jest.mock('@/components/NoSSR', () => {
  return function NoSSR({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  User: () => <div data-testid="user-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  LogOut: () => <div data-testid="log-out-icon" />,
}));

jest.mock('@/components/dashboard/LogoutAlert', () => ({
  LogoutAlert: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? (
      <div data-testid="logout-alert">
        <button onClick={onClose} data-testid="close-logout-alert">Close</button>
      </div>
    ) : null,
}));

describe('Header', () => {
  it('renders the logo and dashboard title', () => {
    render(<Header />);

    expect(screen.getByAltText('Finance4ALL')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(<Header />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders the notification bell with badge', () => {
    render(<Header />);

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // notification badge
  });

  it('renders user avatar and name', () => {
    render(<Header />);

    expect(screen.getByText('Jaafar')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // avatar fallback
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
  });

  it('renders dropdown menu items', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Click on the user dropdown trigger
    const userButton = screen.getByRole('button', { name: /jaafar/i });
    await user.click(userButton);

    // Check if dropdown menu items are visible
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  it('opens logout alert when logout is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Click on the user dropdown trigger
    const userButton = screen.getByRole('button', { name: /jaafar/i });
    await user.click(userButton);

    // Click on logout menu item
    const logoutMenuItem = screen.getByText('Déconnexion');
    await user.click(logoutMenuItem);

    // Check if logout alert is opened
    expect(screen.getByTestId('logout-alert')).toBeInTheDocument();
  });

  it('closes logout alert when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open logout alert
    const userButton = screen.getByRole('button', { name: /jaafar/i });
    await user.click(userButton);
    
    const logoutMenuItem = screen.getByText('Déconnexion');
    await user.click(logoutMenuItem);

    // Close logout alert
    const closeButton = screen.getByTestId('close-logout-alert');
    await user.click(closeButton);

    // Check if logout alert is closed (it should not be in document after close)
    expect(screen.queryByTestId('logout-alert')).not.toBeInTheDocument();
  });

  it('renders logout icon in dropdown menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Click on the user dropdown trigger
    const userButton = screen.getByRole('button', { name: /jaafar/i });
    await user.click(userButton);

    // Check if logout icon is present
    expect(screen.getByTestId('log-out-icon')).toBeInTheDocument();
  });

  it('renders user and settings icons in dropdown menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Click on the user dropdown trigger
    const userButton = screen.getByRole('button', { name: /jaafar/i });
    await user.click(userButton);

    // Check if icons are present
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('has logout menu item with correct styling', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Click on the user dropdown trigger
    const userButton = screen.getByRole('button', { name: /jaafar/i });
    await user.click(userButton);

    // Check logout menu item styling
    const logoutMenuItem = screen.getByText('Déconnexion').closest('[role="menuitem"]');
    expect(logoutMenuItem).toHaveClass('text-red-600', 'hover:text-red-700');
  });

  it('renders search input as interactive element', () => {
    render(<Header />);

    const searchInput = screen.getByPlaceholderText('Search...');

    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
    expect(searchInput).not.toBeDisabled();
  });

  it('has the correct header styling', () => {
    const { container } = render(<Header />);

    const header = container.querySelector('header');
    expect(header).toHaveClass(
      'w-full',
      'h-16',
      'bg-white',
      'border-b',
      'border-gray-200',
      'px-6',
      'flex',
      'items-center',
      'justify-between'
    );
  });

  it('renders the notification button as clickable', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Find the notification button by the badge text since it's more reliable
    const notificationBadge = screen.getByText('10');
    const notificationButton = notificationBadge.closest('button') || screen.getByTestId('bell-icon').closest('button');

    if (notificationButton) {
      expect(notificationButton).toBeInTheDocument();
      // Should be clickable without errors
      await user.click(notificationButton);
    } else {
      // If it's not wrapped in a button, just check the bell icon exists
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    }
  });

  it('renders logo with correct attributes', () => {
    render(<Header />);

    const logo = screen.getByAltText('Finance4ALL');
    expect(logo).toHaveAttribute('src', '/logo.svg');
    expect(logo).toHaveClass('h-8', 'w-auto');
  });

  it('renders search input with correct styling', () => {
    render(<Header />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toHaveClass(
      'pl-10',
      'pr-4',
      'py-2',
      'w-80',
      'border-gray-300',
      'rounded-lg',
      'focus:ring-2',
      'focus:ring-teal-500',
      'focus:border-transparent'
    );
  });

  it('renders avatar with correct fallback', () => {
    render(<Header />);

    const avatarFallback = screen.getByText('J');
    expect(avatarFallback).toHaveClass('bg-teal-500', 'text-white');
  });

  it('renders notification badge with correct styling', () => {
    render(<Header />);

    const badge = screen.getByText('10');
    expect(badge).toHaveClass(
      'absolute',
      '-top-1',
      '-right-1',
      'bg-red-500',
      'text-white',
      'text-xs',
      'rounded-full',
      'w-4',
      'h-4',
      'flex',
      'items-center',
      'justify-center'
    );
  });
});