import { render, screen } from '@testing-library/react';

import { ModuleStats } from '@/components/learning/module-stats';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BookOpen: () => <div data-testid='icon-book-open'>BookOpen</div>,
  CheckCircle2: () => <div data-testid='icon-check-circle'>CheckCircle2</div>,
  PlayCircle: () => <div data-testid='icon-play-circle'>PlayCircle</div>,
  Lock: () => <div data-testid='icon-lock'>Lock</div>,
}));

describe('ModuleStats', () => {
  const defaultProps = {
    total: 10,
    completed: 5,
    inProgress: 3,
    locked: 2,
  };

  it('renders all four stat cards', () => {
    render(<ModuleStats {...defaultProps} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Terminés')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('Verrouillés')).toBeInTheDocument();
  });

  it('displays correct values for each stat', () => {
    render(<ModuleStats {...defaultProps} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all icons', () => {
    render(<ModuleStats {...defaultProps} />);

    expect(screen.getByTestId('icon-book-open')).toBeInTheDocument();
    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
    expect(screen.getByTestId('icon-play-circle')).toBeInTheDocument();
    expect(screen.getByTestId('icon-lock')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    render(<ModuleStats total={0} completed={0} inProgress={0} locked={0} />);

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(4);
  });

  it('handles large numbers correctly', () => {
    render(<ModuleStats total={1000} completed={500} inProgress={300} locked={200} />);

    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders with correct container styling', () => {
    const { container } = render(<ModuleStats {...defaultProps} />);

    const statsContainer = container.firstChild as HTMLElement;
    expect(statsContainer).toHaveClass('flex', 'flex-wrap', 'gap-4', 'mb-6');
  });

  it('renders stat cards with correct background colors', () => {
    const { container } = render(<ModuleStats {...defaultProps} />);

    // Check for blue background on total
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    // Check for green background on completed
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
    // Check for yellow background on in progress
    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    // Check for gray background on locked
    expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
  });

  it('renders stat cards with correct structure', () => {
    const { container } = render(<ModuleStats {...defaultProps} />);

    const statCards = container.querySelectorAll('.bg-white.rounded-2xl');
    expect(statCards).toHaveLength(4);
  });

  it('displays labels with correct styling', () => {
    render(<ModuleStats {...defaultProps} />);

    const totalLabel = screen.getByText('Total');
    expect(totalLabel).toHaveClass('text-xs', 'font-medium', 'text-gray-400');
  });

  it('displays values with correct styling', () => {
    render(<ModuleStats {...defaultProps} />);

    const totalValue = screen.getByText('10');
    expect(totalValue).toHaveClass('text-xl', 'font-bold');
  });
});
