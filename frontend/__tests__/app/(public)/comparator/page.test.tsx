import { render, screen } from '@testing-library/react';

import Comparator from '@/app/(public)/comparator/page';

describe('Comparator', () => {
  it('renders without crashing', () => {
    render(<Comparator />);
    expect(screen.getByText('Page de Comparateur')).toBeInTheDocument();
  });

  it('displays the correct content', () => {
    render(<Comparator />);
    const content = screen.getByText('Page de Comparateur');
    expect(content).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<Comparator />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent('Page de Comparateur');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof Comparator).toBe('function');
    const result = Comparator();
    expect(result).toBeDefined();
    // expect(result.type).toBe('div');
  });
});
