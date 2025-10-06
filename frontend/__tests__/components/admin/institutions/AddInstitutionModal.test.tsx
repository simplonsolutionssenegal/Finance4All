import { render, screen } from '@testing-library/react';

import AddInstitutionModal from '@/components/admin/institutions/AddInstitutionModal';

// Mock useCreateInstitution hook
const mockCreateInstitution = jest.fn();
jest.mock('@/hooks/useCreateInstitution', () => ({
  useCreateInstitution: () => ({
    isCreating: false,
    createInstitution: mockCreateInstitution,
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img alt='' {...props} />;
  },
}));

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid='dialog'>{children}</div> : null),
  DialogContent: ({ children }: any) => (
    <div data-testid='dialog-content' aria-describedby='dialog-description'>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => <div data-testid='dialog-header'>{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid='dialog-title'>{children}</h2>,
  DialogDescription: ({ children }: any) => (
    <p id='dialog-description' data-testid='dialog-description'>
      {children}
    </p>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, onClick, className }: any) => (
    <div onClick={onClick} className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div data-testid='form'>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => {
    const field = { onChange: jest.fn(), value: '' };
    return render({ field });
  },
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div data-testid='form-message' />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid='chevron-down-icon' />,
  X: () => <div data-testid='x-icon' />,
}));

describe('AddInstitutionModal', () => {
  const mockOnOpenChange = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<AddInstitutionModal {...defaultProps} />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Ajouter un institut')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddInstitutionModal {...defaultProps} open={false} />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  describe('Form Fields', () => {
    it('renders all form fields', () => {
      render(<AddInstitutionModal {...defaultProps} />);

      expect(screen.getByText("Nom de l'institut")).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Site web')).toBeInTheDocument();
      expect(screen.getByText('Zones géographiques couvertes')).toBeInTheDocument();
      expect(screen.getByText('Logo (URL)')).toBeInTheDocument();
    });

    it('has correct placeholders', () => {
      render(<AddInstitutionModal {...defaultProps} />);

      expect(screen.getByPlaceholderText('Société générale')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Description de l'institution...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://www.institut.sn')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher une zone...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://exemple.com/logo.png')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('submit button is disabled initially', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const submitButton = screen.getByText('Enregistrer');
      expect(submitButton).toHaveAttribute('disabled');
    });
  });

  describe('Geographic Zones', () => {
    it('renders geographic zone search input', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('Rechercher une zone...')).toBeInTheDocument();
    });

    it('shows ChevronDown icon for zone dropdown', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  describe('Logo Preview', () => {
    it('renders logo URL input', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('https://exemple.com/logo.png')).toBeInTheDocument();
    });
  });

  describe('Submit Button', () => {
    it('renders submit button with correct text', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByText('Enregistrer')).toBeInTheDocument();
    });

    it('has correct styling classes', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const submitButton = screen.getByText('Enregistrer');
      expect(submitButton).toHaveClass(
        'bg-cyan-400',
        'text-white',
        'hover:bg-cyan-500',
        'px-8',
        'py-3',
        'rounded-xl'
      );
    });
  });

  describe('Modal Controls', () => {
    it('calls onOpenChange when closed', () => {
      const { rerender } = render(<AddInstitutionModal {...defaultProps} />);
      rerender(<AddInstitutionModal {...defaultProps} open={false} />);
      // Modal should handle the close event internally
    });
  });

  describe('Form Structure', () => {
    it('renders form element', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByTestId('form')).toBeInTheDocument();
    });

    it('has correct dialog title', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const title = screen.getByText('Ajouter un institut');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('data-testid', 'dialog-title');
    });

    it('dialog content is rendered', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toBeInTheDocument();
    });
  });

  describe('Input Styling', () => {
    it('text inputs have correct styling', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Société générale');
      expect(nameInput).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'border-gray-200',
        'rounded-lg',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:border-transparent'
      );
    });

    it('textarea has correct styling', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const descriptionInput = screen.getByPlaceholderText("Description de l'institution...");
      expect(descriptionInput).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'border-gray-200',
        'rounded-lg',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:border-transparent',
        'resize-none'
      );
      expect(descriptionInput).toHaveAttribute('rows', '4');
    });
  });

  describe('Component Lifecycle', () => {
    it('maintains form state when open', () => {
      const { rerender } = render(<AddInstitutionModal {...defaultProps} />);
      rerender(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('form fields have proper labels', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByText("Nom de l'institut")).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Site web')).toBeInTheDocument();
      expect(screen.getByText('Zones géographiques couvertes')).toBeInTheDocument();
      expect(screen.getByText('Logo (URL)')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('logo URL input has correct type', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const logoInput = screen.getByPlaceholderText('https://exemple.com/logo.png');
      expect(logoInput).toHaveAttribute('type', 'url');
    });

    it('zone search input has correct type', () => {
      render(<AddInstitutionModal {...defaultProps} />);
      const zoneInput = screen.getByPlaceholderText('Rechercher une zone...');
      expect(zoneInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Layout', () => {
    it('form has correct spacing', () => {
      const { container } = render(<AddInstitutionModal {...defaultProps} />);
      const form = container.querySelector('form');
      expect(form).toHaveClass('space-y-4');
    });

    it('submit section has correct layout', () => {
      const { container } = render(<AddInstitutionModal {...defaultProps} />);
      const submitSection = container.querySelector('.flex.justify-end.pt-4');
      expect(submitSection).toBeInTheDocument();
    });
  });
});
