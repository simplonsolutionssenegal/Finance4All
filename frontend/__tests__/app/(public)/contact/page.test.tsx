import { render, screen } from '@testing-library/react';

import ContactPage from '@/app/(public)/contact/page';

describe('Contact Page', () => {
  it('renders the main contact sections', () => {
    render(<ContactPage />);

    expect(screen.getByText('Contactez-nous')).toBeInTheDocument();
    expect(screen.getByText('Envoyez-nous un message')).toBeInTheDocument();
    expect(screen.getByText(/Consultez d'abord notre centre d'aide/i)).toBeInTheDocument();
  });

  it('renders CTA button to help center', () => {
    render(<ContactPage />);

    expect(screen.getByRole('link', { name: /Accéder au centre d'aide/i })).toHaveAttribute(
      'href',
      '/help'
    );
  });
});
