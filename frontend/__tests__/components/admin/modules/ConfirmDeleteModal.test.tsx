import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmDeleteModal from '@/components/admin/modules/ConfirmDeleteModal';

jest.mock('lucide-react', () => {
  const handler: any = { get: () => (props: any) => <svg {...props} /> };
  return new Proxy({}, handler);
});

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid='alert-dialog' data-open={open}>
      {open ? (
        <div>
          <button type='button' data-testid='close-dialog' onClick={() => onOpenChange(false)}>
            Close
          </button>
          {children}
        </div>
      ) : null}
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
  AlertDialogCancel: ({ children, className }: any) => (
    <button data-testid='alert-dialog-cancel' className={className} type='button'>
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, className, onClick }: any) => (
    <button data-testid='alert-dialog-action' className={className} onClick={onClick} type='button'>
      {children}
    </button>
  ),
}));

describe('ConfirmDeleteModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    description: 'Supprimer cet element ?',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with default labels', () => {
    render(<ConfirmDeleteModal {...baseProps} />);

    expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('alert-dialog-title')).toHaveTextContent('Attention');
    expect(screen.getByTestId('alert-dialog-description')).toHaveTextContent(
      'Supprimer cet element ?'
    );
    expect(screen.getByTestId('alert-dialog-cancel')).toHaveTextContent('Annuler');
    expect(screen.getByTestId('alert-dialog-action')).toHaveTextContent('Supprimer');
  });

  it('does not render content when closed', () => {
    render(<ConfirmDeleteModal {...baseProps} isOpen={false} />);

    expect(screen.getByTestId('alert-dialog')).toHaveAttribute('data-open', 'false');
    expect(screen.queryByTestId('alert-dialog-content')).not.toBeInTheDocument();
  });

  it('renders custom title/confirm label and ReactNode description', () => {
    render(
      <ConfirmDeleteModal
        {...baseProps}
        title='Custom title'
        confirmLabel='Confirmer'
        description={
          <div>
            <span>Ligne 1</span>
            <span>Ligne 2</span>
          </div>
        }
      />
    );

    expect(screen.getByTestId('alert-dialog-title')).toHaveTextContent('Custom title');
    expect(screen.getByTestId('alert-dialog-action')).toHaveTextContent('Confirmer');
    expect(screen.getByText('Ligne 1')).toBeInTheDocument();
    expect(screen.getByText('Ligne 2')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDeleteModal {...baseProps} />);

    await user.click(screen.getByTestId('alert-dialog-action'));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when dialog is closed via onOpenChange', async () => {
    const user = userEvent.setup();
    render(<ConfirmDeleteModal {...baseProps} />);

    await user.click(screen.getByTestId('close-dialog'));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });
});
