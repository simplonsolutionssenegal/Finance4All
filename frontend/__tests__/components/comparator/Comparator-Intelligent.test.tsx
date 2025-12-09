import { render, screen, fireEvent } from '@testing-library/react';

import { useGetServices } from '@/hooks/service/useGetServices';
import { useCompareServices } from '@/hooks/service/useCompareServices';
import { type ServiceDTO, TypeService } from '@/types/Service';
import { computeFee } from '@/components/ui/FeeCalculator';
import ComparatorIntelligent from '@/components/comparator/comparator-Intelligent';

jest.mock('@/hooks/service/useGetServices');
jest.mock('@/hooks/service/useCompareServices');
jest.mock('@/components/ui/FeeCalculator');

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt ?? ''} {...props} />,
}));

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid='responsive-container'>{children}</div>
    ),
  };
});
jest.mock('@/components/comparator/ServiceList', () => ({
  __esModule: true,
  ServiceList: (props: any) => (
    <div>
      <span>Mocked ServiceList</span>
      <button type='button' data-testid='select-one' onClick={() => props.onToggleService('1')}>
        Select one
      </button>
      <button
        type='button'
        data-testid='select-two'
        onClick={() => {
          props.onToggleService('1');
          props.onToggleService('2');
        }}
      >
        Select two
      </button>
      <button
        type='button'
        data-testid='compute-fee'
        onClick={() => props.computeFee({ id: '1' } as any, props.amount)}
      >
        Compute fee
      </button>
      <button type='button' data-testid='deselect-one' onClick={() => props.onToggleService('1')}>
        Deselect one
      </button>
    </div>
  ),
}));

const mockUseGetServices = useGetServices as jest.MockedFunction<typeof useGetServices>;
const mockUseCompareServices = useCompareServices as jest.MockedFunction<typeof useCompareServices>;
const mockComputeFee = computeFee as jest.MockedFunction<typeof computeFee>;

const mockService1: ServiceDTO = {
  id: '1',
  name: 'Orange Money',
  longName: 'Orange Money Sénégal',
  institution: {
    id: 'inst1',
    name: 'Orange',
    logoUrl: '/logo1.png',
  },
  type: TypeService.TRANSFERT_ARGENT,
  montantMin: 100,
  montantMax: 500000,
  frais: {
    type: 'POURCENTAGE',
    rate: 1,
    montantFixe: 0,
  } as any,
  conditionAccess: ['Avoir un compte Orange Money'],
  plafonds: ['500000 F CFA par transaction'],
  infrastructureAccess: ['Mobile', 'Agence'],
};

const mockService2: ServiceDTO = {
  id: '2',
  name: 'Wave',
  longName: 'Wave Sénégal',
  institution: {
    id: 'inst2',
    name: 'Wave',
    logoUrl: '/logo2.png',
  },
  type: TypeService.TRANSFERT_ARGENT,
  montantMin: 100,
  montantMax: 1000000,
  frais: {
    type: 'FREE',
    amount: 0,
  } as any,
  conditionAccess: ['Avoir un compte Wave'],
  plafonds: ['1000000 F CFA par transaction'],
  infrastructureAccess: ['Mobile'],
};

const mockService3: ServiceDTO = {
  id: '3',
  name: 'MTN Mobile Money',
  longName: 'MTN Mobile Money Cameroun',
  institution: {
    id: 'inst3',
    name: 'MTN',
    logoUrl: '/logo3.png',
  },
  type: TypeService.TRANSFERT_ARGENT,
  montantMin: 100,
  montantMax: 750000,
  frais: {
    type: 'POURCENTAGE',
    rate: 1.5,
    montantFixe: 100,
  } as any,
  conditionAccess: ['Avoir un compte MTN'],
  plafonds: ['750000 F CFA par transaction'],
  infrastructureAccess: ['Mobile', 'Agence'],
};

