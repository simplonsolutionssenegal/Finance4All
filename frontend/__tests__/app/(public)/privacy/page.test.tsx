import { render, screen } from '@testing-library/react';

import Privacy from '@/app/(public)/privacy/page';

describe('Privacy Page', () => {
  it('should render without crashing', () => {
    render(<Privacy />);
    expect(screen.getByText('Politique de confidentialité')).toBeInTheDocument();
  });

  it('should display all main sections', () => {
    render(<Privacy />);
    expect(screen.getByText('1. Collecte des informations')).toBeInTheDocument();
    expect(screen.getByText('2. Utilisation des informations')).toBeInTheDocument();
    expect(screen.getByText('3. Protection des données')).toBeInTheDocument();
    expect(screen.getByText('4. Partage des informations')).toBeInTheDocument();
    expect(screen.getByText('5. Vos droits')).toBeInTheDocument();
    expect(screen.getByText('6. Cookies')).toBeInTheDocument();
    expect(screen.getByText('7. Modifications')).toBeInTheDocument();
    expect(screen.getByText('8. Contact')).toBeInTheDocument();
  });

  it('should display contact email', () => {
    render(<Privacy />);
    expect(screen.getByText('privacy@finance4all.com')).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    render(<Privacy />);
    expect(screen.getByText(/Dernière mise à jour/)).toBeInTheDocument();
  });

  it('should have proper structure with sections', () => {
    const { container } = render(<Privacy />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(8);
  });
});
