import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Service, TypeService, TypeCalculation } from '@/types/Service';
import ServiceList from '@/components/admin/institutions/ServiceList';
import userEvent from '@testing-library/user-event';

// Augmenter le timeout des tests pour accommoder les animations
jest.setTimeout(10000);

// Mock des icônes lucide-react
jest.mock('lucide-react', () => ({
  EllipsisVertical: () => <div data-testid='ellipsis-icon' />,
  Eye: () => <div data-testid='eye-icon' />,
  Pencil: () => <div data-testid='pencil-icon' />,
  Trash2: () => <div data-testid='trash-icon' />,
}));

const mockServices: Service[] = [
  {
    id: '1',
    name: "Transfert d'argent",
    longName: "Service de transfert d'argent national",
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 1000,
    montantMax: 500000,
    frais: {
      montantFixe: 100,
      pourcentage: 2,
      minimum: 50,
      maximum: 5000,
    },
    typeFrais: TypeCalculation.POURCENTAGE,
    conditionAccess: ['kyc_verified'],
    plafonds: ['daily_limit'],
    infrastructureAccess: ['mobile', 'web'],
    institutionId: 'inst-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Paiement facture',
    longName: '',
    type: TypeService.PAIEMENT_FACTURES,
    montantMin: 0,
    montantMax: 0,
    frais: {
      montantFixe: 0,
      pourcentage: 0,
      minimum: 0,
      maximum: 0,
    },
    typeFrais: TypeCalculation.FREE,
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: ['mobile'],
    institutionId: 'inst-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Retrait',
    longName: "Retrait d'espèces aux guichets",
    type: TypeService.RETRAIT_SIMPLE,
    montantMin: 5000,
    montantMax: undefined,
    frais: {
      pourcentage: 1.5,
    },
    typeFrais: TypeCalculation.POURCENTAGE,
    conditionAccess: ['kyc_verified'],
    plafonds: ['monthly_limit'],
    infrastructureAccess: ['atm', 'agency'],
    institutionId: 'inst-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('ServiceList', () => {
  describe('Rendu de base', () => {
    it("affiche un message quand il n'y a pas de services", () => {
      render(<ServiceList services={[]} />);
      expect(screen.getByText('Aucun service pour le moment.')).toBeInTheDocument();
    });

    it('affiche la liste des services', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText("Transfert d'argent")).toBeInTheDocument();
      expect(screen.getByText('Paiement facture')).toBeInTheDocument();
      expect(screen.getByText('Retrait')).toBeInTheDocument();
    });

    it('affiche les en-têtes de colonnes', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Montants')).toBeInTheDocument();
      expect(screen.getByText('Frais')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('affiche le longName quand il existe', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText("Service de transfert d'argent national")).toBeInTheDocument();
      expect(screen.getByText("Retrait d'espèces aux guichets")).toBeInTheDocument();
    });

    it('affiche le type du service dans un badge', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText(TypeService.TRANSFERT_ARGENT)).toBeInTheDocument();
      expect(screen.getByText(TypeService.PAIEMENT_FACTURES)).toBeInTheDocument();
      expect(screen.getByText(TypeService.RETRAIT_SIMPLE)).toBeInTheDocument();
    });
  });

  describe('Formatage des montants', () => {
    it('affiche la plage de montants complète', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText('1 000 - 500 000 FCFA')).toBeInTheDocument();
    });

    it('affiche "_" quand min et max sont à 0', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText('_')).toBeInTheDocument();
    });

    it('affiche "≥" quand seul le minimum est défini', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText('≥ 5 000 FCFA')).toBeInTheDocument();
    });

    it('affiche "≤" quand seul le maximum est défini', () => {
      const serviceWithMaxOnly: Service[] = [
        {
          id: '4',
          name: 'Test',
          longName: '',
          type: TypeService.AUTRES,
          montantMin: undefined,
          montantMax: 10000,
          frais: {},
          typeFrais: TypeCalculation.FREE,
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      render(<ServiceList services={serviceWithMaxOnly} />);
      expect(screen.getByText('≤ 10 000 FCFA')).toBeInTheDocument();
    });

    it('affiche "—" quand aucun montant n\'est défini', () => {
      const serviceWithoutAmounts: Service[] = [
        {
          id: '5',
          name: 'Test',
          longName: '',
          type: TypeService.AUTRES,
          montantMin: undefined,
          montantMax: undefined,
          frais: {},
          typeFrais: TypeCalculation.FREE,
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      render(<ServiceList services={serviceWithoutAmounts} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('Formatage des frais', () => {
    it('affiche tous les types de frais', () => {
      render(<ServiceList services={mockServices} />);
      expect(
        screen.getByText('100 FCFA fixe, 2%, min: 50 FCFA, max: 5000 FCFA')
      ).toBeInTheDocument();
    });

    it('affiche "Aucun frais" quand il n\'y a pas de frais', () => {
      const serviceWithoutFees: Service[] = [
        {
          id: '6',
          name: 'Gratuit',
          longName: '',
          type: TypeService.AUTRES,
          montantMin: undefined,
          montantMax: undefined,
          frais: {},
          typeFrais: TypeCalculation.FREE,
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      render(<ServiceList services={serviceWithoutFees} />);
      expect(screen.getByText('Aucun frais')).toBeInTheDocument();
    });

    it('affiche uniquement le pourcentage quand défini seul', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText('1.5%')).toBeInTheDocument();
    });

    it('affiche uniquement le montant fixe quand défini seul', () => {
      const serviceWithFixedFee: Service[] = [
        {
          id: '7',
          name: 'Fixe',
          longName: '',
          type: TypeService.AUTRES,
          montantMin: undefined,
          montantMax: undefined,
          frais: {
            montantFixe: 500,
          },
          typeFrais: TypeCalculation.FIX,
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      render(<ServiceList services={serviceWithFixedFee} />);
      expect(screen.getByText('500 FCFA fixe')).toBeInTheDocument();
    });
  });

  describe('Actions du menu dropdown', () => {
    it('appelle onView quand "Voir les détails" est cliqué', async () => {
      const user = userEvent.setup();
      const onView = jest.fn();
      render(<ServiceList services={mockServices} onView={onView} />);

      const actionButtons = screen.getAllByRole('button');
      await user.click(actionButtons[0]);

      const viewButton = await screen.findByText('Voir les détails', {}, { timeout: 3000 });
      await user.click(viewButton);

      await waitFor(() => {
        expect(onView).toHaveBeenCalledWith(mockServices[0]);
        expect(onView).toHaveBeenCalledTimes(1);
      });
    });

    it('appelle onEdit quand "Modifier" est cliqué', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      render(<ServiceList services={mockServices} onEdit={onEdit} />);

      const actionButtons = screen.getAllByRole('button');
      await user.click(actionButtons[0]);

      const editButton = await screen.findByText('Modifier', {}, { timeout: 3000 });
      await user.click(editButton);

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(mockServices[0]);
        expect(onEdit).toHaveBeenCalledTimes(1);
      });
    });

    it('appelle onDelete quand "Supprimer" est cliqué', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      render(<ServiceList services={mockServices} onDelete={onDelete} />);

      const actionButtons = screen.getAllByRole('button');
      await user.click(actionButtons[0]);

      const deleteButton = await screen.findByText('Supprimer', {}, { timeout: 3000 });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockServices[0]);
        expect(onDelete).toHaveBeenCalledTimes(1);
      });
    });

    it("n'affiche pas les actions quand les callbacks ne sont pas fournis", async () => {
      const user = userEvent.setup();
      render(<ServiceList services={mockServices} />);

      const actionButtons = screen.getAllByRole('button');
      await user.click(actionButtons[0]);

      await waitFor(
        () => {
          expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument();
          expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
          expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('gère plusieurs services avec des actions différentes', async () => {
      const user = userEvent.setup();
      const onView = jest.fn();
      const onEdit = jest.fn();
      const onDelete = jest.fn();

      render(
        <ServiceList services={mockServices} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      );

      const actionButtons = screen.getAllByRole('button');
      await user.click(actionButtons[1]);

      const editButton = await screen.findByText('Modifier', {}, { timeout: 3000 });
      await user.click(editButton);

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(mockServices[1]);
      });
    });
  });

  describe('Gestion des cas limites', () => {
    it('gère les services avec des valeurs undefined', () => {
      const serviceWithUndefined: Service[] = [
        {
          id: '8',
          name: 'Test',
          longName: '',
          type: TypeService.AUTRES,
          montantMin: undefined,
          montantMax: undefined,
          frais: {
            montantFixe: undefined,
            pourcentage: undefined,
          },
          typeFrais: TypeCalculation.FREE,
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      expect(() => render(<ServiceList services={serviceWithUndefined} />)).not.toThrow();
    });

    it('gère les erreurs de formatage de nombres', () => {
      const serviceWithInvalidNumber: Service[] = [
        {
          id: '9',
          name: 'Test',
          longName: '',
          type: TypeService.AUTRES,
          montantMin: 0,
          montantMax: 1000,
          frais: {},
          typeFrais: TypeCalculation.FREE,
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      expect(() => render(<ServiceList services={serviceWithInvalidNumber} />)).not.toThrow();
    });

    it('gère un longName vide', () => {
      render(<ServiceList services={mockServices} />);
      const cells = screen.getAllByRole('cell');
      const serviceCells = cells.filter(cell => cell.textContent?.includes('Paiement facture'));
      expect(serviceCells.length).toBeGreaterThan(0);
    });

    it('gère une liste vide de services', () => {
      const { container } = render(<ServiceList services={[]} />);
      expect(container.querySelector('table')).not.toBeInTheDocument();
      expect(screen.getByText('Aucun service pour le moment.')).toBeInTheDocument();
    });

    it('gère null comme liste de services', () => {
      const { container } = render(<ServiceList services={null as any} />);
      expect(container.querySelector('table')).not.toBeInTheDocument();
      expect(screen.getByText('Aucun service pour le moment.')).toBeInTheDocument();
    });
  });

  describe('Types de services', () => {
    it('affiche correctement tous les types de services', () => {
      const servicesWithAllTypes: Service[] = [];

      for (const type of Object.values(TypeService)) {
        servicesWithAllTypes.push({
          id: `service-${type}`,
          name: `Service ${type}`,
          longName: '',
          type: type as TypeService,
          montantMin: undefined,
          montantMax: undefined,
          frais: {},
          typeFrais: TypeCalculation.FREE,
          conditionAccess: [],
          plafonds: [],
          infrastructureAccess: [],
          institutionId: 'inst-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        });
      }

      render(<ServiceList services={servicesWithAllTypes} />);

      for (const type of Object.values(TypeService)) {
        expect(screen.getByText(type)).toBeInTheDocument();
      }
    });
  });
});
