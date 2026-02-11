import { render, screen, fireEvent } from '@testing-library/react';

import { ModuleFilters, type FilterType } from '@/components/learning/module-filters';

describe('ModuleFilters', () => {
  const mockOnFilterChange = jest.fn();
  const defaultCounts = {
    all: 10,
    available: 8,
    inProgress: 3,
    completed: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter buttons', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    expect(screen.getByText(/Tous/)).toBeInTheDocument();
    expect(screen.getByText(/Disponibles/)).toBeInTheDocument();
    expect(screen.getByText(/En cours/)).toBeInTheDocument();
    expect(screen.getByText(/Terminés/)).toBeInTheDocument();
  });

  it('displays counts for each filter', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    expect(screen.getByText('Tous (10)')).toBeInTheDocument();
    expect(screen.getByText('Disponibles (8)')).toBeInTheDocument();
    expect(screen.getByText('En cours (3)')).toBeInTheDocument();
    expect(screen.getByText('Terminés (5)')).toBeInTheDocument();
  });

  it('highlights the active filter', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    const allButton = screen.getByText('Tous (10)');
    expect(allButton).toHaveClass('bg-primary-300', 'text-white');
  });

  it('applies inactive styling to non-active filters', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    const availableButton = screen.getByText('Disponibles (8)');
    expect(availableButton).toHaveClass('bg-white', 'text-gray-400');
  });

  it('calls onFilterChange when clicking a filter', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    fireEvent.click(screen.getByText('Disponibles (8)'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('AVAILABLE');
  });

  it('calls onFilterChange with IN_PROGRESS when clicking En cours', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    fireEvent.click(screen.getByText('En cours (3)'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('IN_PROGRESS');
  });

  it('calls onFilterChange with COMPLETED when clicking Terminés', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    fireEvent.click(screen.getByText('Terminés (5)'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('COMPLETED');
  });

  it('highlights AVAILABLE filter when active', () => {
    render(
      <ModuleFilters
        activeFilter='AVAILABLE'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    const availableButton = screen.getByText('Disponibles (8)');
    expect(availableButton).toHaveClass('bg-primary-300', 'text-white');
  });

  it('highlights IN_PROGRESS filter when active', () => {
    render(
      <ModuleFilters
        activeFilter='IN_PROGRESS'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    const inProgressButton = screen.getByText('En cours (3)');
    expect(inProgressButton).toHaveClass('bg-primary-300', 'text-white');
  });

  it('highlights COMPLETED filter when active', () => {
    render(
      <ModuleFilters
        activeFilter='COMPLETED'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    const completedButton = screen.getByText('Terminés (5)');
    expect(completedButton).toHaveClass('bg-primary-300', 'text-white');
  });

  it('handles zero counts correctly', () => {
    const zeroCounts = {
      all: 0,
      available: 0,
      inProgress: 0,
      completed: 0,
    };

    render(
      <ModuleFilters activeFilter='ALL' onFilterChange={mockOnFilterChange} counts={zeroCounts} />
    );

    expect(screen.getByText('Tous (0)')).toBeInTheDocument();
    expect(screen.getByText('Disponibles (0)')).toBeInTheDocument();
    expect(screen.getByText('En cours (0)')).toBeInTheDocument();
    expect(screen.getByText('Terminés (0)')).toBeInTheDocument();
  });

  it('renders with correct container styling', () => {
    const { container } = render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    const filterContainer = container.firstChild as HTMLElement;
    expect(filterContainer).toHaveClass('flex', 'flex-wrap', 'gap-3', 'mb-8');
  });

  it('renders buttons with correct base styling', () => {
    render(
      <ModuleFilters
        activeFilter='ALL'
        onFilterChange={mockOnFilterChange}
        counts={defaultCounts}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('px-4', 'py-2', 'rounded-xl', 'text-xs', 'font-semibold');
    });
  });
});
