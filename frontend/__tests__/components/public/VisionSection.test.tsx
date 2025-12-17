import { render, screen } from '@testing-library/react';

import VisionSection from '@/components/public/VisionSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('VisionSection', () => {
  it('should render without crashing', () => {
    render(<VisionSection />);
    expect(screen.getByText('Notre Vision')).toBeInTheDocument();
  });

  it('should display section content', () => {
    const { container } = render(<VisionSection />);
    expect(container.textContent).toContain('Notre Vision');
  });

  it('should have proper section structure', () => {
    const { container } = render(<VisionSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-32');
  });
});
