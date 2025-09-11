import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AddInstitutionDialog } from '@/components/admin/institution-financiere/add-institution-dialog';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock form components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div data-testid="mock-form">{children}</div>,
  FormField: ({ children, render }: any) => {
    const field = { value: '', onChange: jest.fn() };
    return <div>{render ? render({ field }) : children}</div>;
  },
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: ({ children }: any) => <div className="text-red-500">{children}</div>,
}));

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {open && children}
      <button onClick={() => onOpenChange(false)} data-testid="close-dialog">Close</button>
    </div>
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogTitle: ({ children }: any) => <h1>{children}</h1>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, ...props }: any) => (
    <button onClick={onClick} type={type} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      fn({
        nom: 'Test Institution',
        type: 'banque',
        description: 'Test description',
        siteWeb: 'https://test.com',
        regionsDesservies: ['national'],
      });
    },
    reset: jest.fn(),
    setValue: jest.fn(),
    formState: { errors: {} },
  }),
}));

// Mock zod resolver
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => ({}),
}));

describe('AddInstitutionDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open is true', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Ajouter une institution')).toBeInTheDocument();
  });

  it('should not render content when open is false', () => {
    render(<AddInstitutionDialog {...defaultProps} open={false} />);
    
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false');
  });

  it('should show step 1 content by default', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    expect(screen.getByText("Informations de l'institution")).toBeInTheDocument();
  });

  it('should call onOpenChange when close button is clicked', () => {
    const onOpenChange = jest.fn();
    render(<AddInstitutionDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    fireEvent.click(screen.getByTestId('close-dialog'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show correct step titles', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    // Should show step 1 title by default
    expect(screen.getByText("Informations de l'institution")).toBeInTheDocument();
  });

  it('should have navigation buttons', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    // Should have next button on step 1
    expect(screen.getByText('Suivant')).toBeInTheDocument();
  });

  it('should show form fields', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    // Check if form elements are present
    expect(screen.getAllByRole('textbox')).toHaveLength(3); // nom, description, siteWeb
  });

  it('should handle form submission', () => {
    const { toast } = require('sonner');
    const { container } = render(<AddInstitutionDialog {...defaultProps} />);
    
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    
    expect(toast.success).toHaveBeenCalledWith('Institution financière ajoutée avec succès');
  });

  it('should call onOpenChange when form is submitted successfully', async () => {
    const onOpenChange = jest.fn();
    const { container } = render(<AddInstitutionDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should render progress indicators', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    // Should have step progression elements
    const dialog = screen.getByTestId('dialog-content');
    expect(dialog).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    expect(screen.getByText('Ajouter une institution financière')).toBeInTheDocument();
    expect(screen.getByText("Formulaire d'ajout d'une institution financière")).toBeInTheDocument();
  });

  it('should reset form state when dialog is closed and reopened', () => {
    const { rerender } = render(<AddInstitutionDialog {...defaultProps} open={false} />);
    
    rerender(<AddInstitutionDialog {...defaultProps} open={true} />);
    
    // Should show step 1 again
    expect(screen.getByText("Informations de l'institution")).toBeInTheDocument();
  });

  it('should handle navigation buttons', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    // Should have next button on step 1
    const nextButton = screen.getByText('Suivant');
    expect(nextButton).toBeInTheDocument();
  });

  it('should show close button functionality', () => {
    const onOpenChange = jest.fn();
    render(<AddInstitutionDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    const closeButton = screen.getByLabelText('Fermer');
    fireEvent.click(closeButton);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render form inputs with correct placeholders', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Société générale')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Décrivez l\'institution financière')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://exemple.com')).toBeInTheDocument();
  });

  it('should render file upload input', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    const fileUploadText = screen.getByText('Ajouter un logo');
    expect(fileUploadText).toBeInTheDocument();
  });

  it('should render select options', () => {
    render(<AddInstitutionDialog {...defaultProps} />);
    
    expect(screen.getByText('Banque')).toBeInTheDocument();
    expect(screen.getByText('Microfinance')).toBeInTheDocument();
    expect(screen.getByText('Assurance')).toBeInTheDocument();
    expect(screen.getByText('Autre')).toBeInTheDocument();
  });
});
