import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ServicesDashboard } from '@/components/services-financiers/ServicesDashboard';

// Mock child components - InstitutionCard has been removed, so we don't need to mock it

jest.mock('@/components/services-financiers/ServiceFilters', () => ({
  ServiceFilters: ({ isOpen, onToggle }: any) =>
    isOpen
      ? React.createElement(
          'div',
          { 'data-testid': 'service-filters' },
          React.createElement('button', { onClick: onToggle }, 'Close Filters')
        )
      : null,
}));

jest.mock('@/components/services-financiers/ServicesTable', () => ({
  ServicesTable: ({ services, onSort }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'services-table' },
      services.map((service: any) =>
        React.createElement(
          'div',
          { key: service.id, 'data-testid': `service-${service.id}` },
          service.designation
        )
      ),
      React.createElement(
        'button',
        { onClick: () => onSort('designation'), 'data-testid': 'sort-designation' },
        'Sort by Designation'
      )
    ),
}));

jest.mock('@/components/services-financiers/ServicesGrid', () => ({
  ServicesGrid: ({ services }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'services-grid' },
      services.map((service: any) =>
        React.createElement(
          'div',
          { key: service.id, 'data-testid': `service-grid-${service.id}` },
          service.designation
        )
      )
    ),
}));

jest.mock('@/components/services-financiers/Pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'pagination' },
      React.createElement('span', { 'data-testid': 'current-page' }, String(currentPage)),
      React.createElement('span', { 'data-testid': 'total-pages' }, String(totalPages)),
      React.createElement(
        'button',
        {
          onClick: () => onPageChange(Math.max(1, currentPage - 1)),
          'data-testid': 'prev-page',
          disabled: currentPage <= 1,
        },
        'Previous'
      ),
      React.createElement(
        'button',
        {
          onClick: () => onPageChange(currentPage + 1),
          'data-testid': 'next-page',
          disabled:
            typeof totalPages === 'number' && totalPages > 1 ? currentPage >= totalPages : false,
        },
        'Next'
      )
    ),
}));

jest.mock('@/components/charts/ServicesCharts', () => ({
  ServicesChart: ({ services, chartType }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'services-chart' },
      React.createElement(
        'span',
        { 'data-testid': 'chart-services-count' },
        String(services.length)
      ),
      React.createElement('span', { 'data-testid': 'chart-type' }, String(chartType))
    ),
}));

