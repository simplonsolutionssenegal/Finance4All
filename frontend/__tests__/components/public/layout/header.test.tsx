import { render, screen } from '@testing-library/react';
import Header from '@/components/public/layout/header';

describe.skip('Header', () => {
  it('should render the header', () => {
    render(<Header />);
    // Vérifie qu'un élément header est présent
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
