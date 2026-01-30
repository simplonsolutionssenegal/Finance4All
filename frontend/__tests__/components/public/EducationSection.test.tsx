import { render, screen } from '@testing-library/react';

import EducationSection from '@/components/public/EducationSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('EducationSection', () => {
  it('should render without crashing', () => {
    render(<EducationSection />);
    expect(screen.getByText('Formation gratuite')).toBeInTheDocument();
  });

  it('should display section title', () => {
    render(<EducationSection />);
    expect(screen.getByText(/Modules d'éducation/)).toBeInTheDocument();
    expect(screen.getByText('les plus populaires')).toBeInTheDocument();
  });

  it('should display module cards', () => {
    render(<EducationSection />);
    expect(screen.getByText('Mobile Money avancé')).toBeInTheDocument();
    expect(screen.getByText('Épargne et Budget')).toBeInTheDocument();
    expect(screen.getByText('Bases Finance Personnelle')).toBeInTheDocument();
  });

  it('should have proper section structure', () => {
    const { container } = render(<EducationSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-16', 'bg-white');
  });
});
