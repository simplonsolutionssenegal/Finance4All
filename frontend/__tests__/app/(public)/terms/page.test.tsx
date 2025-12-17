import { render, screen } from '@testing-library/react';

import Terms from '@/app/(public)/terms/page';

describe('Terms Page', () => {
  it('should render without crashing', () => {
    render(<Terms />);
    expect(screen.getByText("Conditions d'utilisation")).toBeInTheDocument();
  });

  it('should display all main sections', () => {
    render(<Terms />);
    expect(screen.getByText('1. Acceptation des conditions')).toBeInTheDocument();
    expect(screen.getByText('2. Description du service')).toBeInTheDocument();
    expect(screen.getByText('3. Compte utilisateur')).toBeInTheDocument();
    expect(screen.getByText('4. Utilisation de la plateforme')).toBeInTheDocument();
    expect(screen.getByText('5. Propriété intellectuelle')).toBeInTheDocument();
    expect(screen.getByText('6. Limitation de responsabilité')).toBeInTheDocument();
    expect(screen.getByText('7. Modification des conditions')).toBeInTheDocument();
    expect(screen.getByText('8. Résiliation')).toBeInTheDocument();
    expect(screen.getByText('9. Contact')).toBeInTheDocument();
  });

  it('should display contact email', () => {
    render(<Terms />);
    expect(screen.getByText('contact@finance4all.com')).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    render(<Terms />);
    expect(screen.getByText(/Dernière mise à jour/)).toBeInTheDocument();
  });

  it('should have proper structure with sections', () => {
    const { container } = render(<Terms />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(9);
  });
});
