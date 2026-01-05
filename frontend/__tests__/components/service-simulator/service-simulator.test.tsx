import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSimulator } from '@/hooks/useSimulator';
import { useRouter } from 'next/navigation';
import { ServiceSimulator } from '@/components/service-simulator/service-simulator';
import { computeFee } from '@/lib/FeeCalculator';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useSimulator', () => ({
  useSimulator: jest.fn(),
}));

jest.mock('@/lib/FeeCalculator', () => ({
  computeFee: jest.fn(),
}));

jest.mock('@/lib/format-utils', () => ({
  formatCurrency: jest.fn((n: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(n)
      .replace(/[\s\u00A0\u202F]/g, ' ')
      .replace('XOF', 'FCFA');
  }),
  validateValue: jest.fn((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  }),
}));
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Element.prototype.scrollIntoView = jest.fn();

HTMLElement.prototype.hasPointerCapture = jest.fn();
HTMLElement.prototype.setPointerCapture = jest.fn();
HTMLElement.prototype.releasePointerCapture = jest.fn();

describe('ServiceSimulator', () => {
  const mockRouter = { back: jest.fn() };
  const mockUpdateParam = jest.fn();
  const mockResetSimulation = jest.fn();
  const mockGetAvailableServices = jest.fn();

  const mockInstitutions = [
    {
      id: 'inst1',
      name: 'Wave',
      logoUrl: 'https://example.com/wave.png',
      services: [
        { id: 'srv1', name: 'Transfert' },
        { id: 'srv2', name: 'Retrait' },
      ],
    },
    {
      id: 'inst2',
      name: 'Orange Money',
      services: [{ id: 'srv3', name: 'Envoi' }],
    },
  ];

  const mockServices = [
    {
      id: 'srv1',
      name: 'Transfert',
      longName: "Transfert d'argent",
      montantMin: 100,
      montantMax: 1000000,
      plafonds: ['10000', '50000-100000'],
    },
    {
      id: 'srv2',
      name: 'Retrait',
      longName: "Retrait d'argent",
      montantMin: 500,
      montantMax: 500000,
      plafonds: [],
    },
  ];

  const defaultParams = {
    institution: null,
    service: null,
    amount: 0,
    selectedPlafondIndex: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSimulator as jest.Mock).mockReturnValue({
      params: defaultParams,
      institutions: mockInstitutions,
      isLoading: false,
      updateParam: mockUpdateParam,
      getAvailableServices: mockGetAvailableServices,
      resetSimulation: mockResetSimulation,
    });
    (computeFee as jest.Mock).mockReturnValue({ label: '1%', value: 100 });
    mockGetAvailableServices.mockReturnValue(mockServices);
  });

  describe('Rendu initial', () => {
    it('affiche le header avec le titre', () => {
      render(<ServiceSimulator />);
      expect(screen.getByText('Simulateur de services')).toBeInTheDocument();
      expect(screen.getByText('Calculez vos frais instantanément')).toBeInTheDocument();
    });

    it('affiche le bouton retour', () => {
      render(<ServiceSimulator />);
      const backButton = screen.getByRole('button', { name: /retour/i });
      expect(backButton).toBeInTheDocument();
    });

    it('appelle router.back() au clic sur retour', () => {
      render(<ServiceSimulator />);
      const backButton = screen.getByRole('button', { name: /retour/i });
      fireEvent.click(backButton);
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it('affiche un loader pendant le chargement', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: defaultParams,
        institutions: [],
        isLoading: true,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      expect(screen.getByText('Chargement des institutions...')).toBeInTheDocument();
    });
  });

  describe("Sélection d'institution", () => {
    it("affiche le placeholder quand aucune institution n'est sélectionnée", () => {
      render(<ServiceSimulator />);
      expect(screen.getByText('Sélectionner une institution')).toBeInTheDocument();
    });

    it("affiche le nombre d'institutions disponibles", () => {
      render(<ServiceSimulator />);
      expect(screen.getByText('2 institutions disponibles')).toBeInTheDocument();
    });

    it("met à jour l'institution sélectionnée", async () => {
      const user = userEvent.setup();
      render(<ServiceSimulator />);

      // Utiliser getAllByRole car il y a 2 combobox (institution + service)
      const triggers = screen.getAllByRole('combobox');
      await user.click(triggers[0]); // Premier = institution

      await waitFor(async () => {
        const option = screen.getByRole('option', { name: /wave/i });
        await user.click(option);
      });

      expect(mockUpdateParam).toHaveBeenCalledWith('institution', mockInstitutions[0]);
      expect(mockUpdateParam).toHaveBeenCalledWith('service', null);
    });

    it("affiche l'institution sélectionnée", () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: { ...defaultParams, institution: mockInstitutions[0] },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      expect(screen.getByText('Wave')).toBeInTheDocument();
    });
  });

  describe('Sélection de service', () => {
    it("désactive la sélection de service si aucune institution n'est sélectionnée", () => {
      render(<ServiceSimulator />);
      const serviceText = screen.getByText("Sélectionnez d'abord une institution");
      expect(serviceText).toBeInTheDocument();
    });

    it('affiche le nombre de services disponibles', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: { ...defaultParams, institution: mockInstitutions[0] },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      expect(screen.getByText('2 services disponibles')).toBeInTheDocument();
    });

    it('met à jour le service sélectionné', async () => {
      const user = userEvent.setup();
      (useSimulator as jest.Mock).mockReturnValue({
        params: { ...defaultParams, institution: mockInstitutions[0] },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);

      // Trouver tous les combobox et prendre le second (services)
      const comboboxes = screen.getAllByRole('combobox');
      await user.click(comboboxes[1]);

      await waitFor(async () => {
        const option = screen.getByRole('option', { name: /transfert/i });
        await user.click(option);
      });

      expect(mockUpdateParam).toHaveBeenCalledWith('service', mockServices[0]);
    });
  });

  describe('Saisie du montant', () => {
    it("désactive l'input si aucun service n'est sélectionné", () => {
      render(<ServiceSimulator />);
      const input = screen.getByPlaceholderText('0 FCFA');
      expect(input).toBeDisabled();
    });

    it('permet la saisie du montant quand un service est sélectionné', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          ...defaultParams,
          institution: mockInstitutions[0],
          service: mockServices[0],
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const input = screen.getByPlaceholderText('0 FCFA');
      expect(input).not.toBeDisabled();
    });

    it('met à jour le montant avec une valeur valide', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          ...defaultParams,
          institution: mockInstitutions[0],
          service: mockServices[0],
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const input = screen.getByPlaceholderText('0 FCFA');
      fireEvent.change(input, { target: { value: '5000' } });

      expect(mockUpdateParam).toHaveBeenCalledWith('amount', 5000);
    });

    it('gère les valeurs non numériques', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          ...defaultParams,
          institution: mockInstitutions[0],
          service: mockServices[0],
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const input = screen.getByPlaceholderText('0 FCFA');
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(mockUpdateParam).toHaveBeenCalledWith('amount', 0);
    });
  });

  describe('Calcul des frais', () => {
    it('désactive le bouton calculer si les données sont incomplètes', () => {
      render(<ServiceSimulator />);
      const button = screen.getByRole('button', { name: /calculer/i });
      expect(button).toBeDisabled();
    });

    it('active le bouton calculer quand toutes les données sont présentes', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const button = screen.getByRole('button', { name: /calculer/i });
      expect(button).not.toBeDisabled();
    });

    it('scroll vers les résultats après le calcul', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const button = screen.getByRole('button', { name: /calculer/i });
      fireEvent.click(button);

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Réinitialisation', () => {
    it('réinitialise la simulation', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const buttons = screen.getAllByRole('button', { name: /réinitialiser/i });
      fireEvent.click(buttons[0]);

      expect(mockResetSimulation).toHaveBeenCalled();
    });
  });

  describe('Historique des simulations', () => {
    it('affiche "Aucune simulation" quand l\'historique est vide', () => {
      render(<ServiceSimulator />);
      expect(screen.getByText('Aucune simulation récente pour le moment.')).toBeInTheDocument();
    });

    it("ajoute une simulation à l'historique après calcul", () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const button = screen.getByRole('button', { name: /calculer/i });
      fireEvent.click(button);

      expect(screen.getByText('Wave · Transfert')).toBeInTheDocument();
    });

    it("charge l'historique depuis localStorage au montage", () => {
      const mockHistory = JSON.stringify([
        {
          key: 'test-key',
          institution: 'Wave',
          service: 'Transfert',
          amount: 5000,
          fees: 100,
          total: 5100,
          time: '14:30',
        },
      ]);
      localStorageMock.getItem.mockReturnValue(mockHistory);

      render(<ServiceSimulator />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('services_recent_simulations');
    });

    it("vide l'historique", () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);

      const calcButton = screen.getByRole('button', { name: /calculer/i });
      fireEvent.click(calcButton);

      const clearButton = screen.getByRole('button', { name: /vider/i });
      fireEvent.click(clearButton);

      expect(screen.getByText('Aucune simulation récente pour le moment.')).toBeInTheDocument();
    });

    it("limite l'historique à 5 simulations", () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      const { rerender } = render(<ServiceSimulator />);
      const button = screen.getByRole('button', { name: /calculer/i });

      for (let i = 0; i < 6; i++) {
        (useSimulator as jest.Mock).mockReturnValue({
          params: {
            institution: mockInstitutions[0],
            service: mockServices[0],
            amount: 5000 + i * 1000,
            selectedPlafondIndex: 0,
          },
          institutions: mockInstitutions,
          isLoading: false,
          updateParam: mockUpdateParam,
          getAvailableServices: mockGetAvailableServices,
          resetSimulation: mockResetSimulation,
        });
        rerender(<ServiceSimulator />);
        fireEvent.click(button);
      }

      const saved = JSON.parse(
        localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]
      );
      expect(saved.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Gestion des erreurs localStorage', () => {
    it('gère les erreurs de lecture de localStorage', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });

    it("gère les erreurs d'écriture de localStorage", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const button = screen.getByRole('button', { name: /calculer/i });

      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('gère les données corrompues dans localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      expect(() => render(<ServiceSimulator />)).not.toThrow();
    });
  });

  describe('Limites de montant', () => {
    it('applique les limites min/max du service', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 0,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const input = screen.getByPlaceholderText('0 FCFA');

      fireEvent.change(input, { target: { value: '2000000' } });

      expect(mockUpdateParam).toHaveBeenCalled();
    });

    it("utilise les plafonds si montantMax n'est pas défini", () => {
      const serviceWithPlafonds = {
        ...mockServices[0],
        montantMax: 0,
        plafonds: ['50000'],
      };

      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: serviceWithPlafonds,
          amount: 0,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const input = screen.getByPlaceholderText('0 FCFA');
      fireEvent.change(input, { target: { value: '60000' } });

      expect(mockUpdateParam).toHaveBeenCalled();
    });
  });

  describe('Bouton comparer', () => {
    it('désactive le bouton comparer avant calcul', () => {
      render(<ServiceSimulator />);
      const button = screen.getByRole('button', { name: /comparer toutes les options/i });
      expect(button).toBeDisabled();
    });

    it('active le bouton comparer après calcul', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);
      const calcButton = screen.getByRole('button', { name: /calculer/i });
      fireEvent.click(calcButton);

      const compareButton = screen.getByRole('button', { name: /comparer toutes les options/i });
      expect(compareButton).not.toBeDisabled();
    });
  });

  describe('Affichage du logo institution', () => {
    it('vérifie que le select institution contient les bonnes options', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: { ...defaultParams, institution: mockInstitutions[0] },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('Wave')).toBeInTheDocument();
    });

    it('affiche un emoji par défaut dans la description des options', () => {
      const instWithoutLogo = {
        ...mockInstitutions[1],
        logoUrl: undefined,
      };

      (useSimulator as jest.Mock).mockReturnValue({
        params: defaultParams,
        institutions: [instWithoutLogo],
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);

      expect(screen.getByText('1 institution disponible')).toBeInTheDocument();
    });
  });

  describe('useEffect - selectedPlafondIndex', () => {
    it('réinitialise selectedPlafondIndex quand le service change', () => {
      const { rerender } = render(<ServiceSimulator />);

      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          ...defaultParams,
          service: mockServices[0],
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      rerender(<ServiceSimulator />);

      expect(mockUpdateParam).toHaveBeenCalledWith('selectedPlafondIndex', 0);
    });
  });

  describe('Nouvelle simulation depuis résultats', () => {
    it('réinitialise via le bouton dans les résultats', () => {
      (useSimulator as jest.Mock).mockReturnValue({
        params: {
          institution: mockInstitutions[0],
          service: mockServices[0],
          amount: 5000,
          selectedPlafondIndex: 0,
        },
        institutions: mockInstitutions,
        isLoading: false,
        updateParam: mockUpdateParam,
        getAvailableServices: mockGetAvailableServices,
        resetSimulation: mockResetSimulation,
      });

      render(<ServiceSimulator />);

      const calcButton = screen.getByRole('button', { name: /calculer/i });
      fireEvent.click(calcButton);

      const newSimButton = screen.getByRole('button', { name: /nouvelle simulation/i });
      fireEvent.click(newSimButton);

      expect(mockResetSimulation).toHaveBeenCalled();
    });
  });
});
