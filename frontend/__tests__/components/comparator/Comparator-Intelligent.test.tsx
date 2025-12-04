import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceList } from '@/components/comparator/ServiceList';
import type { ServiceDTO } from '@/types/Service';
import { TypeService } from '@/types/Service';

// Données de test
const mockServices: ServiceDTO[] = [
  {
    id: '1',
    name: 'Wave Transfer',
    longName: 'Wave Money Transfer Service',
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 100,
    montantMax: 1000000,
    frais: {
      _typeCalculation: 1,
      pourcentage: 0.01,
      minimum: 50,
      maximum: 5000,
    },
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institution: {
      id: 'inst1',
      name: 'Wave',
      logoUrl: 'https://example.com/wave.png',
    },
  },
  {
    id: '2',
    name: 'Orange Money Transfer',
    longName: 'Orange Money Transfer Service',
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 50,
    montantMax: 500000,
    frais: {
      _typeCalculation: 2,
      montantFixe: 100,
      pourcentage: 0,
    },
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institution: {
      id: 'inst2',
      name: 'Orange Money',
      logoUrl: 'https://example.com/orange.png',
    },
  },
  {
    id: '3',
    name: 'Free Money',
    longName: 'Free Money Service',
    type: TypeService.TRANSFERT_ARGENT,
    montantMin: 0,
    montantMax: 100000,
    frais: {
      _typeCalculation: 0,
    },
    conditionAccess: [],
    plafonds: [],
    infrastructureAccess: [],
    institution: {
      id: 'inst3',
      name: 'Free Bank',
      logoUrl: 'https://example.com/freebank.png',
    },
  },
];

// Mock de la fonction computeFee
const mockComputeFee = jest.fn((service: ServiceDTO, amount: number) => {
  if (service.frais._typeCalculation === 0) {
    return { label: 'Gratuit !', value: 0 };
  }
  if (service.frais._typeCalculation === 1) {
    const fee = amount * (service.frais.pourcentage || 0);
    const finalFee = Math.max(fee, service.frais.minimum || 0);
    return {
      label: `${(service.frais.pourcentage || 0) * 100}% (min ${service.frais.minimum} F)`,
      value: finalFee,
    };
  }
  if (service.frais._typeCalculation === 2) {
    return { label: 'Frais fixe', value: service.frais.montantFixe || 0 };
  }
  return { label: 'Non défini', value: 0 };
});

const mockOnToggleService = jest.fn();

const defaultProps = {
  services: mockServices,
  selectedIds: [],
  amount: 10000,
  isLoading: false,
  isError: false,
  error: null,
  onToggleService: mockOnToggleService,
  computeFee: mockComputeFee,
};

