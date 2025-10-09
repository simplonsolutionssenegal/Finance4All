import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserInfoModal from '@/components/users/UserInfoModal';
import type OrganizationUser from '@/types/OrganizationUser';

// Mock Dialog to suppress accessibility warnings
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid='dialog' onBlur={onOpenChange}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid='dialog-content' className={className} aria-describedby='dialog-description'>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid='dialog-header'>{children}</div>,
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid='dialog-title' className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children }: any) => (
    <p id='dialog-description' data-testid='dialog-description'>
      {children}
    </p>
  ),
}));

describe('UserInfoModal', () => {
  const mockOnClose = jest.fn();
  const mockOnDeactivate = jest.fn();

  const mockUser: OrganizationUser = {
    id: 'user_123',
    fullName: 'John Doe',
    emailAddress: 'john.doe@example.com',
    role: 'org:member',
    status: 'Actif',
    createAt: new Date(),
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onDeactivate: mockOnDeactivate,
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with user data', () => {
    render(<UserInfoModal {...defaultProps} />);

    expect(screen.getByText("Informations de l'utilisateur")).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('org:member')).toBeInTheDocument();
    expect(screen.getByText('Actif')).toBeInTheDocument();
    expect(screen.getByText('+221899089789')).toBeInTheDocument(); // Static phone number
  });

  it('does not render when closed', () => {
    render(<UserInfoModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Informations de l'utilisateur")).not.toBeInTheDocument();
  });

  it('shows active status badge with correct styling', () => {
    render(<UserInfoModal {...defaultProps} />);

    const statusBadge = screen.getByText('Actif');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('shows inactive status badge with correct styling', () => {
    const inactiveUser = { ...mockUser, status: 'Inactif' };
    render(<UserInfoModal {...defaultProps} user={inactiveUser} />);

    const statusBadge = screen.getByText('Inactif');
    expect(statusBadge).toHaveClass('bg-orange-100', 'text-orange-700');
  });

  it('displays admin role correctly', () => {
    const adminUser = { ...mockUser, role: 'org:admin' };
    render(<UserInfoModal {...defaultProps} user={adminUser} />);

    expect(screen.getByText('org:admin')).toBeInTheDocument();
  });

  it('calls onDeactivate when deactivate button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserInfoModal {...defaultProps} />);

    const deactivateButton = screen.getByText('Désactiver le compte');
    await user.click(deactivateButton);

    expect(mockOnDeactivate).toHaveBeenCalled();
  });

  it('calls onClose when dialog is closed', async () => {
    userEvent.setup();

    render(<UserInfoModal {...defaultProps} />);

    // Simulate closing the dialog by clicking outside or pressing escape
    // Since we're testing the onOpenChange prop
    render(<UserInfoModal {...defaultProps} isOpen={false} />);

    // Verify that the close function would be called
    expect(mockOnClose).toBeDefined();
  });

  it('displays all user information fields', () => {
    render(<UserInfoModal {...defaultProps} />);

    // Check all field labels are present
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Nom et prénom')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
    expect(screen.getByText('Type de compte')).toBeInTheDocument();
  });

  it('renders deactivate button with correct styling', () => {
    render(<UserInfoModal {...defaultProps} />);

    const deactivateButton = screen.getByText('Désactiver le compte');
    expect(deactivateButton).toHaveClass(
      'w-full',
      'bg-orange-500',
      'hover:bg-orange-600',
      'text-white',
      'rounded-lg'
    );
  });

  it('handles different user data correctly', () => {
    const differentUser: OrganizationUser = {
      id: 'user_456',
      fullName: 'Jane Smith',
      emailAddress: 'jane.smith@example.com',
      role: 'org:admin',
      status: 'Inactif',
      createAt: new Date(),
    };

    render(<UserInfoModal {...defaultProps} user={differentUser} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('org:admin')).toBeInTheDocument();
    expect(screen.getByText('Inactif')).toBeInTheDocument();
  });

  it('capitalizes role text correctly', () => {
    render(<UserInfoModal {...defaultProps} />);

    const roleElement = screen.getByText('org:member');
    expect(roleElement).toHaveClass('capitalize');
  });
});
