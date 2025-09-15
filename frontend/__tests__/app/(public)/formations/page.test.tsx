import { render, screen } from '@testing-library/react';

import Formations from '@/app/(public)/formations/page';

describe('Formations', () => {
  it('renders without crashing', () => {
    render(<Formations />);
    expect(screen.getByText('Page de formations')).toBeInTheDocument();
  });

  it('displays the correct content', () => {
    render(<Formations />);
    const content = screen.getByText('Page de formations');
    expect(content).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<Formations />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent('Page de formations');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof Formations).toBe('function');
    const result = Formations();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });
});
