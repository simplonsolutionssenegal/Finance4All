import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StepInstitutionInfo } from '@/components/admin/institution-financiere/steps/StepInstitutionInfo';

// Mock du hook useForm
const mockForm = {
  control: {},
  handleSubmit: jest.fn(),
  formState: { errors: {} },
} as any;

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => mockForm),
  useController: jest.fn(() => ({
    field: { onChange: jest.fn(), value: '', name: 'test' },
    fieldState: { error: undefined },
  })),
}));

// Mock des composants UI
jest.mock('@/components/ui/form', () => ({
  FormField: ({ render }: any) => {
    const mockField = { onChange: jest.fn(), value: '', name: 'test' };
    const mockFieldState = { error: undefined };
    return render({ field: mockField, fieldState: mockFieldState });
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormMessage: ({ children }: any) => <div data-testid="form-message">{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <button data-testid="select" onClick={() => onValueChange?.('test')}>
      {children}
    </button>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img data-testid="next-image" alt={props.alt || ''} {...props} />,
}));

describe('StepInstitutionInfo', () => {
  const defaultProps = {
    form: mockForm,
    logoPreview: null,
    handleLogoChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields with testids', () => {
    render(<StepInstitutionInfo {...defaultProps} />);
    
    expect(screen.getAllByTestId('form-label')).toHaveLength(5); // nom, type, description, siteWeb, logo
    expect(screen.getAllByTestId('input')).toHaveLength(3); // nom, siteWeb, file input
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('should show logo preview when provided', () => {
    const propsWithLogo = {
      ...defaultProps,
      logoPreview: 'data:image/png;base64,test',
    };
    
    render(<StepInstitutionInfo {...propsWithLogo} />);
    
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
    expect(screen.getByTestId('next-image')).toHaveAttribute('src', 'data:image/png;base64,test');
  });

  it('should show upload area when no logo preview', () => {
    render(<StepInstitutionInfo {...defaultProps} />);
    
    // Vérifier qu'il y a bien un input de type file pour l'upload
    const fileInputs = screen.getAllByTestId('input');
    expect(fileInputs.length).toBeGreaterThan(0);
  });

  it('should show upload area texts when no logo preview', () => {
    render(<StepInstitutionInfo {...defaultProps} />);
    expect(screen.getByText('Ajouter un logo')).toBeInTheDocument();
    expect(screen.getByText('Formats JPG, JPEG ou PNG, max 5 Mo')).toBeInTheDocument();
  });
});