import { render, screen } from '@testing-library/react';

import FAQ from '@/app/(public)/faq/page';

describe('FAQ', () => {
  it('renders without crashing', () => {
    render(<FAQ />);
    expect(screen.getByText('Page de FAQ')).toBeInTheDocument();
  });

  it('displays the correct content', () => {
    render(<FAQ />);
    const content = screen.getByText('Page de FAQ');
    expect(content).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<FAQ />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent('Page de FAQ');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof FAQ).toBe('function');
    const result = FAQ();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });
});
