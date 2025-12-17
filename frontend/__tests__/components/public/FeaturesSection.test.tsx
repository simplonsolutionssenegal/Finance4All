import { render, screen } from '@testing-library/react';

import FeaturesSection from '@/components/public/FeaturesSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('FeaturesSection', () => {
  it('should render without crashing', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Nos Services')).toBeInTheDocument();
  });

  it('should display section title', () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Tout ce dont vous avez besoin/)).toBeInTheDocument();
    expect(screen.getByText(/pour réussir financièrement/)).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Éducation financière/)).toBeInTheDocument();
    const cards = screen.getAllByText(/En savoir plus/);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should have proper section structure', () => {
    const { container } = render(<FeaturesSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-32', 'bg-grey-50');
  });
});
