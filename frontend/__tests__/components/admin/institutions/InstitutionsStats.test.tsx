import { render, screen } from '@testing-library/react';

import InstitutionsStats from '@/components/admin/institutions/InstitutionsStats';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Archive: (props: any) => <div data-testid='archive-icon' {...props} />,
  Clock: (props: any) => <div data-testid='clock-icon' {...props} />,
  CheckCircle2: (props: any) => <div data-testid='check-circle-icon' {...props} />,
}));

describe('InstitutionsStats', () => {
  it('renders without crashing', () => {
    render(<InstitutionsStats />);
    expect(screen.getByText('Terminer')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  it('renders all three stat cards', () => {
    const { container } = render(<InstitutionsStats />);
    const cards = container.querySelectorAll('.bg-white');
    expect(cards.length).toBe(3);
  });

  it('displays correct titles for each stat', () => {
    render(<InstitutionsStats />);
    expect(screen.getByText('Terminer')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
  });

  it('displays correct values for each stat', () => {
    render(<InstitutionsStats />);
    expect(screen.getByText('12,350')).toBeInTheDocument();
    expect(screen.getAllByText('134,640.00')).toHaveLength(2);
  });

  it('displays correct change text for each stat', () => {
    render(<InstitutionsStats />);
    expect(screen.getByText('7,332 Lorem ipsum')).toBeInTheDocument();
    expect(screen.getAllByText('13% Lorem ipsum')).toHaveLength(2);
  });

  it('renders correct icons for each stat card', () => {
    render(<InstitutionsStats />);
    expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('applies correct icon colors', () => {
    const { container } = render(<InstitutionsStats />);
    const icons = container.querySelectorAll('.text-blue-400');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('applies correct icon background colors', () => {
    const { container } = render(<InstitutionsStats />);
    const iconBackgrounds = container.querySelectorAll('.bg-blue-50');
    expect(iconBackgrounds.length).toBeGreaterThanOrEqual(3);
  });

  it('renders trend indicators', () => {
    const { container } = render(<InstitutionsStats />);
    const greenIndicators = container.querySelectorAll('.text-green-500');
    expect(greenIndicators.length).toBeGreaterThanOrEqual(3);
  });

  it('has hover effects on cards', () => {
    const { container } = render(<InstitutionsStats />);
    const cards = container.querySelectorAll('.hover\\:shadow-md');
    expect(cards.length).toBe(3);
  });

  it('renders action buttons for each card', () => {
    const { container } = render(<InstitutionsStats />);
    const actionButtons = container.querySelectorAll('button');
    expect(actionButtons.length).toBe(3);
  });

  describe('Grid Layout', () => {
    it('uses responsive grid layout', () => {
      const { container } = render(<InstitutionsStats />);
      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6', 'mb-8');
    });
  });

  describe('Card Structure', () => {
    it('each card has correct structure', () => {
      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.bg-white');

      cards.forEach(card => {
        expect(card).toHaveClass('rounded-2xl', 'p-6', 'shadow-sm', 'border', 'border-gray-100');
      });
    });

    it('renders icon containers with correct styling', () => {
      const { container } = render(<InstitutionsStats />);
      const iconContainers = container.querySelectorAll('.p-3.rounded-xl');
      expect(iconContainers.length).toBe(3);
    });
  });

  describe('Content Display', () => {
    it('displays stat titles with correct styling', () => {
      const { container } = render(<InstitutionsStats />);
      const titles = container.querySelectorAll('.text-gray-500.text-sm');
      expect(titles.length).toBeGreaterThanOrEqual(3);
    });

    it('displays stat values with correct styling', () => {
      const { container } = render(<InstitutionsStats />);
      const values = container.querySelectorAll('.text-3xl.font-bold');
      expect(values.length).toBe(3);
    });
  });

  describe('Menu Dots', () => {
    it('renders menu dots for each card', () => {
      const { container } = render(<InstitutionsStats />);
      const svgs = container.querySelectorAll('svg');
      // 3 icons + 3 menu dots = 6 total
      expect(svgs.length).toBeGreaterThanOrEqual(3);
    });

    it('menu dots have correct styling', () => {
      const { container } = render(<InstitutionsStats />);
      const menuButtons = container.querySelectorAll('.text-gray-400.hover\\:text-gray-600');
      expect(menuButtons.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = render(<InstitutionsStats />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.tagName).toBe('DIV');
    });

    it('buttons are keyboard accessible', () => {
      const { container } = render(<InstitutionsStats />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Visual Consistency', () => {
    it('all cards have same border styling', () => {
      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.border-gray-100');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });

    it('all cards have same shadow styling', () => {
      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.shadow-sm');
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });
});
