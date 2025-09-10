import { render, screen } from '@testing-library/react';

import Dashboard from '@/app/(auth)/dashboard/page';

describe('Dashboard', () => {
  it('renders without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('displays the correct content', () => {
    render(<Dashboard />);
    const content = screen.getByText('Dashboard page');
    expect(content).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<Dashboard />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent('Dashboard page');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof Dashboard).toBe('function');
    const result = Dashboard();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });
});
