import { render, screen } from '@testing-library/react';

import InstitutionDetailsComponent from '@/components/admin/institutions/InstitutionDetailsComponent';
import { useGetInstitution } from '@/hooks/institution/useGetInstitution';
import { InstitutionStatus } from '@/types/Institution';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className }: any) => <hr className={className} />,
}));

// Mock useLoader hook
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(() => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn(),
  })),
}));

// Mock useGetInstitution hook
const mockRefetch = jest.fn();
jest.mock('@/hooks/institution/useGetInstitution', () => ({
  useGetInstitution: jest.fn(),
}));

const mockUseGetInstitution = useGetInstitution as jest.Mock;

describe('InstitutionDetailsComponent', () => {
  const mockInstitution = {
    id: '1',
    name: 'Test Institution',
    description: 'Test Description',
    website: 'https://test.com',
    geographicZones: ['UEMOA', 'CEMAC'],
    logoUrl: 'https://logo.com/logo.png',
    status: InstitutionStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetInstitution.mockReturnValue({
      institution: mockInstitution,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('renders institution details correctly', () => {
    render(<InstitutionDetailsComponent institutionId='1' />);

    expect(screen.getByText('Test Institution')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getByText('UEMOA')).toBeInTheDocument();
    expect(screen.getByText('CEMAC')).toBeInTheDocument();
  });

  it('displays back to list link', () => {
    render(<InstitutionDetailsComponent institutionId='1' />);

    const backLink = screen.getByText('Retour à la liste');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/institutions');
  });

  it('renders logo when logoUrl is provided', () => {
    render(<InstitutionDetailsComponent institutionId='1' />);

    const logo = screen.getByAltText('Logo de Test Institution');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://logo.com/logo.png');
  });

  it('renders initial when logoUrl is not provided', () => {
    mockUseGetInstitution.mockReturnValue({
      institution: { ...mockInstitution, logoUrl: '' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<InstitutionDetailsComponent institutionId='1' />);

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  describe('Status Badge', () => {
    it('renders active status correctly', () => {
      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('renders inactive status correctly', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.INACTIVE },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('Inactif')).toBeInTheDocument();
    });

    it('renders pending status correctly', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('En attente')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('displays activate and reject buttons for pending status', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.PENDING },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('REJETER')).toBeInTheDocument();
      expect(screen.getByText('ACTIVER')).toBeInTheDocument();
    });

    it('displays deactivate button for active status', () => {
      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('DÉSACTIVER')).toBeInTheDocument();
    });

    it('displays activate button for inactive status', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, status: InstitutionStatus.INACTIVE },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('ACTIVER')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when there is an error', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Failed to load institution' },
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText(/Erreur lors du chargement de l'institution/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load institution/)).toBeInTheDocument();
    });

    it('displays back to list button on error', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: undefined,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />);

      const backButton = screen.getByText('Retour à la liste');
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders nothing when institution is not loaded', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      const { container } = render(<InstitutionDetailsComponent institutionId='1' />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Financial Products Section', () => {
    it('displays financial products section', () => {
      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('Produits Financiers')).toBeInTheDocument();
      expect(screen.getByText('Aucun produit financier pour le moment.')).toBeInTheDocument();
    });
  });

  describe('Geographic Zones', () => {
    it('displays all geographic zones', () => {
      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('Zones géographiques :')).toBeInTheDocument();
      expect(screen.getByText('UEMOA')).toBeInTheDocument();
      expect(screen.getByText('CEMAC')).toBeInTheDocument();
    });

    it('handles single geographic zone', () => {
      mockUseGetInstitution.mockReturnValue({
        institution: { ...mockInstitution, geographicZones: ['UEMOA'] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionDetailsComponent institutionId='1' />);

      expect(screen.getByText('UEMOA')).toBeInTheDocument();
      expect(screen.queryByText('CEMAC')).not.toBeInTheDocument();
    });
  });
});
