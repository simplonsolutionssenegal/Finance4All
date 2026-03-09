import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NotFound from '@/app/not-found';

const backMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: backMock,
  }),
}));

describe('NotFound Page', () => {
  beforeEach(() => {
    backMock.mockClear();
  });

  it('should render with 404 content', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page introuvable')).toBeInTheDocument();
    expect(screen.getByText(/n'existe pas ou a été déplacée/i)).toBeInTheDocument();
  });

  it('should include links to home and support', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /Retour à l'accueil/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Contactez le support/i })).toHaveAttribute(
      'href',
      '/contact'
    );
  });

  it('should go back on previous page button click', async () => {
    const user = userEvent.setup();
    render(<NotFound />);
    await user.click(screen.getByRole('button', { name: /Page précédente/i }));
    expect(backMock).toHaveBeenCalledTimes(1);
  });
});
