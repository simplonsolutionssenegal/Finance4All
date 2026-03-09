import { render, screen } from '@testing-library/react';

import AboutPage from '@/app/(public)/about/page';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('About Page', () => {
  it('should render without crashing', () => {
    render(<AboutPage />);
    expect(screen.getByText(/Finance pour tous/i)).toBeInTheDocument();
  });

  it('should display all main sections', () => {
    render(<AboutPage />);
    expect(screen.getByText('Nos missions')).toBeInTheDocument();
    expect(screen.getByText('Nos Valeurs')).toBeInTheDocument();
    expect(screen.getByText('Notre Parcours')).toBeInTheDocument();
    expect(screen.getByText(/Prêt à commencer votre parcours financier/i)).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    const { container } = render(<AboutPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('DIV');
  });

  it('should be a function that returns JSX', () => {
    expect(typeof AboutPage).toBe('function');
    const result = AboutPage();
    expect(result).toBeDefined();
    expect(result.type).toBe('div');
  });
});
