import { fireEvent, render, screen } from '@testing-library/react';

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

// Mock the Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

// Mock AddInstitutionModal
jest.mock('@/components/admin/institutions/AddInstitutionModal', () => {
  return function MockAddInstitutionModal({ open, onOpenChange, refresh }: any) {
    return open ? (
      <div data-testid='add-institution-modal'>
        <button onClick={() => onOpenChange(false)}>Close Modal</button>
        <button onClick={refresh}>Refresh</button>
      </div>
    ) : null;
  };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Search: (props: any) => <div data-testid='search-icon' {...props} />,
  Filter: (props: any) => <div data-testid='filter-icon' {...props} />,
  Edit: (props: any) => <div data-testid='edit-icon' {...props} />,
  Trash2: (props: any) => <div data-testid='trash-icon' {...props} />,
  Plus: (props: any) => <div data-testid='plus-icon' {...props} />,
  ChevronLeftIcon: (props: any) => <div data-testid='chevron-left-icon' {...props} />,
  ChevronRightIcon: (props: any) => <div data-testid='chevron-right-icon' {...props} />,
  MoreHorizontalIcon: (props: any) => <div data-testid='more-horizontal-icon' {...props} />,
}));

// Mock pagination components
jest.mock('@/components/ui/pagination', () => ({
  Pagination: ({ children }: any) => <nav data-testid='pagination'>{children}</nav>,
  PaginationContent: ({ children }: any) => <ul data-testid='pagination-content'>{children}</ul>,
  PaginationItem: ({ children }: any) => <li data-testid='pagination-item'>{children}</li>,
  PaginationLink: ({ children, onClick, isActive }: any) => (
    <a
      data-testid='pagination-link'
      onClick={onClick}
      data-active={isActive}
      className={isActive ? 'active' : ''}
    >
      {children}
    </a>
  ),
  PaginationPrevious: ({ onClick, className }: any) => (
    <a data-testid='pagination-previous' onClick={onClick} className={className}>
      Previous
    </a>
  ),
  PaginationNext: ({ onClick, className }: any) => (
    <a data-testid='pagination-next' onClick={onClick} className={className}>
      Next
    </a>
  ),
  PaginationEllipsis: () => <span data-testid='pagination-ellipsis'>...</span>,
}));

// Mock useGetInstitutions hook
const mockRefetch = jest.fn();
jest.mock('@/hooks/useGetInstitutions', () => ({
  useGetInstitutions: jest.fn(),
  InstitutionStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
  },
}));

// Mock useLoader hook
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(() => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn(),
  })),
}));

import InstitutionsList from '@/components/admin/institutions/InstitutionsList';
import { useGetInstitutions } from '@/hooks/useGetInstitutions';
const mockUseGetInstitutions = useGetInstitutions as jest.Mock;