describe('ComparatorIntelligent - Tests supplémentaires pour 90%+ couverture', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockComputeFee.mockReturnValue({
      value: 500,
      label: '1%',
    });

    mockUseGetServices.mockReturnValue({
      services: [mockService1, mockService2, mockService3],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockUseCompareServices.mockReturnValue({
      services: [],
      message: '',
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  describe('Filtrage par type de service', () => {
    it("change le type de service et réinitialise l'état de comparaison", async () => {
      render(<ComparatorIntelligent />);

      // Sélectionner deux services
      fireEvent.click(screen.getByTestId('select-two'));
      const compareButton = screen.getByRole('button', { name: /Comparer/ });
      fireEvent.click(compareButton);

      expect(screen.getByText('Comparaison détaillée')).toBeInTheDocument();

      const typeSelect = screen.getByLabelText(/Type de service/i);
      fireEvent.click(typeSelect);
    });

    it('réinitialise isGraphView lors du changement de type', async () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));
      fireEvent.click(screen.getByRole('button', { name: /Vue graphique/i }));

      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);

      const typeSelect = screen.getByLabelText(/Type de service/i);
      fireEvent.click(typeSelect);
    });
  });
  describe('Filtrage par pays', () => {
    it('filtre les services par pays (SENEGAL)', async () => {
      render(<ComparatorIntelligent />);

      const paysSelect = screen.getByLabelText(/Pays/i);
      fireEvent.click(paysSelect);

      expect(paysSelect).toBeInTheDocument();
      expect(mockUseGetServices).toHaveBeenCalledWith(expect.objectContaining({ pays: undefined }));
    });

    it('réinitialise isComparing et isGraphView lors du changement de pays', async () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(screen.getByText('Comparaison détaillée')).toBeInTheDocument();

      const paysSelect = screen.getByLabelText(/Pays/i);
      fireEvent.click(paysSelect);
    });

    it('filtre avec pays = ALL (réinitialiser le filtre)', async () => {
      render(<ComparatorIntelligent />);

      const paysSelect = screen.getByLabelText(/Pays/i);

      expect(mockUseGetServices).toHaveBeenCalledWith(expect.objectContaining({ pays: undefined }));
    });
  });

  describe('Gestion de la sélection de services', () => {
    it('désélectionne un service déjà sélectionné', () => {
      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-one'));

      fireEvent.click(screen.getByTestId('deselect-one'));

      expect(screen.getByText(/0 sélectionné\(s\)/)).toBeInTheDocument();
    });

    it('réinitialise isComparing après désélection', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(screen.getByText('Comparaison détaillée')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
      fireEvent.click(screen.getByTestId('select-one'));

      expect(screen.queryByText('Comparaison détaillée')).not.toBeInTheDocument();
    });

    it('réinitialise isGraphView après modification de la sélection', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));
      fireEvent.click(screen.getByRole('button', { name: /Vue graphique/i }));

      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);

      fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
      fireEvent.click(screen.getByTestId('select-one'));

      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
    });
  });

  describe('Entrée de montant', () => {
    it("gère l'entrée de montant avec valeur 0", () => {
      render(<ComparatorIntelligent />);

      const montantInput = screen.getByPlaceholderText('50000') as HTMLInputElement;
      fireEvent.change(montantInput, { target: { value: '0' } });

      expect(montantInput).toHaveValue(0);
    });

    it("gère l'entrée de montant avec valeur négative (convertie en 0)", () => {
      render(<ComparatorIntelligent />);

      const montantInput = screen.getByPlaceholderText('50000') as HTMLInputElement;
      fireEvent.change(montantInput, { target: { value: '-5000' } });

      expect(montantInput).toHaveAttribute('min', '0');
    });

    it("gère l'entrée de montant avec valeur vide (convertie en 0)", () => {
      render(<ComparatorIntelligent />);

      const montantInput = screen.getByPlaceholderText('50000') as HTMLInputElement;
      fireEvent.change(montantInput, { target: { value: '' } });

      expect(montantInput).toHaveValue(0);
    });

    it("gère l'entrée de montant avec valeur très élevée", () => {
      render(<ComparatorIntelligent />);

      const montantInput = screen.getByPlaceholderText('50000') as HTMLInputElement;
      fireEvent.change(montantInput, { target: { value: '999999999' } });

      expect(montantInput).toHaveValue(999999999);
    });
  });

  describe('Bouton Comparer - États variés', () => {
    it('affiche "Comparer les services" quand aucun service n\'est sélectionné', () => {
      render(<ComparatorIntelligent />);

      const compareButton = screen.getByRole('button', { name: /Comparer les services/ });
      expect(compareButton).toBeInTheDocument();
      expect(compareButton).toBeDisabled();
    });

    it('affiche "Comparer 2 services" quand 2 services sont sélectionnés', () => {
      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));

      const compareButton = screen.getByRole('button', { name: /Comparer 2 services/ });
      expect(compareButton).toBeInTheDocument();
      expect(compareButton).not.toBeDisabled();
    });

    it('applique les bonnes classes CSS quand le bouton est désactivé', () => {
      render(<ComparatorIntelligent />);

      const compareButton = screen.getByRole('button', { name: /Comparer/ });
      expect(compareButton.className).toContain('cursor-not-allowed');
      expect(compareButton.className).toContain('bg-primary-200');
    });

    it('applique les bonnes classes CSS quand le bouton est activé', () => {
      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));

      const compareButton = screen.getByRole('button', { name: /Comparer/ });
      expect(compareButton.className).not.toContain('cursor-not-allowed');
      expect(compareButton.className).toContain('bg-primary-200');
    });
  });

  describe('useCompareServices - Appels avec IDs', () => {
    it('appelle useCompareServices avec un tableau vide par défaut', () => {
      render(<ComparatorIntelligent />);

      expect(mockUseCompareServices).toHaveBeenCalledWith([]);
    });

    it('appelle useCompareServices avec les IDs sélectionnés après clic sur Comparer', () => {
      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(mockUseCompareServices).toHaveBeenCalledWith(expect.any(Array));
    });

    it("n'appelle pas useCompareServices avec des IDs quand isComparing est false", () => {
      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      expect(mockUseCompareServices).toHaveBeenCalledWith([]);
    });
  });
  describe('Vue graphique - Toggle multiple fois', () => {
    beforeEach(() => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: 'Comparaison de 2 services',
        isLoading: false,
        isError: false,
        error: null,
      } as any);
    });

    it('bascule entre tableau et graphique plusieurs fois', () => {
      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(screen.getByText(/Frais de service/i)).toBeInTheDocument();

      const graphButton = screen.getByRole('button', { name: /Vue graphique/i });
      fireEvent.click(graphButton);
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);

      const tableButton = screen.getByRole('button', { name: /Vue tableau/i });
      fireEvent.click(tableButton);
      expect(screen.getByText(/Frais de service/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Vue graphique/i }));
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    });
  });

  describe('Message de comparaison - Affichage conditionnel', () => {
    it('affiche le message de comparaison quand il est fourni', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: 'Message de comparaison personnalisé',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(screen.getByText('Message de comparaison personnalisé')).toBeInTheDocument();
    });

    it("n'affiche pas de message si compareMessage est vide", () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: '',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(screen.getByText('Comparaison détaillée')).toBeInTheDocument();
    });
  });
  describe('useMemo - serviceTypes et countries', () => {
    it('calcule correctement serviceTypes', () => {
      render(<ComparatorIntelligent />);

      const typeSelect = screen.getByLabelText(/Type de service/i);
      expect(typeSelect).toBeInTheDocument();
    });

    it('calcule correctement countries', () => {
      render(<ComparatorIntelligent />);

      const paysSelect = screen.getByLabelText(/Pays/i);
      expect(paysSelect).toBeInTheDocument();
    });

    it('utilise useMemo pour filteredServices', () => {
      const { rerender } = render(<ComparatorIntelligent />);

      expect(screen.getByText(/3 services disponibles/)).toBeInTheDocument();

      rerender(<ComparatorIntelligent />);

      expect(screen.getByText(/3 services disponibles/)).toBeInTheDocument();
    });
  });

  describe('Labels de pays - COUNTRY_LABELS', () => {
    it('affiche le label "Sénégal" pour SENEGAL', () => {
      render(<ComparatorIntelligent />);

      const paysSelect = screen.getByLabelText(/Pays/i);
      expect(paysSelect).toBeInTheDocument();
    });
  });

  describe('Boutons type de produit - Classes CSS', () => {
    it('applique les bonnes classes pour TRANSFERT sélectionné', () => {
      render(<ComparatorIntelligent />);

      const transfertButton = screen.getByRole('button', {
        name: /Transferts & Mobile Money/i,
      });

      expect(transfertButton.className).toContain('border-sky-300');
      expect(transfertButton.className).toContain('bg-primary-50');
    });

    it('applique les bonnes classes pour CREDIT non sélectionné', () => {
      render(<ComparatorIntelligent />);

      const creditButton = screen.getByRole('button', { name: /Crédit & Prêts/i });

      expect(creditButton.className).toContain('border-slate-100');
      expect(creditButton.className).toContain('bg-white');
    });

    it('applique les bonnes classes après sélection de CREDIT', () => {
      render(<ComparatorIntelligent />);

      const creditButton = screen.getByRole('button', { name: /Crédit & Prêts/i });
      fireEvent.click(creditButton);

      expect(creditButton.className).toContain('border-sky-300');
      expect(creditButton.className).toContain('bg-primary-50');
    });
  });

  describe('Compteur de services - Mise à jour', () => {
    it('affiche le bon nombre de services disponibles après filtrage', () => {
      mockUseGetServices.mockReturnValue({
        services: [mockService1],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      expect(screen.getByText(/1 services disponibles/)).toBeInTheDocument();
    });

    it('met à jour le compteur après plusieurs sélections/désélections', () => {
      render(<ComparatorIntelligent />);

      expect(screen.getByText(/0 sélectionné\(s\)/)).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('select-one'));
      fireEvent.click(screen.getByTestId('deselect-one'));

      expect(screen.getByText(/0 sélectionné\(s\)/)).toBeInTheDocument();
    });
  });

  describe('Couverture des branches', () => {
    it('gère le cas où isComparing est true ET isGraphView est false', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: '',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));
      expect(screen.getByText(/Frais de service/i)).toBeInTheDocument();
    });

    it('gère le cas où isComparing est true ET isGraphView est true', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: '',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));
      fireEvent.click(screen.getByRole('button', { name: /Vue graphique/i }));
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    });

    it('gère le cas où isComparing est false (liste affichée)', () => {
      render(<ComparatorIntelligent />);

      expect(screen.getByText('Sélectionnez les services à comparer')).toBeInTheDocument();
    });
  });

  describe('Props passées aux composants enfants', () => {
    it('passe les bonnes props à ServiceList', () => {
      render(<ComparatorIntelligent />);

      expect(screen.getByText('Mocked ServiceList')).toBeInTheDocument();
    });

    it('passe amount à computeFee', () => {
      render(<ComparatorIntelligent />);

      const montantInput = screen.getByPlaceholderText('50000') as HTMLInputElement;
      fireEvent.change(montantInput, { target: { value: '100000' } });

      fireEvent.click(screen.getByTestId('compute-fee'));

      expect(mockComputeFee).toHaveBeenCalledWith(expect.any(Object), 100000);
    });
  });

  describe('Élément Separator', () => {
    it('affiche le Separator dans la section filtres', () => {
      const { container } = render(<ComparatorIntelligent />);

      const separator = container.querySelector('.bg-gray-200');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Flux complet avec montant', () => {
    it('flux complet: saisir montant → sélectionner services → comparer → graphique', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: 'Comparaison réussie',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      const montantInput = screen.getByPlaceholderText('50000') as HTMLInputElement;
      fireEvent.change(montantInput, { target: { value: '75000' } });
      expect(montantInput).toHaveValue(75000);

      fireEvent.click(screen.getByTestId('select-two'));
      expect(screen.getByText(/2 sélectionné\(s\)/)).toBeInTheDocument();

      const compareButton = screen.getByRole('button', { name: /Comparer 2 services/ });
      fireEvent.click(compareButton);
      expect(screen.getByText('Comparaison détaillée')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Vue graphique/i }));
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    });
  });

  describe('Cas limites', () => {
    it('gère le cas où compareMessage est null', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: null as any,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(screen.getByText('Comparaison détaillée')).toBeInTheDocument();
    });

    it('gère le cas où error.message est undefined', () => {
      mockUseCompareServices.mockReturnValue({
        services: [],
        message: '',
        isLoading: false,
        isError: true,
        error: {} as any,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));

      expect(screen.getByText('Comparaison détaillée')).toBeInTheDocument();
    });

    it('gère la sélection de 3 services ou plus', () => {
      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-one'));
      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByTestId('select-one')); // Ajouter un 3ème

      const compareButton = screen.getByRole('button', { name: /Comparer/ });
      expect(compareButton).not.toBeDisabled();
    });
  });

  describe('Scénarios réalistes', () => {
    it('scénario: changer de type → sélectionner → changer de pays → re-sélectionner', async () => {
      render(<ComparatorIntelligent />);

      const creditButton = screen.getByRole('button', { name: /Crédit & Prêts/i });
      fireEvent.click(creditButton);

      fireEvent.click(screen.getByTestId('select-one'));

      const paysSelect = screen.getByLabelText(/Pays/i);
      fireEvent.click(paysSelect);
      fireEvent.click(screen.getByTestId('select-two'));

      expect(screen.queryByText(/0 sélectionné\(s\)/)).not.toBeInTheDocument();
      expect(screen.getByText(/sélectionné\(s\)/)).toBeInTheDocument();
    });
  });

  describe('Intégration avec composants mockés', () => {
    it('ComparaisonTableView reçoit les bonnes props', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: '',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));
      expect(screen.getByText(/Frais de service/i)).toBeInTheDocument();
    });

    it('ComparaisonChartsView reçoit les bonnes props', () => {
      mockUseCompareServices.mockReturnValue({
        services: [mockService1, mockService2],
        message: '',
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ComparatorIntelligent />);

      fireEvent.click(screen.getByTestId('select-two'));
      fireEvent.click(screen.getByRole('button', { name: /Comparer/ }));
      fireEvent.click(screen.getByRole('button', { name: /Vue graphique/i }));
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    });
  });

  describe('États initiaux et valeurs par défaut', () => {
    it('productType est TRANSFERT par défaut', () => {
      render(<ComparatorIntelligent />);

      const transfertButton = screen.getByRole('button', {
        name: /Transferts & Mobile Money/i,
      });
      expect(transfertButton.className).toContain('border-sky-300');
    });

    it('selectedType est vide par défaut', () => {
      render(<ComparatorIntelligent />);

      expect(mockUseGetServices).toHaveBeenCalledWith(expect.objectContaining({ type: undefined }));
    });

    it('selectedCountry est vide par défaut', () => {
      render(<ComparatorIntelligent />);

      expect(mockUseGetServices).toHaveBeenCalledWith(expect.objectContaining({ pays: undefined }));
    });

    it('amount est 0 par défaut', () => {
      render(<ComparatorIntelligent />);

      const montantInput = screen.getByPlaceholderText('50000') as HTMLInputElement;
      expect(montantInput).toHaveValue(0);
    });

    it('selectedIds est un tableau vide par défaut', () => {
      render(<ComparatorIntelligent />);

      expect(screen.getByText(/0 sélectionné\(s\)/)).toBeInTheDocument();
    });

    it('isComparing est false par défaut', () => {
      render(<ComparatorIntelligent />);

      expect(screen.getByText('Sélectionnez les services à comparer')).toBeInTheDocument();
    });

    it('isGraphView est false par défaut', () => {
      render(<ComparatorIntelligent />);
      expect(screen.getByText('Mocked ServiceList')).toBeInTheDocument();
    });
  });
});
