import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Service, TypeService } from '@/types/Service';
import ServiceItem from '@/components/admin/institutions/ServiceItem';

// Mock de next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock des composants shadcn/ui
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid='menu-item'>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children, className }: any) => <tr className={className}>{children}</tr>,
  TableHead: ({ children, className }: any) => <th className={className}>{children}</th>,
  TableCell: ({ children, className }: any) => <td className={className}>{children}</td>,
}));

describe('ServiceItem', () => {
  const institutionId = 'inst-1';

  const mockServices: Service[] = [
    {
      id: '1',
      name: 'Service de paiement',
      longName: 'Service de paiement marchand complet',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 1000,
      montantMax: 50000,
      frais: {
        montantFixe: 100,
        pourcentage: 0.02,
        minimum: 50,
        maximum: 500,
      },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
      institutionId: 'inst-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Transfert',
      longName: "Transfert d'argent national",
      type: TypeService.TRANSFERT_ARGENT,
      montantMin: 500,
      montantMax: 100000,
      frais: {
        pourcentage: 0.015,
      },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
      institutionId: 'inst-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu du composant', () => {
    it("affiche un message quand il n'y a pas de services", () => {
      render(<ServiceItem institutionId={institutionId} services={[]} />);
      expect(screen.getByText('Aucun service pour le moment.')).toBeInTheDocument();
    });

    it('affiche la liste des services', () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.getByText('Service de paiement')).toBeInTheDocument();
      expect(screen.getByText('Transfert')).toBeInTheDocument();
    });

    it('affiche les en-têtes du tableau', () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Montants')).toBeInTheDocument();
      expect(screen.getByText('Frais')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('affiche le nom long du service', () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.getByText('Service de paiement marchand complet')).toBeInTheDocument();
    });

    it('affiche le type de service', () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.getByText(TypeService.PAIEMENT_MARCHAND)).toBeInTheDocument();
      expect(screen.getByText(TypeService.TRANSFERT_ARGENT)).toBeInTheDocument();
    });
  });

  describe('Formatage des montants', () => {
    it('affiche la plage de montants avec min et max', () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.getByText(/1 000 - 50 000 FCFA/)).toBeInTheDocument();
    });

    it('affiche "_" quand min et max sont à 0', () => {
      const serviceWithZero: Service[] = [
        {
          ...mockServices[0],
          id: '3',
          montantMin: 0,
          montantMax: 0,
        },
      ];

      render(<ServiceItem institutionId={institutionId} services={serviceWithZero} />);
      expect(screen.getByText('_')).toBeInTheDocument();
    });

    it('affiche "≥" quand seul le minimum est défini', () => {
      const serviceWithMin: Service[] = [
        {
          ...mockServices[0],
          id: '4',
          montantMin: 1000,
          montantMax: undefined,
        },
      ];

      render(<ServiceItem institutionId={institutionId} services={serviceWithMin} />);
      expect(screen.getByText(/≥ 1 000 FCFA/)).toBeInTheDocument();
    });

    it('affiche "≤" quand seul le maximum est défini', () => {
      const serviceWithMax: Service[] = [
        {
          ...mockServices[0],
          id: '5',
          montantMin: undefined,
          montantMax: 50000,
        },
      ];

      render(<ServiceItem institutionId={institutionId} services={serviceWithMax} />);
      expect(screen.getByText(/≤ 50 000 FCFA/)).toBeInTheDocument();
    });

    it('affiche "—" quand aucun montant n\'est défini', () => {
      const serviceWithoutAmounts: Service[] = [
        {
          ...mockServices[0],
          id: '6',
          montantMin: undefined,
          montantMax: undefined,
        },
      ];

      render(<ServiceItem institutionId={institutionId} services={serviceWithoutAmounts} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('Formatage des frais', () => {
    it('affiche tous les types de frais', () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(
        screen.getByText(/100 FCFA fixe, 2%, min: 50 FCFA, max: 500 FCFA/)
      ).toBeInTheDocument();
    });

    it('affiche uniquement le pourcentage quand défini seul', () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.getByText(/1\.5%/)).toBeInTheDocument();
    });

    it('affiche "Aucun frais" quand aucun frais n\'est défini', () => {
      const serviceWithoutFees: Service[] = [
        {
          ...mockServices[0],
          id: '7',
          frais: {},
        },
      ];

      render(<ServiceItem institutionId={institutionId} services={serviceWithoutFees} />);
      expect(screen.getByText('Aucun frais')).toBeInTheDocument();
    });
  });

  describe('Actions du menu', () => {
    it('appelle onView quand on clique sur "Voir les détails"', () => {
      render(
        <ServiceItem institutionId={institutionId} services={mockServices} onView={mockOnView} />
      );

      const viewButtons = screen.getAllByText('Voir les détails');
      fireEvent.click(viewButtons[0]);

      expect(mockOnView).toHaveBeenCalledTimes(1);
      expect(mockOnView).toHaveBeenCalledWith(mockServices[0]);
    });

    it('génère le bon lien pour "Modifier"', () => {
      render(
        <ServiceItem institutionId={institutionId} services={mockServices} onEdit={mockOnEdit} />
      );

      const modifierLinks = screen.getAllByText('Modifier');
      expect(modifierLinks[0].closest('a')).toHaveAttribute(
        'href',
        `/institutions/${institutionId}/service/${mockServices[0].id}/update`
      );
    });

    it('appelle onDelete quand on clique sur "Supprimer"', () => {
      render(
        <ServiceItem
          institutionId={institutionId}
          services={mockServices}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByText('Supprimer');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockServices[0]);
    });

    it("n'affiche pas le bouton 'Voir les détails' si onView n'est pas fourni", () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument();
    });

    it("affiche toujours le bouton 'Modifier'", () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.getAllByText('Modifier')).toHaveLength(mockServices.length);
    });

    it("n'affiche pas le bouton 'Supprimer' si onDelete n'est pas fourni", () => {
      render(<ServiceItem institutionId={institutionId} services={mockServices} />);

      expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
    });

    it('affiche toutes les actions quand tous les callbacks sont fournis', () => {
      render(
        <ServiceItem
          institutionId={institutionId}
          services={mockServices}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('Voir les détails')).toHaveLength(mockServices.length);
      expect(screen.getAllByText('Modifier')).toHaveLength(mockServices.length);
      expect(screen.getAllByText('Supprimer')).toHaveLength(mockServices.length);
    });
  });

  describe('Gestion des cas limites', () => {
    it('gère un tableau de services vide', () => {
      const { container } = render(<ServiceItem institutionId={institutionId} services={[]} />);
      expect(container.querySelector('table')).not.toBeInTheDocument();
    });

    it('gère les services avec des valeurs nulles', () => {
      const serviceWithNulls: Service[] = [
        {
          ...mockServices[0],
          id: '8',
          longName: '',
          montantMin: null as any,
          montantMax: null as any,
        },
      ];

      const { container } = render(
        <ServiceItem institutionId={institutionId} services={serviceWithNulls} />
      );
      expect(container).toBeInTheDocument();
    });

    it('formate correctement les grands nombres', () => {
      const serviceWithLargeAmounts: Service[] = [
        {
          ...mockServices[0],
          id: '9',
          montantMin: 1000000,
          montantMax: 10000000,
        },
      ];

      render(<ServiceItem institutionId={institutionId} services={serviceWithLargeAmounts} />);
      expect(screen.getByText(/1 000 000 - 10 000 000 FCFA/)).toBeInTheDocument();
    });
  });
});
