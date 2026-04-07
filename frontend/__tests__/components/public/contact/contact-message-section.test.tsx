import { render, screen } from '@testing-library/react';

import ContactMessageSection from '@/components/public/contact/contact-message-section';

jest.mock('@/components/public/contact/contact-form', () => ({
  __esModule: true,
  default: () => <div data-testid='contact-form'>Contact form</div>,
}));

describe('ContactMessageSection', () => {
  it('renders support highlights and organization block', () => {
    render(<ContactMessageSection />);

    expect(screen.getByText('Envoyez-nous un message')).toBeInTheDocument();
    expect(screen.getByText('Réponse rapide')).toBeInTheDocument();
    expect(screen.getByText('Support multilingue')).toBeInTheDocument();
    expect(screen.getByText('Suivi personnalisé')).toBeInTheDocument();
    expect(screen.getByText('Vous êtes une organisation ?')).toBeInTheDocument();
  });

  it('renders contact form component', () => {
    render(<ContactMessageSection />);
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });
});
