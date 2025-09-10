import { render, screen } from '@testing-library/react';

import SignUp from '@/app/sign-up/page';

describe('SignUp', () => {
  it('renders without crashing', () => {
    render(<SignUp />);
    expect(screen.getByText("Page d'inscription")).toBeInTheDocument();
  });

  it('displays the correct content', () => {
    render(<SignUp />);
    const content = screen.getByText("Page d'inscription");
    expect(content).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = render(<SignUp />);
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent("Page d'inscription");
  });

  it('should be a function that returns JSX', () => {
    expect(typeof SignUp).toBe('function');
    const result = SignUp();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });
});
