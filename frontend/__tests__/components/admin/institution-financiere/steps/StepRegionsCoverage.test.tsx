import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StepRegionsCoverage } from '@/components/admin/institution-financiere/steps/StepRegionsCoverage';

// Mock du hook useForm
const mockForm = {
  control: {},
  handleSubmit: jest.fn(),
  formState: { errors: {} },
} as any;

// Mock des composants UI
jest.mock('@/components/ui/form', () => ({
  FormField: ({ render }: any) => {
    const mockField = { onChange: jest.fn(), value: [], name: 'regionsDesservies' };
    const mockFieldState = { error: undefined };
    return render({ field: mockField, fieldState: mockFieldState });
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormMessage: ({ children }: any) => <div data-testid="form-message">{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <div data-testid="badge" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon">✓</span>,
}));

describe('StepRegionsCoverage', () => {
  const mockToggleRegion = jest.fn();
  
  const defaultProps = {
    form: mockForm,
    selectedRegions: [],
    toggleRegion: mockToggleRegion,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title and description', () => {
    render(<StepRegionsCoverage {...defaultProps} />);
    
    expect(screen.getByText('Couverture géographique')).toBeInTheDocument();
    expect(screen.getByText('Sélectionnez les régions couvertes par cette institution')).toBeInTheDocument();
  });

  it('should show "Aucune région sélectionnée" when no regions selected', () => {
    render(<StepRegionsCoverage {...defaultProps} />);
    
    expect(screen.getByText('Aucune région sélectionnée')).toBeInTheDocument();
  });

  it('should display selected regions as badges', () => {
    const propsWithSelectedRegions = {
      ...defaultProps,
      selectedRegions: ['centre', 'nord'],
    };
    
    render(<StepRegionsCoverage {...propsWithSelectedRegions} />);
    
    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(2);
  });

  it('should call toggleRegion when clicking on region button', () => {
    render(<StepRegionsCoverage {...defaultProps} />);
    
    // Chercher les boutons des régions (il devrait y en avoir plusieurs)
    const regionButtons = screen.getAllByRole('button');
    
    // Cliquer sur le premier bouton de région
    fireEvent.click(regionButtons[0]);
    
    expect(mockToggleRegion).toHaveBeenCalledTimes(1);
  });

  it('should call toggleRegion when clicking remove button on selected region badge', () => {
    const propsWithSelectedRegions = {
      ...defaultProps,
      selectedRegions: ['centre'],
    };
    
    render(<StepRegionsCoverage {...propsWithSelectedRegions} />);
    
    // Chercher le bouton de suppression dans le badge (✕)
    const removeButton = screen.getByText('✕');
    fireEvent.click(removeButton);
    
    expect(mockToggleRegion).toHaveBeenCalledWith('centre');
  });

  it('should show check icon for selected regions', () => {
    const propsWithSelectedRegions = {
      ...defaultProps,
      selectedRegions: ['centre'],
    };
    
    render(<StepRegionsCoverage {...propsWithSelectedRegions} />);
    
    // Vérifier qu'il y a au moins une icône de check pour les régions sélectionnées
    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('should apply correct styling for selected and unselected regions', () => {
    const propsWithSelectedRegions = {
      ...defaultProps,
      selectedRegions: ['centre'],
    };
    
    render(<StepRegionsCoverage {...propsWithSelectedRegions} />);
    
    // Vérifier que les boutons ont les bonnes classes CSS
    const regionButtons = screen.getAllByRole('button');
    
    // Au moins un bouton devrait avoir la classe pour région sélectionnée
    const selectedButton = regionButtons.find(button => 
      button.className.includes('bg-teal-50')
    );
    expect(selectedButton).toBeDefined();
  });
});