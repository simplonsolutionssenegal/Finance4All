import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmDesactivationModal from '@/components/users/ConfirmDesactivationModal';
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

describe('ConfirmDesactivationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

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
    onConfirm: mockOnConfirm,
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with user information', () => {
    render(<ConfirmDesactivationModal {...defaultProps} />);

    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(screen.getByText(/Vous allez supprimer le compte de l'utilisateur/)).toBeInTheDocument();
    expect(screen.getByText('John Doe (john.doe@example.com)')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDesactivationModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Attention')).not.toBeInTheDocument();
  });

  it('shows warning icon', () => {
    render(<ConfirmDesactivationModal {...defaultProps} />);

    // Check for the AlertTriangle icon container
    const iconContainer = document.body.querySelector('.bg-orange-100');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('rounded-full');
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDesactivationModal {...defaultProps} />);

    const confirmButton = screen.getByText('Supprimer');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDesactivationModal {...defaultProps} />);

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays correct user details in warning message', () => {
    const differentUser = {
      ...mockUser,
      fullName: 'Jane Smith',
      emailAddress: 'jane.smith@example.com',
    };

    render(<ConfirmDesactivationModal {...defaultProps} user={differentUser} />);

    expect(screen.getByText('Jane Smith (jane.smith@example.com)')).toBeInTheDocument();
  });

  it('has correct styling for buttons', () => {
    render(<ConfirmDesactivationModal {...defaultProps} />);

    const cancelButton = screen.getByText('Annuler');
    const confirmButton = screen.getByText('Supprimer');

    expect(cancelButton).toHaveClass('text-gray-700', 'bg-white', 'border-gray-300');
    expect(confirmButton).toHaveClass('bg-orange-500', 'hover:bg-orange-600', 'text-white');
  });

  it('shows loading state when deleting', () => {
    render(<ConfirmDesactivationModal {...defaultProps} isDeleting={true} />);

    expect(screen.getByText('Suppression...')).toBeInTheDocument();
    const cancelButton = screen.getByText('Annuler');
    const confirmButton = screen.getByText('Suppression...').closest('button');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it('disables buttons when deleting', () => {
    render(<ConfirmDesactivationModal {...defaultProps} isDeleting={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('renders with correct dialog structure', () => {
    render(<ConfirmDesactivationModal {...defaultProps} />);

    // Check that the main content structure is present
    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(screen.getByText(/Vous allez supprimer/)).toBeInTheDocument();

    // Check that both action buttons are present
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Annuler');
    expect(buttons[1]).toHaveTextContent('Supprimer');
  });

  it('displays user information with correct formatting', () => {
    render(<ConfirmDesactivationModal {...defaultProps} />);

    const userInfo = screen.getByText('John Doe (john.doe@example.com)');
    expect(userInfo).toHaveClass('font-medium', 'text-gray-900');
  });

  it('has centered header layout', () => {
    render(<ConfirmDesactivationModal {...defaultProps} />);

    const header = document.body.querySelector('[class*="text-center"]');
    expect(header).toBeInTheDocument();
  });

  it('uses correct alert dialog structure', () => {
    render(<ConfirmDesactivationModal {...defaultProps} />);

    // The component should render as an AlertDialog which typically has role="alertdialog"
    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(screen.getByText(/Vous allez supprimer/)).toBeInTheDocument();
  });
});
