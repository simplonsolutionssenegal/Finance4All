import { render, screen } from '@testing-library/react';

import Faq from '@/app/(public)/faq/page';

describe('FAQ', () => {
  it('renders without crashing', () => {
    render(<Faq />);
    expect(screen.getByText('Page de FAQ')).toBeInTheDocument();
  });

  it('displays the correct content', () => {
    render(<Faq />);
    const content = screen.getByText('Page de FAQ');
    expect(content).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<Faq />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent('Page de FAQ');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof Faq).toBe('function');
    const result = Faq();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });
});
