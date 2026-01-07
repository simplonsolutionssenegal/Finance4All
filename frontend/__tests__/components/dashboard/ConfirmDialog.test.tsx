import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertTriangle, CheckCircle } from 'lucide-react';

import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';

// Mock AlertDialog components
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid='alert-dialog' data-open={open}>
      {open && (
        <div>
          <button onClick={() => onOpenChange(false)} data-testid='close-dialog'>
            Close
          </button>
          {children}
        </div>
      )}
    </div>
  ),
  AlertDialogContent: ({ children, className }: any) => (
    <div data-testid='alert-dialog-content' className={className}>
      {children}
    </div>
  ),
  AlertDialogHeader: ({ children, className }: any) => (
    <div data-testid='alert-dialog-header' className={className}>
      {children}
    </div>
  ),
  AlertDialogTitle: ({ children, className }: any) => (
    <h2 data-testid='alert-dialog-title' className={className}>
      {children}
    </h2>
  ),
  AlertDialogDescription: ({ children, className }: any) => (
    <div data-testid='alert-dialog-description' className={className}>
      {children}
    </div>
  ),
  AlertDialogFooter: ({ children, className }: any) => (
    <div data-testid='alert-dialog-footer' className={className}>
      {children}
    </div>
  ),
  AlertDialogCancel: ({ children, onClick, disabled, className }: any) => (
    <button
      data-testid='alert-dialog-cancel'
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, onClick, disabled, className }: any) => (
    <button
      data-testid='alert-dialog-action'
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    description: 'Test Description',
    confirmButtonText: 'Confirm',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('alert-dialog-title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('alert-dialog-description')).toHaveTextContent('Test Description');
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    const dialog = screen.getByTestId('alert-dialog');
    expect(dialog).toHaveAttribute('data-open', 'false');
  });

  it('renders icon when provided', () => {
    render(<ConfirmDialog {...defaultProps} icon={AlertTriangle} />);
    const icon = screen.getByTestId('alert-dialog-header').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('does not render icon when not provided', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const header = screen.getByTestId('alert-dialog-header');
    const icon = header.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('applies custom icon background color', () => {
    render(<ConfirmDialog {...defaultProps} icon={AlertTriangle} iconBgColor='bg-red-100' />);
    const iconContainer = screen.getByTestId('alert-dialog-header').querySelector('.bg-red-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies default icon background color when not provided', () => {
    render(<ConfirmDialog {...defaultProps} icon={AlertTriangle} />);
    const iconContainer = screen.getByTestId('alert-dialog-header').querySelector('.bg-orange-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies custom icon color', () => {
    render(<ConfirmDialog {...defaultProps} icon={AlertTriangle} iconColor='text-red-600' />);
    const icon = screen.getByTestId('alert-dialog-header').querySelector('.text-red-600');
    expect(icon).toBeInTheDocument();
  });

  it('applies default icon color when not provided', () => {
    render(<ConfirmDialog {...defaultProps} icon={AlertTriangle} />);
    const icon = screen.getByTestId('alert-dialog-header').querySelector('.text-orange-600');
    expect(icon).toBeInTheDocument();
  });

  it('renders confirm button with correct text', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByTestId('alert-dialog-action')).toHaveTextContent('Confirm');
  });

  it('renders cancel button with default text', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByTestId('alert-dialog-cancel')).toHaveTextContent('Annuler');
  });

  it('renders cancel button with custom text', () => {
    render(<ConfirmDialog {...defaultProps} cancelButtonText='Cancel' />);
    expect(screen.getByTestId('alert-dialog-cancel')).toHaveTextContent('Cancel');
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByTestId('alert-dialog-cancel');
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('closes dialog after successful confirmation', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps dialog open when confirmation fails', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onConfirm = jest.fn().mockRejectedValue(new Error('Test error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors de la confirmation:',
        expect.any(Error)
      );
    });

    // Dialog should not be closed on error
    expect(onClose).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    const confirmButton = screen.getByTestId('alert-dialog-action');
    expect(confirmButton).toHaveTextContent('Chargement...');
    expect(confirmButton).toBeDisabled();
  });

  it('shows custom loading text', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} loadingText='Processing...' />);
    const confirmButton = screen.getByTestId('alert-dialog-action');
    expect(confirmButton).toHaveTextContent('Processing...');
  });

  it('shows loading state during async confirmation', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn(async () => {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    });
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    // Should show loading state
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveTextContent('Chargement...');

    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });
  });

  it('disables buttons when loading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('alert-dialog-action')).toBeDisabled();
    expect(screen.getByTestId('alert-dialog-cancel')).toBeDisabled();
  });

  it('applies custom confirm button className', () => {
    render(
      <ConfirmDialog {...defaultProps} confirmButtonClassName='bg-blue-600 hover:bg-blue-700' />
    );
    const confirmButton = screen.getByTestId('alert-dialog-action');
    expect(confirmButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
  });

  it('applies default confirm button className when not provided', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmButton = screen.getByTestId('alert-dialog-action');
    expect(confirmButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
  });

  it('renders ReactNode description', () => {
    const description = (
      <div>
        <span>Paragraph 1</span>
        <span>Paragraph 2</span>
      </div>
    );
    render(<ConfirmDialog {...defaultProps} description={description} />);
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });

  it('handles different icon components', () => {
    render(<ConfirmDialog {...defaultProps} icon={CheckCircle} />);
    const icon = screen.getByTestId('alert-dialog-header').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('calls onClose when dialog is closed via onOpenChange', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByTestId('close-dialog');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles synchronous onConfirm function', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByTestId('alert-dialog-action');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('renders loading spinner when loading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    const confirmButton = screen.getByTestId('alert-dialog-action');
    const spinner = confirmButton.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
