import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DonutChart from '@/components/dashboard/DonutChart';

// Mock recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  MoreHorizontal: () => <div data-testid="more-horizontal-icon" />,
}));

describe('DonutChart', () => {
  it('renders the chart container', () => {
    render(<DonutChart />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  it('renders the card title', () => {
    const { container } = render(<DonutChart />);

    // Use a more specific selector for the card title
    const cardTitle = container.querySelector('[data-slot="card-title"]');
    expect(cardTitle).toBeInTheDocument();
    expect(cardTitle).toHaveTextContent('Lorem ipsum');
  });

  it('renders the center total value', () => {
    render(<DonutChart />);

    expect(screen.getByText('112,452.20')).toBeInTheDocument();
  });

  it('renders all data items with values', () => {
    render(<DonutChart />);

    // Check that formatted values are displayed
    expect(screen.getByText('65,345.00')).toBeInTheDocument();
    expect(screen.getByText('25,345.00')).toBeInTheDocument();
    expect(screen.getByText('22,330.00')).toBeInTheDocument();
  });

  it('renders all data item names', () => {
    render(<DonutChart />);

    // All items have the same name "Lorem ipsum", so we should find multiple
    const loremItems = screen.getAllByText('Lorem ipsum');
    expect(loremItems.length).toBeGreaterThan(1);
  });

  it('renders the more options button', () => {
    render(<DonutChart />);

    const moreButton = screen.getByRole('button');
    expect(moreButton).toBeInTheDocument();
    expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
  });

  it('has the correct card styling', () => {
    const { container } = render(<DonutChart />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'shadow-sm', 'border', 'border-gray-100', 'rounded-2xl');
  });

  it('renders legend items with colored indicators', () => {
    const { container } = render(<DonutChart />);

    // Check for colored indicators (div elements with inline styles for background color)
    const colorIndicators = container.querySelectorAll('.w-3.h-3.rounded-full');
    expect(colorIndicators.length).toBe(3); // Should have 3 color indicators for 3 data items
  });

  it('can interact with the more options button', async () => {
    const user = userEvent.setup();
    render(<DonutChart />);

    const moreButton = screen.getByRole('button');
    await user.click(moreButton);

    // The button should be clickable (no errors thrown)
    expect(moreButton).toBeInTheDocument();
  });

  it('formats values correctly as currency', () => {
    render(<DonutChart />);

    // Check that values are formatted with proper decimal places
    expect(screen.getByText('65,345.00')).toBeInTheDocument();
    expect(screen.getByText('25,345.00')).toBeInTheDocument();
    expect(screen.getByText('22,330.00')).toBeInTheDocument();
  });

  it('renders chart container with correct dimensions', () => {
    const { container } = render(<DonutChart />);

    const chartContainer = container.querySelector('.w-40.h-40');
    expect(chartContainer).toBeInTheDocument();
  });
});