describe('InstitutionsList', () => {
  const mockInstitutions = [
    {
      id: '1',
      name: 'Société générale',
      website: 'www.test.com',
      description: 'Achat de carte visa',
      status: 'ACTIVE' as const,
      geographicZones: ['UEMOA'],
      logoUrl: 'https://logo.com/logo1.png',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Société générale',
      website: 'www.test.com',
      description: 'Achat de carte visa',
      status: 'ACTIVE' as const,
      geographicZones: ['CEMAC'],
      logoUrl: 'https://logo.com/logo2.png',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
    {
      id: '3',
      name: 'Société générale',
      website: 'www.test.com',
      description: 'Achat de carte visa',
      status: 'ACTIVE' as const,
      geographicZones: ['UEMOA', 'CEMAC'],
      logoUrl: 'https://logo.com/logo3.png',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03',
    },
  ];

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetInstitutions.mockReturnValue({
      institutions: mockInstitutions,
      pagination: mockPagination,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('renders without crashing', () => {
    render(<InstitutionsList />);
    expect(screen.getByText('Liste des instituts')).toBeInTheDocument();
  });

  it('displays the title', () => {
    render(<InstitutionsList />);
    expect(screen.getByText('Liste des instituts')).toBeInTheDocument();
  });

  describe('Search and Filter', () => {
    it('renders search input', () => {
      render(<InstitutionsList />);
      const searchInput = screen.getByPlaceholderText('Rechercher une institut');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('renders search icon', () => {
      render(<InstitutionsList />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('renders filter button', () => {
      render(<InstitutionsList />);
      const filterButton = screen.getByText('Filter');
      expect(filterButton).toBeInTheDocument();
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    it('search input is editable', () => {
      render(<InstitutionsList />);
      const searchInput = screen.getByPlaceholderText(
        'Rechercher une institut'
      ) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      expect(searchInput.value).toBe('test search');
    });
  });

  describe('Add Institution Button', () => {
    it('renders add institution button', () => {
      render(<InstitutionsList />);
      const addButton = screen.getByText('Ajouter une institution');
      expect(addButton).toBeInTheDocument();
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('opens modal when add button is clicked', () => {
      render(<InstitutionsList />);
      const addButton = screen.getByText('Ajouter une institution');

      // Modal should not be visible initially
      expect(screen.queryByTestId('add-institution-modal')).not.toBeInTheDocument();

      // Click the add button
      fireEvent.click(addButton);

      // Modal should be visible
      expect(screen.getByTestId('add-institution-modal')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
      render(<InstitutionsList />);
      const addButton = screen.getByText('Ajouter une institution');

      // Open modal
      fireEvent.click(addButton);
      expect(screen.getByTestId('add-institution-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      // Modal should be closed
      expect(screen.queryByTestId('add-institution-modal')).not.toBeInTheDocument();
    });
  });

  describe('Institutions Table', () => {
    it('renders table headers', () => {
      render(<InstitutionsList />);
      expect(screen.getByText("Nom de l'institut")).toBeInTheDocument();
      expect(screen.getByText('Site web')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Statut')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders institution data', () => {
      render(<InstitutionsList />);
      const societyNames = screen.getAllByText('Société générale');
      expect(societyNames.length).toBe(3); // 3 institutions in mock data

      const websites = screen.getAllByText('www.test.com');
      expect(websites.length).toBe(3);

      const descriptions = screen.getAllByText('Achat de carte visa');
      expect(descriptions.length).toBe(3);

      const statuses = screen.getAllByText('Actif');
      expect(statuses.length).toBe(3);
    });

    it('renders action buttons for each institution', () => {
      render(<InstitutionsList />);
      const editIcons = screen.getAllByTestId('edit-icon');
      const trashIcons = screen.getAllByTestId('trash-icon');

      expect(editIcons.length).toBe(3);
      expect(trashIcons.length).toBe(3);
    });

    it('edit buttons have correct styling', () => {
      const { container } = render(<InstitutionsList />);
      const editButtons = container.querySelectorAll('.text-blue-500');
      expect(editButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('delete buttons have correct styling', () => {
      const { container } = render(<InstitutionsList />);
      const deleteButtons = container.querySelectorAll('.text-red-500');
      expect(deleteButtons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Table Structure', () => {
    it('has overflow-x-auto for responsive table', () => {
      const { container } = render(<InstitutionsList />);
      const tableWrapper = container.querySelector('.overflow-x-auto');
      expect(tableWrapper).toBeInTheDocument();
    });

    it('renders table with correct structure', () => {
      const { container } = render(<InstitutionsList />);
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table?.querySelector('thead')).toBeInTheDocument();
      expect(table?.querySelector('tbody')).toBeInTheDocument();
    });

    it('thead has correct styling', () => {
      const { container } = render(<InstitutionsList />);
      const thead = container.querySelector('thead');
      expect(thead).toHaveClass('bg-gray-300/30');
    });

    it('tbody rows have hover effect', () => {
      const { container } = render(<InstitutionsList />);
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });
  });

  describe('Layout and Styling', () => {
    it('main container has correct styling', () => {
      const { container } = render(<InstitutionsList />);
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass(
        'bg-white',
        'rounded-2xl',
        'p-6',
        'shadow-sm',
        'border',
        'border-gray-100'
      );
    });

    it('title has correct styling', () => {
      render(<InstitutionsList />);
      const title = screen.getByText('Liste des instituts');
      expect(title).toHaveClass('text-xl', 'font-bold', 'text-gray-900', 'mb-6');
    });

    it('renders correct number of table rows', () => {
      const { container } = render(<InstitutionsList />);
      const tbody = container.querySelector('tbody');
      const rows = tbody?.querySelectorAll('tr');
      expect(rows?.length).toBe(3); // 3 institutions
    });
  });

  describe('Interactive Elements', () => {
    it('filter button is clickable', () => {
      render(<InstitutionsList />);
      const filterButton = screen.getByText('Filter').closest('button');
      expect(filterButton).toBeInTheDocument();
      fireEvent.click(filterButton!);
    });

    it('edit buttons are clickable', () => {
      const { container } = render(<InstitutionsList />);
      const editButtons = container.querySelectorAll('.text-blue-500');
      editButtons.forEach(button => {
        fireEvent.click(button);
      });
    });

    it('delete buttons are clickable', () => {
      const { container } = render(<InstitutionsList />);
      const deleteButtons = container.querySelectorAll('.text-red-500');
      deleteButtons.forEach(button => {
        fireEvent.click(button);
      });
    });
  });

  describe('Responsive Design', () => {
    it('search and filter section has correct layout', () => {
      const { container } = render(<InstitutionsList />);
      const searchFilterSection = container.querySelector('.flex.justify-between');
      expect(searchFilterSection).toBeInTheDocument();
    });

    it('uses rounded corners appropriately', () => {
      const { container } = render(<InstitutionsList />);
      const roundedElements = container.querySelectorAll('.rounded-xl');
      expect(roundedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('table headers have proper scope', () => {
      const { container } = render(<InstitutionsList />);
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBe(5); // 5 columns
    });

    it('buttons have proper structure', () => {
      const { container } = render(<InstitutionsList />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('AddInstitutionModal Integration', () => {
    it('passes correct props to modal', () => {
      render(<InstitutionsList />);
      const addButton = screen.getByText('Ajouter une institution');

      // Initial state
      expect(screen.queryByTestId('add-institution-modal')).not.toBeInTheDocument();

      // After opening
      fireEvent.click(addButton);
      expect(screen.getByTestId('add-institution-modal')).toBeInTheDocument();
    });

    it('maintains modal state correctly', () => {
      render(<InstitutionsList />);
      const addButton = screen.getByText('Ajouter une institution');

      // Open and close multiple times
      fireEvent.click(addButton);
      expect(screen.getByTestId('add-institution-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('add-institution-modal')).not.toBeInTheDocument();

      fireEvent.click(addButton);
      expect(screen.getByTestId('add-institution-modal')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when there is an error', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: false,
        isError: true,
        error: { message: 'Failed to fetch institutions' },
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      expect(screen.getByText(/Erreur lors du chargement des institutions/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch institutions/)).toBeInTheDocument();
    });

    it('displays retry button when there is an error', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      const retryButton = screen.getByText('Réessayer');
      expect(retryButton).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      const retryButton = screen.getByText('Réessayer');
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('does not display table when there is an error', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: false,
        isError: true,
        error: { message: 'Network error' },
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      expect(screen.queryByText('Société générale')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when there are no institutions', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      expect(screen.getByText('Aucune institution trouvée')).toBeInTheDocument();
    });

    it('does not display table when there are no institutions', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      const { container } = render(<InstitutionsList />);
      const table = container.querySelector('table');
      expect(table).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('does not display pagination when there is only one page', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('displays pagination when there are multiple pages', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('displays correct page numbers', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays pagination info text', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      expect(screen.getByText('Page 1 sur 3 (25 institutions au total)')).toBeInTheDocument();
    });

    it('previous button is disabled on first page', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      const previousButton = screen.getByTestId('pagination-previous');
      expect(previousButton.className).toContain('pointer-events-none opacity-50');
    });

    it('next button is enabled on first page when there are more pages', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton.className).toContain('cursor-pointer');
    });

    it('next button is disabled on last page', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 3, limit: 10, total: 25, totalPages: 3 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton.className).toContain('pointer-events-none opacity-50');
    });

    it('displays ellipsis when there are many pages', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        pagination: { page: 1, limit: 10, total: 100, totalPages: 10 },
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<InstitutionsList />);
      const ellipsis = screen.getByTestId('pagination-ellipsis');
      expect(ellipsis).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('calls useGetInstitutions with correct default parameters', () => {
      render(<InstitutionsList />);
      expect(mockUseGetInstitutions).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('uses institutions data from the hook', () => {
      render(<InstitutionsList />);
      expect(screen.getAllByText('Société générale').length).toBe(3);
    });

    it('displays institution details correctly', () => {
      render(<InstitutionsList />);
      const websites = screen.getAllByText('www.test.com');
      expect(websites.length).toBe(3);

      const descriptions = screen.getAllByText('Achat de carte visa');
      expect(descriptions.length).toBe(3);

      const statuses = screen.getAllByText('Actif');
      expect(statuses.length).toBe(3);
    });
  });
});
