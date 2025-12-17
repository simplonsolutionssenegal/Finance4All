import { render, screen } from '@testing-library/react';

import HowItWorks from '@/components/public/HowItWorks';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('HowItWorks', () => {
  it('should render without crashing', () => {
    const { container } = render(<HowItWorks />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should display section content', () => {
    const { container } = render(<HowItWorks />);
    const section = container.querySelector('section');
    expect(section).toBeTruthy();
  });

  it('should have proper section structure', () => {
    const { container } = render(<HowItWorks />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-32', 'bg-white');
  });
});
