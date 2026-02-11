import { render, screen } from '@testing-library/react';

import DashboardSimulatorPage from '@/app/(auth)/simulateur/page';

// Mock the ServiceSimulator component
jest.mock('@/components/service-simulator/service-simulator', () => ({
  ServiceSimulator: function MockServiceSimulator({ mode }: { mode: string }) {
    return (
      <div data-testid='service-simulator' data-mode={mode}>
        Simulator Component
      </div>
    );
  },
}));

describe('DashboardSimulatorPage', () => {
  it('renders the page title', () => {
    render(<DashboardSimulatorPage />);
    expect(screen.getByText('Simulateur')).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<DashboardSimulatorPage />);
    expect(screen.getByText('Estimez vos frais de transaction en temps réel.')).toBeInTheDocument();
  });

  it('renders the ServiceSimulator component with dashboard mode', () => {
    render(<DashboardSimulatorPage />);
    const simulator = screen.getByTestId('service-simulator');
    expect(simulator).toBeInTheDocument();
    expect(simulator).toHaveAttribute('data-mode', 'dashboard');
  });

  it('has correct container structure', () => {
    const { container } = render(<DashboardSimulatorPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('h-full', 'w-full');
  });

  it('renders heading with correct styling', () => {
    render(<DashboardSimulatorPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
  });

  it('renders description with correct styling', () => {
    render(<DashboardSimulatorPage />);
    const description = screen.getByText('Estimez vos frais de transaction en temps réel.');
    expect(description).toHaveClass('text-gray-500');
  });

  it('renders header section with correct margin', () => {
    const { container } = render(<DashboardSimulatorPage />);
    const headerSection = container.querySelector('.mb-6');
    expect(headerSection).toBeInTheDocument();
  });
});