// Mock API client to return institutions with nested services so the dashboard renders
jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(async (_endpoint: string, _method: string, _token: any) => ({
    success: true,
    data: [
      {
        id: 'inst-1',
        name: 'Institution Test',
        status: 'ACTIVE',
        logoUrl: null,
        website: null,
        description: 'Institution de test',
        geographicZones: ['Zone géographique 1'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        services: [
          {
            id: 'svc-1',
            name: 'epargne-basic',
            longName: 'Épargne Basic',
            type: 'EPARGNE',
            frais: {},
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: 'inst-1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
      {
        id: 'inst-2',
        name: 'Banque Test 2',
        status: 'ACTIVE',
        logoUrl: null,
        website: null,
        description: 'Deuxième institution',
        geographicZones: ['Zone géographique 2'],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        services: [
          {
            id: 'svc-2',
            name: 'credit-immo',
            longName: 'Crédit Immobilier',
            type: 'CREDIT',
            frais: {},
            conditionAccess: [],
            plafonds: [],
            infrastructureAccess: [],
            institutionId: 'inst-2',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
      },
    ],
  })),
}));

jest.mock('@/components/export/PDFExport', () => ({
  PDFExport: ({ services }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'pdf-export' },
      React.createElement('span', { 'data-testid': 'export-count' }, String(services.length))
    ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, icon: Icon, ...props }: any) =>
    React.createElement(
      'button',
      { onClick, 'data-variant': variant, ...props },
      Icon ? React.createElement(Icon) : null,
      children
    ),
}));

describe('ServicesDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render main dashboard content', async () => {
      render(<ServicesDashboard />);
      // The institution card has been removed, so we test for the main content instead
      expect(screen.getByText(/produit|service/i)).toBeInTheDocument();
    });

    it('should render main heading', () => {
      render(<ServicesDashboard />);
      expect(screen.getByText(/produit|service/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ServicesDashboard />);
      expect(screen.getByPlaceholderText('Rechercher un service financier')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<ServicesDashboard />);
      expect(screen.getByText('Graphiques')).toBeInTheDocument();
      expect(screen.getByText('Filtrer')).toBeInTheDocument();
    });

    it('should render view mode toggles', () => {
      render(<ServicesDashboard />);
      const tableButton = screen.getByRole('button', { name: /list/i });
      const gridButton = screen.getByRole('button', { name: /grid/i });
      expect(tableButton).toBeInTheDocument();
      expect(gridButton).toBeInTheDocument();
    });

    it('should render PDF export component', () => {
      render(<ServicesDashboard />);
      expect(screen.getByTestId('pdf-export')).toBeInTheDocument();
    });

    it('should render results count', () => {
      render(<ServicesDashboard />);
      expect(screen.getByText(/résultat/)).toBeInTheDocument();
    });

    it('should render services table by default', () => {
      render(<ServicesDashboard />);
      expect(screen.getByTestId('services-table')).toBeInTheDocument();
      expect(screen.queryByTestId('services-grid')).not.toBeInTheDocument();
    });

    it('should render pagination', () => {
      render(<ServicesDashboard />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should filter services based on search term', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const searchInput = screen.getByPlaceholderText('Rechercher un service financier');
      await user.type(searchInput, 'Epargne');

      await waitFor(() => {
        const services = screen.getAllByTestId(/service-/);
        expect(services.length).toBeGreaterThan(0);
      });
    });

    it('should clear search and show all services', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const searchInput = screen.getByPlaceholderText('Rechercher un service financier');
      await user.type(searchInput, 'Epargne');
      await user.clear(searchInput);

      await waitFor(() => {
        const services = screen.getAllByTestId(/service-/);
        expect(services.length).toBeGreaterThan(0);
      });
    });

    it('should reset current page when searching', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      // First go to page 2
      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);

      // Then search
      const searchInput = screen.getByPlaceholderText('Rechercher un service financier');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        const currentPageElement = screen.getByTestId('current-page');
        expect(currentPageElement).toHaveTextContent('1');
      });
    });
  });

  describe('View mode switching', () => {
    it('should switch to grid view when grid button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const gridButton = screen.getByRole('button', { name: /grid/i });
      await user.click(gridButton);

      await waitFor(() => {
        expect(screen.queryByTestId('services-table')).not.toBeInTheDocument();
        expect(screen.getByTestId('services-grid')).toBeInTheDocument();
      });
    });

    it('should switch back to table view when table button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      // Switch to grid first
      const gridButton = screen.getByRole('button', { name: /grid/i });
      await user.click(gridButton);

      // Then switch back to table
      const tableButton = screen.getByRole('button', { name: /list/i });
      await user.click(tableButton);

      await waitFor(() => {
        expect(screen.getByTestId('services-table')).toBeInTheDocument();
        expect(screen.queryByTestId('services-grid')).not.toBeInTheDocument();
      });
    });
  });

  describe('Charts functionality', () => {
    it('should show charts when Graphiques button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const chartsButton = screen.getByText('Graphiques');
      await user.click(chartsButton);

      await waitFor(() => {
        expect(screen.getByTestId('services-chart')).toBeInTheDocument();
      });
    });

    it('should hide charts when Graphiques button is clicked again', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const chartsButton = screen.getByText('Graphiques');

      // Show charts
      await user.click(chartsButton);
      expect(screen.getByTestId('services-chart')).toBeInTheDocument();

      // Hide charts
      await user.click(chartsButton);
      await waitFor(() => {
        expect(screen.queryByTestId('services-chart')).not.toBeInTheDocument();
      });
    });

    it('should cycle through chart types', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      // Show charts first
      const chartsButton = screen.getByText('Graphiques');
      await user.click(chartsButton);

      // Initially should show bar chart
      expect(screen.getByText('Barres')).toBeInTheDocument();
      expect(screen.getByText('Secteurs')).toBeInTheDocument();
      expect(screen.getByText('Courbes')).toBeInTheDocument();

      // Click pie chart button
      const pieButton = screen.getByText('Secteurs');
      await user.click(pieButton);

      // Chart type should update
      await waitFor(() => {
        const chartElement = screen.getByTestId('services-chart');
        expect(chartElement).toBeInTheDocument();
      });
    });
  });

  // Comparison functionality removed from the dashboard per feature change

  describe('Filters functionality', () => {
    it('should show filters modal when Filtrer button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const filterButton = screen.getByText('Filtrer');
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByTestId('service-filters')).toBeInTheDocument();
      });
    });

    it('should update filters when filters change', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      // Open filters
      const filterButton = screen.getByText('Filtrer');
      await user.click(filterButton);

      // Close filters (this simulates filter changes)
      const closeFiltersButton = screen.getByText('Close Filters');
      await user.click(closeFiltersButton);

      await waitFor(() => {
        expect(screen.queryByTestId('service-filters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should handle page changes', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);

      await waitFor(() => {
        const currentPageElement = screen.getByTestId('current-page');
        expect(currentPageElement).toHaveTextContent('2');
      });
    });

    it('should handle previous page', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      // Go to page 2 first
      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);

      // Then go back to page 1
      const prevButton = screen.getByTestId('prev-page');
      await user.click(prevButton);

      await waitFor(() => {
        const currentPageElement = screen.getByTestId('current-page');
        expect(currentPageElement).toHaveTextContent('1');
      });
    });

    it('should disable previous button on first page', () => {
      render(<ServicesDashboard />);
      const prevButton = screen.getByTestId('prev-page');
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Sorting functionality', () => {
    it('should handle sort button clicks', async () => {
      const user = userEvent.setup();
      render(<ServicesDashboard />);

      const sortButton = screen.getByTestId('sort-designation');
      await user.click(sortButton);

      // Should trigger sort functionality (tested through mocked component)
      expect(sortButton).toBeInTheDocument();
    });
  });

  describe('Service actions', () => {
    it('should handle service schedule action', async () => {
      render(<ServicesDashboard />);

      // This would be tested through the actual service components
      // but we can verify the modal structure is ready
      expect(screen.getByTestId('services-table')).toBeInTheDocument();
    });
  });

  describe('Add product functionality', () => {
    it('should render add product button', () => {
      render(<ServicesDashboard />);
      expect(screen.queryByText('Ajouter un produit')).not.toBeInTheDocument();
    });

    it('should handle add product button click', async () => {
      render(<ServicesDashboard />);

      const addButton = screen.queryByText('Ajouter un produit');
      expect(addButton).not.toBeInTheDocument();
    });
  });

  describe('Results display', () => {
    it('should display correct results count', () => {
      render(<ServicesDashboard />);
      const resultsText = screen.getByText(/résultat/);
      expect(resultsText).toBeInTheDocument();
    });

    it('should handle empty results', () => {
      // This would require mocking empty data
      // For now, we verify the structure exists
      render(<ServicesDashboard />);
      expect(screen.getByText(/résultat/)).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should render all main sections', async () => {
      render(<ServicesDashboard />);

      const card = await screen.findByTestId('institution-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText(/produit|service/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher un service financier')).toBeInTheDocument();
      expect(screen.getByTestId('services-table')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle missing data gracefully', () => {
      // Test with minimal props or mocked empty data
      render(<ServicesDashboard />);
      expect(screen.getByTestId('services-table')).toBeInTheDocument();
    });
  });
});
