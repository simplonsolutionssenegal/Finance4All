import { render, screen } from '@testing-library/react';

import TestimonialSection from '@/components/public/TestimonialSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

// Mock embla-carousel-react
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [() => null, { scrollPrev: jest.fn(), scrollNext: jest.fn() }],
}));

describe('TestimonialSection', () => {
  it('should render without crashing', () => {
    render(<TestimonialSection />);
    expect(screen.getByText('Témoignages')).toBeInTheDocument();
  });

  it('should display section content', () => {
    const { container } = render(<TestimonialSection />);
    expect(container.textContent).toContain('Témoignages');
  });

  it('should have proper section structure', () => {
    const { container } = render(<TestimonialSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-32');
  });
});
