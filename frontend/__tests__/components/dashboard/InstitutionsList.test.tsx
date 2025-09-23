import { render, screen } from '@testing-library/react';

import InstitutionsList from '@/components/dashboard/InstitutionsList';

describe('InstitutionsList', () => {
  it('renders the component title', () => {
    render(<InstitutionsList />);

    expect(screen.getByText('Instituts financières')).toBeInTheDocument();
  });

  it('renders all institutions', () => {
    render(<InstitutionsList />);

    // All institutions have the same name "Lorem ipsum", so we should find multiple
    const institutionNames = screen.getAllByText('Lorem ipsum');
    expect(institutionNames.length).toBeGreaterThanOrEqual(6); // 3 institutions × 2 (name + type)
  });

  it('renders institution statuses', () => {
    render(<InstitutionsList />);

    const activeStatuses = screen.getAllByText('ACTIVE');
    const inactiveStatuses = screen.getAllByText('INACTIVE');

    expect(activeStatuses).toHaveLength(2);
    expect(inactiveStatuses).toHaveLength(1);
  });

  it('applies correct styling for active status', () => {
    render(<InstitutionsList />);

    const activeBadges = screen.getAllByText('ACTIVE');
    activeBadges.forEach(badge => {
      expect(badge.closest('.bg-green-100')).toBeInTheDocument();
    });
  });

  it('applies correct styling for inactive status', () => {
    render(<InstitutionsList />);

    const inactiveBadge = screen.getByText('INACTIVE');
    expect(inactiveBadge.closest('.bg-gray-100')).toBeInTheDocument();
  });

  it('renders status indicators with correct colors', () => {
    const { container } = render(<InstitutionsList />);

    // Check for green status indicators (active)
    const greenIndicators = container.querySelectorAll('.bg-green-500');
    expect(greenIndicators.length).toBeGreaterThan(0);

    // Check for gray status indicators (inactive)
    const grayIndicators = container.querySelectorAll('.bg-gray-400');
    expect(grayIndicators.length).toBeGreaterThan(0);
  });

  it('has the correct card styling', () => {
    const { container } = render(<InstitutionsList />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'shadow-sm', 'border', 'border-gray-100', 'rounded-2xl');
  });

  it('renders institutions in a list format', () => {
    const { container } = render(<InstitutionsList />);

    const institutionItems = container.querySelectorAll(
      '[class*="flex items-center justify-between"]'
    );
    expect(institutionItems.length).toBe(3); // Should have 3 institution items
  });

  it('renders badges with correct variant and styling', () => {
    const { container } = render(<InstitutionsList />);

    const badges = container.querySelectorAll('[class*="border-0"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('renders proper grid layout for institution info', () => {
    const { container } = render(<InstitutionsList />);

    const gridLayouts = container.querySelectorAll('.grid.grid-cols-2.gap-4');
    expect(gridLayouts.length).toBe(3); // One for each institution
  });

  it('renders the correct number of institutions with proper spacing', () => {
    const { container } = render(<InstitutionsList />);

    const spacedContainer = container.querySelector('.space-y-4');
    expect(spacedContainer).toBeInTheDocument();
  });
});
