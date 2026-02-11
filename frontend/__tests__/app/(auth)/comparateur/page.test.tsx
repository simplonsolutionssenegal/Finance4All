import { render, screen } from '@testing-library/react';

import DashboardComparatorPage from '@/app/(auth)/comparateur/page';

// Mock the ComparatorIntelligent component
jest.mock('@/components/comparator/comparator-Intelligent', () => {
  return function MockComparatorIntelligent({ mode }: { mode: string }) {
    return (
      <div data-testid='comparator-intelligent' data-mode={mode}>
        Comparator Component
      </div>
    );
  };
});

describe('DashboardComparatorPage', () => {
  it('renders the page title', () => {
    render(<DashboardComparatorPage />);
    expect(screen.getByText('Comparateur')).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<DashboardComparatorPage />);
    expect(
      screen.getByText('Comparez les services financiers selon vos critères.')
    ).toBeInTheDocument();
  });

  it('renders the ComparatorIntelligent component with dashboard mode', () => {
    render(<DashboardComparatorPage />);
    const comparator = screen.getByTestId('comparator-intelligent');
    expect(comparator).toBeInTheDocument();
    expect(comparator).toHaveAttribute('data-mode', 'dashboard');
  });

  it('has correct container structure', () => {
    const { container } = render(<DashboardComparatorPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('h-full', 'w-full');
  });

  it('renders heading with correct styling', () => {
    render(<DashboardComparatorPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
  });

  it('renders description with correct styling', () => {
    render(<DashboardComparatorPage />);
    const description = screen.getByText('Comparez les services financiers selon vos critères.');
    expect(description).toHaveClass('text-gray-500');
  });
});
