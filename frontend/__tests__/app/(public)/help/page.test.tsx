import { render, screen } from '@testing-library/react';

import HelpPage from '@/app/(public)/help/page';

describe('Help Page', () => {
  it('should render without crashing', () => {
    render(<HelpPage />);
    expect(screen.getByText(/Centre d'aide/i)).toBeInTheDocument();
  });

  it('should display help main sections', () => {
    render(<HelpPage />);
    expect(screen.getByText('Questions fréquentes')).toBeInTheDocument();
    expect(screen.getByText('Chat en direct')).toBeInTheDocument();
    expect(screen.getByText(/Vous ne trouvez pas de réponse/i)).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<HelpPage />);
    expect(screen.getByRole('textbox', { name: /rechercher dans l'aide/i })).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    const { container } = render(<HelpPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('DIV');
  });
});
