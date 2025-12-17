import { render, screen } from '@testing-library/react';

import StatsSection from '@/components/public/StatsSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('StatsSection', () => {
  it('should render without crashing', () => {
    render(<StatsSection />);
    expect(screen.getByText('10K+')).toBeInTheDocument();
  });

  it('should display all stats', () => {
    render(<StatsSection />);
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('Institutions partenaires')).toBeInTheDocument();
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('Modules de formation')).toBeInTheDocument();
    expect(screen.getByText('4.8/5')).toBeInTheDocument();
    expect(screen.getByText('Note moyenne')).toBeInTheDocument();
  });

  it('should have proper section structure', () => {
    const { container } = render(<StatsSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-16', 'bg-white');
  });
});