describe('ServiceList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("États de chargement et d'erreur", () => {
    it('affiche un message de chargement', () => {
      render(<ServiceList {...defaultProps} isLoading={true} services={[]} />);

      expect(screen.getByText('Chargement des services...')).toBeInTheDocument();
    });

    it("affiche un message d'erreur avec le message par défaut", () => {
      render(<ServiceList {...defaultProps} isError={true} error={null} services={[]} />);

      expect(screen.getByText('Impossible de charger les services.')).toBeInTheDocument();
    });

    it("affiche un message d'erreur personnalisé", () => {
      const error = new Error('Erreur réseau');
      render(<ServiceList {...defaultProps} isError={true} error={error} services={[]} />);

      expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
    });

    it("affiche un message quand aucun service n'est disponible", () => {
      render(<ServiceList {...defaultProps} services={[]} />);

      expect(screen.getByText('Aucun service disponible')).toBeInTheDocument();
      expect(screen.getByText(/Aucun service n'est disponible pour le moment/)).toBeInTheDocument();
    });
  });

  describe('Affichage de la liste des services', () => {
    it('affiche tous les services', () => {
      render(<ServiceList {...defaultProps} />);

      expect(screen.getByText('Wave Transfer')).toBeInTheDocument();
      expect(screen.getByText('Orange Money Transfer')).toBeInTheDocument();
      expect(screen.getByText('Free Money')).toBeInTheDocument();
    });

    it('affiche les logos des services', () => {
      render(<ServiceList {...defaultProps} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3);

      const first = images[0] as HTMLImageElement;

      // On vérifie qu'on a bien l'alt correct
      expect(first).toHaveAttribute('alt', 'Wave');

      // Et que l'URL d'origine est bien encodée dans le src généré par Next/Image
      expect(first.getAttribute('src')).toContain(
        encodeURIComponent('https://example.com/wave.png')
      );
    });

    it('affiche les types de services', () => {
      render(<ServiceList {...defaultProps} />);

      const typeElements = screen.getAllByText(TypeService.TRANSFERT_ARGENT);
      expect(typeElements.length).toBeGreaterThan(0);
    });

    it('affiche les notes (ratings) pour chaque service', () => {
      render(<ServiceList {...defaultProps} />);

      const ratings = screen.getAllByText('4.6');
      expect(ratings).toHaveLength(3);
    });

    it('affiche le badge "Instantané" pour chaque service', () => {
      render(<ServiceList {...defaultProps} />);

      const instantBadges = screen.getAllByText('Instantané');
      expect(instantBadges).toHaveLength(3);
    });
  });

  describe('Calcul et affichage des frais', () => {
    it('appelle computeFee pour chaque service', () => {
      render(<ServiceList {...defaultProps} />);

      expect(mockComputeFee).toHaveBeenCalledTimes(3);
      expect(mockComputeFee).toHaveBeenCalledWith(mockServices[0], 10000);
      expect(mockComputeFee).toHaveBeenCalledWith(mockServices[1], 10000);
      expect(mockComputeFee).toHaveBeenCalledWith(mockServices[2], 10000);
    });

    it('affiche les frais calculés pour chaque service', () => {
      render(<ServiceList {...defaultProps} />);

      expect(screen.getByText('Gratuit !')).toBeInTheDocument();
      expect(screen.getAllByText('Frais de service')).toHaveLength(3);
    });

    it('formate correctement les montants en devise', () => {
      render(<ServiceList {...defaultProps} />);

      // Vérifie que les montants sont affichés avec la devise F CFA
      const currencies = screen.getAllByText('F CFA');
      expect(currencies.length).toBeGreaterThan(0);
    });

    it('affiche "0 F CFA" pour un service gratuit', () => {
      render(<ServiceList {...defaultProps} />);

      // Le montant "0" et la devise "F CFA" sont dans des spans séparés
      expect(screen.getByText('0')).toBeInTheDocument();
      const currencies = screen.getAllByText('F CFA');
      expect(currencies.length).toBeGreaterThan(0);
    });
  });

  describe('Sélection de services', () => {
    it('affiche les checkboxes', () => {
      render(<ServiceList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('applique les styles appropriés aux services non sélectionnés', () => {
      const { container } = render(<ServiceList {...defaultProps} />);

      const articles = container.querySelectorAll('article');
      articles.forEach(article => {
        expect(article).toHaveClass('border-tertiary-200');
        expect(article).not.toHaveClass('border-primary-200');
        expect(article).not.toHaveClass('bg-primary-50');
      });
    });

    it('applique les styles appropriés aux services sélectionnés', () => {
      const { container } = render(<ServiceList {...defaultProps} selectedIds={['1', '2']} />);

      const articles = container.querySelectorAll('article');
      expect(articles[0]).toHaveClass('border-primary-200', 'bg-primary-50');
      expect(articles[1]).toHaveClass('border-primary-200', 'bg-primary-50');
      expect(articles[2]).toHaveClass('border-tertiary-200');
    });

    it('coche les checkboxes des services sélectionnés', () => {
      render(<ServiceList {...defaultProps} selectedIds={['1', '3']} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });
  });

  describe('Interactions utilisateur', () => {
    it('appelle onToggleService quand on clique sur une carte', () => {
      render(<ServiceList {...defaultProps} />);

      const waveCard = screen.getByText('Wave Transfer').closest('article');
      fireEvent.click(waveCard!);

      expect(mockOnToggleService).toHaveBeenCalledWith('1');
      expect(mockOnToggleService).toHaveBeenCalledTimes(1);
    });

    it('appelle onToggleService quand on clique sur une checkbox', async () => {
      const user = userEvent.setup();
      render(<ServiceList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(mockOnToggleService).toHaveBeenCalledWith('1');
    });

    it('permet de sélectionner plusieurs services', async () => {
      const user = userEvent.setup();
      render(<ServiceList {...defaultProps} />);

      const cards = screen.getAllByRole('article');

      await user.click(cards[0]);
      expect(mockOnToggleService).toHaveBeenCalledWith('1');

      await user.click(cards[1]);
      expect(mockOnToggleService).toHaveBeenCalledWith('2');

      expect(mockOnToggleService).toHaveBeenCalledTimes(2);
    });

    it("empêche la propagation de l'événement sur la checkbox", () => {
      render(<ServiceList {...defaultProps} />);

      const checkboxContainers = screen.getAllByRole('checkbox').map(cb => cb.closest('div'));

      // Vérifie que le conteneur de la checkbox a un stopPropagation
      checkboxContainers.forEach(container => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Responsive et mise en page', () => {
    it('applique les classes de grille responsive', () => {
      const { container } = render(<ServiceList {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4', 'md:grid-cols-3');
    });

    it('affiche les services sous forme de cartes', () => {
      render(<ServiceList {...defaultProps} />);

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(3);

      articles.forEach(article => {
        expect(article).toHaveClass('rounded-xl', 'border', 'p-4');
      });
    });
  });

  describe('Accessibilité', () => {
    it('utilise des balises sémantiques appropriées', () => {
      render(<ServiceList {...defaultProps} />);

      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(3);
    });

    it('les images ont des attributs alt appropriés', () => {
      render(<ServiceList {...defaultProps} />);

      expect(screen.getByAltText('Wave')).toBeInTheDocument();
      expect(screen.getByAltText('Orange Money')).toBeInTheDocument();
      expect(screen.getByAltText('Free Bank')).toBeInTheDocument();
    });

    it('les checkboxes sont accessibles', () => {
      render(<ServiceList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeInTheDocument();
      });
    });

    it('les cartes ont un curseur pointer', () => {
      const { container } = render(<ServiceList {...defaultProps} />);

      const articles = container.querySelectorAll('article');
      articles.forEach(article => {
        expect(article).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Cas limites', () => {
    it('gère un tableau vide de services sélectionnés', () => {
      render(<ServiceList {...defaultProps} selectedIds={[]} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('gère un montant à 0', () => {
      render(<ServiceList {...defaultProps} amount={0} />);

      expect(mockComputeFee).toHaveBeenCalledWith(mockServices[0], 0);
    });

    it('gère un service avec des données minimales', () => {
      const minimalService: ServiceDTO = {
        id: '4',
        name: 'Minimal Service',
        longName: 'Minimal Service',
        type: TypeService.TRANSFERT_ARGENT,
        montantMin: 0,
        montantMax: 100000,
        frais: {
          _typeCalculation: 0,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
        institution: {
          id: 'inst4',
          name: 'Minimal Bank',
          logoUrl: 'https://example.com/minimal.png',
        },
      };

      render(<ServiceList {...defaultProps} services={[minimalService]} />);

      expect(screen.getByText('Minimal Service')).toBeInTheDocument();
    });

    it('gère une sélection avec des IDs inexistants', () => {
      render(<ServiceList {...defaultProps} selectedIds={['1', 'nonexistent', '3']} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });
  });

  describe('Formatage de devise', () => {
    it('formate correctement les nombres entiers', () => {
      mockComputeFee.mockReturnValue({ label: 'Test', value: 1000 });
      render(<ServiceList {...defaultProps} services={[mockServices[0]]} />);

      // Le montant et la devise sont maintenant dans des spans séparés
      expect(screen.getByText('1 000')).toBeInTheDocument();
      expect(screen.getByText('F CFA')).toBeInTheDocument();
    });

    it('arrondit les valeurs décimales', () => {
      mockComputeFee.mockReturnValue({ label: 'Test', value: 1234.56 });
      render(<ServiceList {...defaultProps} services={[mockServices[0]]} />);

      expect(screen.getByText('1 235')).toBeInTheDocument();
      expect(screen.getByText('F CFA')).toBeInTheDocument();
    });

    it('utilise le séparateur de milliers français', () => {
      mockComputeFee.mockReturnValue({ label: 'Test', value: 100000 });
      render(<ServiceList {...defaultProps} services={[mockServices[0]]} />);

      expect(screen.getByText('100 000')).toBeInTheDocument();
      expect(screen.getByText('F CFA')).toBeInTheDocument();
    });
  });
});
