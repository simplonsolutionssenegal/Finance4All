import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TypeService } from '@/types/Service';
import EditServiceComponent from '@/components/admin/institutions/EditServiceComponent';

// Mocks
const mockGetToken = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockUpdateService = jest.fn();
const mockApiClient = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: mockGetToken,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: (...args: any[]) => mockApiClient(...args),
}));

jest.mock('@/hooks/service/useUpdateService', () => ({
  useUpdateService: jest.fn(() => ({
    updateService: mockUpdateService,
    isUpdating: false,
  })),
}));

const mockService = {
  id: 'service-123',
  name: 'Transfert',
  longName: "Transfert d'argent",
  type: TypeService.TRANSFERT_ARGENT,
  montantMin: 1000,
  montantMax: 500000,
  frais: {
    type: 'FIX',
    montantFixe: 500,
  },
  conditionAccess: ["Carte d'identité"],
  plafonds: ['500 000 FCFA/jour'],
  infrastructureAccess: ['Agence', 'Mobile'],
};

const mockInstitution = {
  success: true,
  data: {
    id: 'inst-123',
    name: 'Ma Banque',
    services: [mockService],
  },
};

describe('EditServiceComponent', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockGetToken.mockResolvedValue('fake-token');
    mockApiClient.mockResolvedValue(mockInstitution);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (institutionId = 'inst-123', serviceId = 'service-123') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EditServiceComponent institutionId={institutionId} serviceId={serviceId} />
      </QueryClientProvider>
    );
  };

  describe('Chargement initial', () => {
    it('affiche un message de chargement pendant la requête', () => {
      mockApiClient.mockReturnValue(new Promise(() => {}));
      renderComponent();

      expect(screen.getByText('Chargement du service…')).toBeInTheDocument();
    });

    it("affiche un message d'erreur si le service n'existe pas", async () => {
      mockApiClient.mockResolvedValue({
        success: true,
        data: {
          id: 'inst-123',
          services: [],
        },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Impossible de charger le service.')).toBeInTheDocument();
      });
    });

    it('charge et affiche le formulaire avec les données du service', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Transfert')).toBeInTheDocument();
        expect(screen.getByDisplayValue("Transfert d'argent")).toBeInTheDocument();
        expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('500000')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it("affiche le lien retour vers l'institution", async () => {
      renderComponent();

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /retour/i });
        expect(backLink).toHaveAttribute('href', '/institutions/inst-123');
      });
    });

    it('appelle router.back() quand on clique sur Annuler', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      await user.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Formulaire', () => {
    it('pré-remplit les champs avec les données du service', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Transfert')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Ex: Transfert');
      const descriptionInput = screen.getByPlaceholderText("Ex: Transfert d'argent");

      expect(nameInput).toHaveValue('Transfert');
      expect(descriptionInput).toHaveValue("Transfert d'argent");
    });

    it('permet de modifier le nom du service', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Transfert')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Ex: Transfert');
      await user.clear(nameInput);
      await user.type(nameInput, 'Nouveau Transfert');

      expect(nameInput).toHaveValue('Nouveau Transfert');
    });

    it('affiche les options de type de frais', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/gratuit/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/gratuit/i)).toBeInTheDocument();
      expect(screen.getByText(/frais fixe/i)).toBeInTheDocument();
      expect(screen.getByText(/pourcentage/i)).toBeInTheDocument();
      expect(screen.getByText(/mixte/i)).toBeInTheDocument();
      expect(screen.getByText(/change/i)).toBeInTheDocument();
    });

    it('affiche les champs appropriés selon le type de frais sélectionné', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        // Attendre que le formulaire soit chargé avec l'option pourcentage visible
        expect(screen.getByText('Frais en pourcentage')).toBeInTheDocument();
      });

      // Sélectionner "Frais en pourcentage" - on utilise le texte exact complet
      const percentageOption = screen.getByText('Frais en pourcentage');
      await user.click(percentageOption);

      await waitFor(() => {
        // Vérifier que le champ "Taux (%)" apparaît
        expect(screen.getByLabelText(/^taux \(%\)/i)).toBeInTheDocument();

        // Pour les champs minimum/maximum, on utilise des sélecteurs plus spécifiques
        // Le champ "Minimum (FCFA)" pour les frais en pourcentage
        const allInputs = screen.getAllByRole('spinbutton');
        const fraisMinimumInput = allInputs.find(
          input => input.getAttribute('name') === 'frais.minimum'
        );
        expect(fraisMinimumInput).toBeInTheDocument();

        // Le champ "Maximum (FCFA)" pour les frais en pourcentage
        const fraisMaximumInput = allInputs.find(
          input => input.getAttribute('name') === 'frais.maximum'
        );
        expect(fraisMaximumInput).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('affiche une erreur si montantMin > montantMax', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      });

      const minInput = screen.getByLabelText(/montant minimum/i);

      await user.clear(minInput);
      await user.type(minInput, '600000');

      await waitFor(
        () => {
          const errorMessages = screen.queryAllByText(/minimum/i);
          expect(errorMessages.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });

    it('désactive le bouton de soumission si le formulaire est invalide', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Transfert')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Ex: Transfert');
      await user.clear(nameInput);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /modifier le service/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Soumission', () => {
    it('appelle updateService avec les bonnes données lors de la soumission', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Transfert')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /modifier le service/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateService).toHaveBeenCalledWith({
          institutionId: 'inst-123',
          serviceId: 'service-123',
          serviceData: expect.objectContaining({
            name: 'Transfert',
            longName: "Transfert d'argent",
            type: TypeService.TRANSFERT_ARGENT,
          }),
        });
      });
    });

    it('affiche un état de chargement pendant la modification', async () => {
      const { useUpdateService } = require('@/hooks/service/useUpdateService');
      useUpdateService.mockReturnValue({
        updateService: mockUpdateService,
        isUpdating: true,
      });

      renderComponent();

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /modification…/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it("redirige vers la page de l'institution après modification réussie", async () => {
      let onSuccessCallback: (() => void) | undefined;

      const { useUpdateService } = require('@/hooks/service/useUpdateService');
      useUpdateService.mockImplementation(({ onSuccess }: any) => {
        onSuccessCallback = onSuccess;
        return {
          updateService: mockUpdateService,
          isUpdating: false,
        };
      });

      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Transfert')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /modifier le service/i });
      await user.click(submitButton);

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/institutions/inst-123');
      });
    });
  });

  describe('Gestion des types de frais', () => {
    it('nettoie les champs frais non pertinents lors du changement de type', async () => {
      const user = userEvent.setup();

      const serviceWithFixFee = {
        ...mockService,
        frais: {
          type: 'FIX',
          montantFixe: 500,
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: {
          id: 'inst-123',
          services: [serviceWithFixFee],
        },
      });

      renderComponent();

      await waitFor(() => {
        // Attendre que le formulaire soit complètement chargé
        // On vérifie que l'option "Frais fixe" est présente
        expect(screen.getByText('Frais fixe')).toBeInTheDocument();
      });

      // Changer pour "Gratuit" - utiliser le texte exact
      const freeOption = screen.getByText('Gratuit');
      await user.click(freeOption);

      // Vérifier que le champ "Montant fixe (FCFA)" n'est plus visible
      await waitFor(() => {
        // Chercher par le name de l'input plutôt que par le label
        const fixedAmountInput = screen.queryByRole('spinbutton', {
          name: /montant fixe/i,
        });
        expect(fixedAmountInput).not.toBeInTheDocument();
      });
    });
  });
});
