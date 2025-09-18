import { render, screen } from '@testing-library/react';
import Footer from '@/components/public/layout/footer';

describe.skip('Footer', () => {
  it('should render the footer', () => {
    render(<Footer />);
    // Vérifie qu'un élément footer est présent
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
