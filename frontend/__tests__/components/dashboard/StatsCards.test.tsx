import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StatsCards from '@/components/dashboard/StatsCards';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid='shopping-cart-icon' />,
  Shield: () => <div data-testid='shield-icon' />,
  Clock: () => <div data-testid='clock-icon' />,
  MoreHorizontal: () => <div data-testid='more-horizontal-icon' />,
}));

describe('StatsCards', () => {
  it('renders all stat cards', () => {
    render(<StatsCards />);

    // Check for all unique values to ensure all cards are rendered
    expect(screen.getByText('12,350')).toBeInTheDocument();
    expect(screen.getByText('134,640.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all stat titles', () => {
    render(<StatsCards />);

    const titles = screen.getAllByText('Lorem ipsum');
    expect(titles.length).toBeGreaterThanOrEqual(3); // Should have at least 3 titles
  });

  it('renders all stat subtitles', () => {
    render(<StatsCards />);

    expect(screen.getByText('7,332 Lorem ipsum')).toBeInTheDocument();
    expect(screen.getByText('13% Lorem ipsum')).toBeInTheDocument();
  });

  it('renders all stat icons', () => {
    render(<StatsCards />);

    expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('renders more options buttons for each card', () => {
    render(<StatsCards />);

    const moreButtons = screen.getAllByTestId('more-horizontal-icon');
    expect(moreButtons).toHaveLength(3); // One for each card
  });

  it('renders growth percentages for applicable cards', () => {
    render(<StatsCards />);

    const growthPercentages = screen.getAllByText('+13%');
    expect(growthPercentages).toHaveLength(2); // Two cards have growth data
  });

  it('applies correct styling for positive growth', () => {
    render(<StatsCards />);

    const growthElements = screen.getAllByText('+13%');
    growthElements.forEach(element => {
      expect(element).toHaveClass('text-green-600');
    });
  });

  it('renders count values for the third card', () => {
    render(<StatsCards />);

    // The third card has hardcoded count values
    const redCount = screen.getByText('3');
    const greenCount = screen.getByText('8');

    expect(redCount).toHaveClass('text-red-500');
    expect(greenCount).toHaveClass('text-green-500');
  });

  it('renders icon backgrounds with correct colors', () => {
    const { container } = render(<StatsCards />);

    const blueBackgrounds = container.querySelectorAll('.bg-blue-100');
    const orangeBackgrounds = container.querySelectorAll('.bg-orange-100');

    expect(blueBackgrounds.length).toBe(2); // First two cards
    expect(orangeBackgrounds.length).toBe(1); // Third card
  });

  it('renders status indicators with green color', () => {
    const { container } = render(<StatsCards />);

    const greenIndicators = container.querySelectorAll('.bg-green-500.rounded-full');
    expect(greenIndicators.length).toBeGreaterThan(0);
  });

  it('has responsive grid layout', () => {
    const { container } = render(<StatsCards />);

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'gap-6',
      'mb-6'
    );
  });

  it('renders cards with correct styling', () => {
    const { container } = render(<StatsCards />);

    const cards = container.querySelectorAll(
      '[class*="bg-white shadow-sm border border-gray-100 rounded-2xl"]'
    );
    expect(cards.length).toBe(3);
  });

  it('can interact with more options buttons', async () => {
    const user = userEvent.setup();
    render(<StatsCards />);

    const moreButtons = screen.getAllByRole('button');

    // Click on the first more options button
    await user.click(moreButtons[0]);

    // Should be clickable without errors
    expect(moreButtons[0]).toBeInTheDocument();
  });

  it('renders proper spacing and layout for card content', () => {
    const { container } = render(<StatsCards />);

    const spacedContainers = container.querySelectorAll('.space-y-2');
    expect(spacedContainers.length).toBe(3); // One for each card
  });

  it('displays large font values correctly', () => {
    render(<StatsCards />);

    const largeValues = screen.getAllByText((content, element) => {
      if (!element) return false;
      return element.classList.contains('text-2xl') && element.classList.contains('font-bold');
    });

    expect(largeValues.length).toBeGreaterThan(0);
  });

  it('renders card headers with proper flex layout', () => {
    const { container } = render(<StatsCards />);

    const cardHeaders = container.querySelectorAll(
      '[class*="flex flex-row items-center justify-between"]'
    );
    expect(cardHeaders.length).toBe(3);
  });

  it('renders the special count section for the third card', () => {
    const { container } = render(<StatsCards />);

    const countSections = container.querySelectorAll('.flex.space-x-6');
    expect(countSections.length).toBe(1); // Only the third card has this
  });
});
