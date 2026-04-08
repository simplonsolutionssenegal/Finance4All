import { render, screen } from '@testing-library/react';

import PartnersSection from '@/components/public/PartnersSection';

describe('PartnersSection', () => {
  it('renders section heading and badge', () => {
    render(<PartnersSection />);

    expect(screen.getByText('Partenaires de confiance')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Ils font confiance a/i })).toBeInTheDocument();
  });

  it('renders duplicated partner labels for infinite loop track', () => {
    render(<PartnersSection />);

    expect(screen.getAllByText('Logoipsum').length).toBeGreaterThanOrEqual(10);
  });

  it('renders partners section anchor id', () => {
    const { container } = render(<PartnersSection />);
    const section = container.querySelector('#partners');
    expect(section).toBeInTheDocument();
  });
});
