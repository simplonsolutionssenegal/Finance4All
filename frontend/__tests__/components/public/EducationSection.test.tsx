import { render, screen } from '@testing-library/react';

import EducationSection from '@/components/public/EducationSection';

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

  it('should display module cards with correct titles', () => {
    render(<EducationSection />);
    expect(screen.getByText('Mobile Money avancé')).toBeInTheDocument();
    expect(screen.getByText('Épargne et Budget')).toBeInTheDocument();
    expect(screen.getByText('Bases Finance Personnelle')).toBeInTheDocument();
  });

  it('should render "Voir tous les modules" link', () => {
    render(<EducationSection />);
    const link = screen.getByRole('link', { name: /Voir tous les modules/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/modules-formation');
  });

  it('should have proper section structure', () => {
    const { container } = render(<EducationSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-16', 'md:py-24', 'px-4', 'bg-white');
  });
});
