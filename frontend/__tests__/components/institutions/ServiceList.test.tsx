// __tests__/components/ServiceList.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ⬇️ ajuste ce chemin vers ton composant
import ServiceList from '@/components/institutions/ServiceList';

// ⬇️ si ton modèle Service est exporté ailleurs, ajuste aussi ce chemin
import type { Service } from '@/models/service';
import type { RemboursementMode } from '@/types/RemboursementMode';
import type { ServiceType } from '@/types/ServiceType';

// (facultatif) mock minimal du Dialog shadcn/ui pour éviter la complexité des portails
jest.mock('@/components/ui/dialog', () => {
  const React = require('react');
  return {
    Dialog: ({ children }: any) => <div data-testid='mock-dialog'>{children}</div>,
    DialogTrigger: ({ children }: any) => <>{children}</>,
  };
});

// Fabrique typée qui renvoie un Service VALIDÉ par les unions litérales
function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: 1,
    designation: 'Épargne Plus',
    montantMin: 10000,
    montantMax: 2000000,
    type: 'EPARGNE' as ServiceType,
    modesRemboursement: 'USSD' as RemboursementMode,
    institutionId: 1,
    zoneId: 1,
    createdAt: '2025-09-24T13:43:27.932Z',
    updatedAt: '2025-09-24T13:43:27.932Z',
    ...overrides,
  };
}

describe('ServiceList', () => {
  test('affiche le loader quand isLoading=true', () => {
    const { container } = render(<ServiceList services={[]} isLoading={true} />);

    // Ton spinner n'a pas de rôle ARIA ; on le cible par sa classe Tailwind
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('affiche l’état vide quand aucune donnée et isLoading=false', () => {
    render(<ServiceList services={[]} isLoading={false} />);
    expect(screen.getByText(/Aucun service/i)).toBeInTheDocument();
    expect(screen.getByText(/Commencez par ajouter un nouveau service/i)).toBeInTheDocument();
  });

  it('rend une ligne avec formatage des montants (de-DE)', () => {
    const services: Service[] = [
      makeService({
        designation: 'Épargne Plus',
        montantMin: 10000,
        montantMax: 2000000,
      }),
    ];
    render(<ServiceList services={services} isLoading={false} />);

    // Désignation
    expect(screen.getByText('Épargne Plus')).toBeInTheDocument();

    // Format de-DE : 10.000 et 2.000.000
    expect(screen.getByText('10.000')).toBeInTheDocument();
    expect(screen.getByText('2.000.000')).toBeInTheDocument();
  });

  it('pagination: 5 éléments par page, navigation Suivant/Précédent et disabled corrects', async () => {
    const user = userEvent.setup();

    // 7 items => 2 pages (5 sur page 1, 2 sur page 2)
    const services: Service[] = Array.from({ length: 7 }).map((_, i) =>
      makeService({
        id: i + 1,
        designation: `Service ${i + 1}`,
        montantMin: 1000 + i,
        montantMax: 2000 + i,
      })
    );

    render(<ServiceList services={services} isLoading={false} />);

    // Page 1: Service 1..5 visibles
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Service ${i}`)).toBeInTheDocument();
    }
    // Service 6..7 doivent être absents en page 1
    expect(screen.queryByText('Service 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Service 7')).not.toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /Précédent/i });
    const nextBtn = screen.getByRole('button', { name: /Suivant/i });

    // Page 1: Précédent désactivé, Suivant activé
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Aller en page 2
    await user.click(nextBtn);

    // Page 2: Service 6..7 visibles
    expect(screen.getByText('Service 6')).toBeInTheDocument();
    expect(screen.getByText('Service 7')).toBeInTheDocument();
    // Service 1 plus visible
    expect(screen.queryByText('Service 1')).not.toBeInTheDocument();

    // Dernière page: Suivant désactivé
    expect(nextBtn).toBeDisabled();
    expect(prevBtn).not.toBeDisabled();

    // Retour page 1
    await user.click(prevBtn);
    expect(screen.getByText('Service 1')).toBeInTheDocument();
  });

  it('affiche les actions Voir / Modifier / Supprimer pour chaque ligne', () => {
    const services: Service[] = [
      makeService({ designation: 'Crédit Rapid', type: 'CREDIT' as ServiceType }),
    ];
    render(<ServiceList services={services} isLoading={false} />);

    // Boutons par aria-label (définis dans ton composant)
    expect(screen.getByLabelText(/Voir Crédit Rapid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Modifier Crédit Rapid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Supprimer Crédit Rapid/i)).toBeInTheDocument();
  });
});
