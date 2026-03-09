import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContactCards from '@/components/public/contact/contact-cards';
import HelpFaq from '@/components/public/help/help-faq';
import HelpHero from '@/components/public/help/help-hero';

describe('Help sections', () => {
  it('renders hero with search input', async () => {
    const user = userEvent.setup();
    const onQueryChange = jest.fn();

    render(<HelpHero query='' onQueryChange={onQueryChange} />);
    expect(screen.getByText(/Centre d/i)).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: /rechercher dans l'aide/i });
    await user.type(input, 'module');
    expect(onQueryChange).toHaveBeenCalled();
  });

  it('renders contact cards content', () => {
    render(<ContactCards mode='help' />);
    expect(screen.getByText('Chat en direct')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Téléphone Sénégal')).toBeInTheDocument();
    expect(screen.getByText('Téléphone Cameroun')).toBeInTheDocument();
  });

  it('renders faq categories and can filter results', () => {
    const { rerender } = render(<HelpFaq query='' />);
    expect(screen.getByText('Modules et Apprentissage')).toBeInTheDocument();
    expect(screen.getByText('Pour les Organisations')).toBeInTheDocument();

    rerender(<HelpFaq query='mot inexistant xyz' />);
    expect(screen.getByText('Aucun résultat')).toBeInTheDocument();
  });

  it('shows privacy link for security faq answers', async () => {
    const user = userEvent.setup();
    render(<HelpFaq query='sécurité' />);
    await user.click(screen.getByText('Mes données personnelles sont-elles sécurisées ?'));
    expect(screen.getByRole('link', { name: /confidentialité/i })).toHaveAttribute(
      'href',
      '/privacy'
    );
  });
});
