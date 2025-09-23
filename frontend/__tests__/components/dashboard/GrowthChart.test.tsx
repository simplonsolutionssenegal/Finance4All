import { render, screen, fireEvent } from '@testing-library/react';

import GrowthChart from '@/components/dashboard/GrowthChart';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='line-chart'>{children}</div>
  ),
  Line: (props: any) => <div data-testid='line' {...props} />,
  XAxis: (props: any) => <div data-testid='x-axis' {...props} />,
  YAxis: (props: any) => <div data-testid='y-axis' {...props} />,
  CartesianGrid: (props: any) => <div data-testid='cartesian-grid' {...props} />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  Tooltip: (props: any) => <div data-testid='tooltip' {...props} />,
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='card' className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card-content'>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='card-header' className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid='card-title' className={className}>
      {children}
    </h3>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      data-testid='button'
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid='badge' className={className}>
      {children}
    </span>
  ),
}));

// Mock Lucide icon
jest.mock('lucide-react', () => ({
  MoreHorizontal: (props: any) => <div data-testid='more-horizontal-icon' {...props} />,
}));

describe('GrowthChart', () => {
  describe('Rendering', () => {
    it('renders the chart component', () => {
      render(<GrowthChart />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('renders the title and value', () => {
      render(<GrowthChart />);

      expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
      expect(screen.getByText('134,640.00')).toBeInTheDocument();
    });

    it('renders the growth badge', () => {
      render(<GrowthChart />);

      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('📈 13% growth');
    });

    it('renders all time filter buttons', () => {
      render(<GrowthChart />);

      expect(screen.getByText('1D')).toBeInTheDocument();
      expect(screen.getByText('1W')).toBeInTheDocument();
      expect(screen.getByText('1M')).toBeInTheDocument();
      expect(screen.getByText('6M')).toBeInTheDocument();
      expect(screen.getByText('1Y')).toBeInTheDocument();
    });

    it('renders the more options button', () => {
      render(<GrowthChart />);

      expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
    });
  });

  describe('Chart Components', () => {
    it('renders the line chart', () => {
      render(<GrowthChart />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders chart components', () => {
      render(<GrowthChart />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });
  });

  describe('Time Filter Functionality', () => {
    it('has 1M as default active filter', () => {
      render(<GrowthChart />);

      const buttons = screen.getAllByTestId('button');
      const oneMonthButton = buttons.find(button => button.textContent === '1M');

      expect(oneMonthButton).toHaveAttribute('data-variant', 'secondary');
    });

    it('changes active filter when clicking different time periods', () => {
      render(<GrowthChart />);

      const oneDayButton = screen.getByText('1D');
      fireEvent.click(oneDayButton);

      // After clicking, 1D should be active
      const buttons = screen.getAllByTestId('button');
      const oneDayButtonElement = buttons.find(button => button.textContent === '1D');
      const oneMonthButtonElement = buttons.find(button => button.textContent === '1M');

      expect(oneDayButtonElement).toHaveAttribute('data-variant', 'secondary');
      expect(oneMonthButtonElement).toHaveAttribute('data-variant', 'ghost');
    });

    it('changes active filter to 1W when clicked', () => {
      render(<GrowthChart />);

      const oneWeekButton = screen.getByText('1W');
      fireEvent.click(oneWeekButton);

      const buttons = screen.getAllByTestId('button');
      const oneWeekButtonElement = buttons.find(button => button.textContent === '1W');

      expect(oneWeekButtonElement).toHaveAttribute('data-variant', 'secondary');
    });

    it('changes active filter to 6M when clicked', () => {
      render(<GrowthChart />);

      const sixMonthButton = screen.getByText('6M');
      fireEvent.click(sixMonthButton);

      const buttons = screen.getAllByTestId('button');
      const sixMonthButtonElement = buttons.find(button => button.textContent === '6M');

      expect(sixMonthButtonElement).toHaveAttribute('data-variant', 'secondary');
    });

    it('changes active filter to 1Y when clicked', () => {
      render(<GrowthChart />);

      const oneYearButton = screen.getByText('1Y');
      fireEvent.click(oneYearButton);

      const buttons = screen.getAllByTestId('button');
      const oneYearButtonElement = buttons.find(button => button.textContent === '1Y');

      expect(oneYearButtonElement).toHaveAttribute('data-variant', 'secondary');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes to the card', () => {
      render(<GrowthChart />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass(
        'col-span-2',
        'bg-white',
        'shadow-sm',
        'border',
        'border-gray-100',
        'rounded-2xl'
      );
    });

    it('applies correct styling to active filter button', () => {
      render(<GrowthChart />);

      const buttons = screen.getAllByTestId('button');
      const activeButton = buttons.find(
        button => button.textContent === '1M' && button.getAttribute('data-variant') === 'secondary'
      );

      expect(activeButton?.className).toContain('bg-white');
      expect(activeButton?.className).toContain('text-gray-900');
      expect(activeButton?.className).toContain('shadow-sm');
    });

    it('applies correct styling to inactive filter buttons', () => {
      render(<GrowthChart />);

      const buttons = screen.getAllByTestId('button');
      const inactiveButton = buttons.find(
        button => button.textContent === '1D' && button.getAttribute('data-variant') === 'ghost'
      );

      expect(inactiveButton?.className).toContain('text-gray-600');
      expect(inactiveButton?.className).toContain('hover:bg-gray-100');
    });

    it('applies correct styling to the badge', () => {
      render(<GrowthChart />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(
        'bg-green-100',
        'text-green-700',
        'hover:bg-green-100',
        'rounded-full',
        'px-3',
        'py-1'
      );
    });
  });

  describe('Layout Structure', () => {
    it('has correct header layout', () => {
      render(<GrowthChart />);

      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass(
        'flex',
        'flex-row',
        'items-center',
        'justify-between',
        'space-y-0',
        'pb-6'
      );
    });

    it('has filter buttons container with correct styling', () => {
      render(<GrowthChart />);

      // Check that the filter buttons are wrapped in a container with correct classes
      const { container } = render(<GrowthChart />);
      const filterContainer = container.querySelector('.bg-gray-50.rounded-lg.p-1');
      expect(filterContainer).toBeInTheDocument();
    });

    it('sets correct height for chart container', () => {
      render(<GrowthChart />);

      const { container } = render(<GrowthChart />);
      const chartContainer = container.querySelector('.h-64');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles for time filters', () => {
      render(<GrowthChart />);

      const timeFilterButtons = screen.getAllByRole('button');
      expect(timeFilterButtons.length).toBeGreaterThan(0);
    });

    it('has accessible structure with proper semantic elements', () => {
      render(<GrowthChart />);

      const title = screen.getByTestId('card-title');
      expect(title.tagName).toBe('H3');
    });
  });

  describe('Component State Management', () => {
    it('maintains independent state for active filter', () => {
      render(<GrowthChart />);

      // Click multiple filters and verify state changes
      const oneDayButton = screen.getByText('1D');
      const oneWeekButton = screen.getByText('1W');

      fireEvent.click(oneDayButton);
      let buttons = screen.getAllByTestId('button');
      let activeButton = buttons.find(
        button => button.getAttribute('data-variant') === 'secondary'
      );
      expect(activeButton?.textContent).toBe('1D');

      fireEvent.click(oneWeekButton);
      buttons = screen.getAllByTestId('button');
      activeButton = buttons.find(button => button.getAttribute('data-variant') === 'secondary');
      expect(activeButton?.textContent).toBe('1W');
    });
  });

  describe('Data Display', () => {
    it('displays the correct numeric value', () => {
      render(<GrowthChart />);

      const value = screen.getByText('134,640.00');
      expect(value).toBeInTheDocument();
      expect(value).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    });

    it('displays the growth percentage', () => {
      render(<GrowthChart />);

      const growthText = screen.getByText('📈 13% growth');
      expect(growthText).toBeInTheDocument();
    });
  });
});
