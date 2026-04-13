import { render, screen } from '@testing-library/react';
import { Users, Building2 } from 'lucide-react';

import StatsCards from '@/components/dashboard/StatsCards';
import type { StatCardItem } from '@/components/dashboard/StatsCards';

const mockItems: StatCardItem[] = [
  {
    id: 'users',
    title: 'Inscrits',
    value: 150,
    subtitle: '45 en formation',
    icon: Users,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'orgs',
    title: 'Organisations',
    value: 5,
    icon: Building2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
  },
];

describe('StatsCards', () => {
  it('renders all stat cards from items prop', () => {
    render(<StatsCards items={mockItems} />);

    expect(screen.getByText('Inscrits')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Organisations')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders subtitles when provided', () => {
    render(<StatsCards items={mockItems} />);

    expect(screen.getByText('45 en formation')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    const { container } = render(<StatsCards items={[]} isLoading />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });

  it('renders empty when no items and not loading', () => {
    const { container } = render(<StatsCards items={[]} />);

    const cards = container.querySelectorAll('[class*="rounded-2xl"]');
    expect(cards.length).toBe(0);
  });

  it('has responsive grid layout', () => {
    const { container } = render(<StatsCards items={mockItems} />);

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });
});
