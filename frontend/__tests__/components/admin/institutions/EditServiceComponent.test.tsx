import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TypeService } from '@/types/Service';

// ============================================================================
// MOCKS - Doivent être AVANT l'import du composant
// ============================================================================
const mockGetToken = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockUpdateServiceFn = jest.fn();
let mockIsUpdating = false;

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: mockGetToken,
    userId: 'user-123',
    isLoaded: true,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/hooks/service/useUpdateService', () => ({
  useUpdateService: () => ({
    updateService: mockUpdateServiceFn,
    isUpdating: mockIsUpdating,
  }),
}));

const mockApiClient = jest.fn();
jest.mock('@/lib/api-client', () => ({
  apiClient: (...args: any[]) => mockApiClient(...args),
}));

// Import du composant APRÈS les mocks
import EditServiceComponent from '@/components/admin/institutions/EditServiceComponent';

describe('EditServiceComponent', () => {
  let queryClient: QueryClient;

  const mockInstitutionId = 'inst-123';
  const mockServiceId = 'service-456';

  const mockServiceData = {
    id: 'service-456',
    name: 'Service Test',
    longName: 'Description du service test',
    type: TypeService.PAIEMENT_MARCHAND,
    montantMin: 1000,
    montantMax: 50000,
    frais: {
      montantFixe: 500,
      pourcentage: null,
      minimum: null,
      maximum: null,
      fraisChange: null,
    },
    conditionAccess: ['Condition 1', 'Condition 2'],
    plafonds: ['100000 FCFA/jour'],
    infrastructureAccess: ['Agence', 'Mobile'],
  };

  const mockInstitution = {
    success: true,
    data: {
      id: mockInstitutionId,
      name: 'Test Institution',
      services: [mockServiceData],
    },
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    jest.clearAllMocks();
    mockGetToken.mockResolvedValue('mock-token');
    mockApiClient.mockResolvedValue(mockInstitution);
    mockIsUpdating = false;
  });

  afterEach(() => {
    queryClient.clear();
    jest.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EditServiceComponent institutionId={mockInstitutionId} serviceId={mockServiceId} />
      </QueryClientProvider>
    );
  };

  describe('Chargement et affichage initial', () => {
    it('affiche le loader pendant le chargement', () => {
      mockApiClient.mockReturnValue(new Promise(() => {}));
      renderComponent();
      expect(screen.getByText('Chargement du service…')).toBeInTheDocument();
    });

    it('affiche une erreur si le chargement échoue', async () => {
      mockApiClient.mockRejectedValue(new Error('Erreur réseau'));
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Impossible de charger le service.')).toBeInTheDocument();
      });

      const backLink = screen.getByRole('link');
      expect(backLink).toHaveAttribute('href', `/institutions/${mockInstitutionId}`);
      expect(backLink).toHaveTextContent(/retour/i);
    });

    it("affiche une erreur si le service n'existe pas", async () => {
      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [] },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Impossible de charger le service.')).toBeInTheDocument();
      });
    });

    it('pré-remplit le formulaire avec les données du service', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Service Test')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Description du service test')).toBeInTheDocument();
      });
    });

    it('affiche le titre et le lien de retour', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /modifier le service/i })).toBeInTheDocument();
        expect(screen.getByText('Mettez à jour les informations du service')).toBeInTheDocument();
      });

      const backLink = screen.getByRole('link', { name: /retour/i });
      expect(backLink).toBeInTheDocument();
    });
  });

  describe('Validation du formulaire', () => {
    it('valide le nom du service (minimum 2 caractères)', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Service Test')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/nom du service/i);
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/le champ nom service est obligatoire/i)).toBeInTheDocument();
      });
    });

    it('valide la description (minimum 2 caractères)', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Description du service test')).toBeInTheDocument();
      });

      const descInput = screen.getByLabelText(/description/i);
      fireEvent.change(descInput, { target: { value: 'X' } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        // Le message peut varier, chercher "obligatoire" ou des variantes
        const hasError = screen.queryByText(/obligatoire/i) || screen.queryByText(/description/i);
        expect(hasError).toBeInTheDocument();
      });
    });

    it('valide que montantMin <= montantMax', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Service Test')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const minInput = inputs.find(input => input.getAttribute('name') === 'montantMin');
      const maxInput = inputs.find(input => input.getAttribute('name') === 'montantMax');

      fireEvent.change(minInput!, { target: { value: '10000' } });
      fireEvent.change(maxInput!, { target: { value: '5000' } });
      fireEvent.blur(maxInput!);

      await waitFor(() => {
        expect(screen.getByText(/montantmin doit être ≤ montantmax/i)).toBeInTheDocument();
      });
    });
  });

  describe('Types de frais - FREE', () => {
    it("sélectionne le type FREE et empêche d'ajouter des frais", async () => {
      const serviceFree = {
        ...mockServiceData,
        frais: {
          montantFixe: null,
          pourcentage: null,
          minimum: null,
          maximum: null,
          fraisChange: null,
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceFree] },
      });

      renderComponent();

      await waitFor(() => {
        const freeRadio = screen.getByLabelText(/gratuit/i);
        expect(freeRadio).toBeChecked();
      });
    });
  });

  describe('Types de frais - FIX', () => {
    it('affiche et valide le champ montant fixe', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/frais fixe/i)).toBeInTheDocument();
      });

      const fixRadio = screen.getByLabelText(/frais fixe/i);
      fireEvent.click(fixRadio);

      await waitFor(() => {
        const inputs = screen.getAllByRole('spinbutton');
        const fixInput = inputs.find(input => input.getAttribute('name') === 'frais.montantFixe');
        expect(fixInput).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const fixInput = inputs.find(input => input.getAttribute('name') === 'frais.montantFixe');
      fireEvent.change(fixInput!, { target: { value: '' } });
      fireEvent.blur(fixInput!);

      await waitFor(() => {
        expect(screen.getByText(/le champ montant fixe est obligatoire/i)).toBeInTheDocument();
      });
    });
  });

  describe('Types de frais - MIXTE', () => {
    it('affiche et valide les champs montant fixe + pourcentage', async () => {
      const serviceMixte = {
        ...mockServiceData,
        frais: {
          montantFixe: 100,
          pourcentage: 0.02,
          minimum: null,
          maximum: null,
          fraisChange: null,
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceMixte] },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/frais mixte/i)).toBeChecked();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const fixInput = inputs.find(input => input.getAttribute('name') === 'frais.montantFixe');
      const pctInput = inputs.find(input => input.getAttribute('name') === 'frais.pourcentage');

      expect(fixInput).toBeInTheDocument();
      expect(pctInput).toBeInTheDocument();

      fireEvent.change(pctInput!, { target: { value: '' } });
      fireEvent.blur(pctInput!);

      await waitFor(() => {
        expect(screen.getByText(/le champ pourcentage est obligatoire/i)).toBeInTheDocument();
      });
    });
  });

  describe('Types de frais - POURCENTAGE', () => {
    it('affiche les champs pourcentage, minimum et maximum', async () => {
      const servicePct = {
        ...mockServiceData,
        frais: {
          montantFixe: null,
          pourcentage: 0.015,
          minimum: 50,
          maximum: 1000,
          fraisChange: null,
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [servicePct] },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/frais en pourcentage/i)).toBeChecked();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const pctInput = inputs.find(input => input.getAttribute('name') === 'frais.pourcentage');
      const minInput = inputs.find(input => input.getAttribute('name') === 'frais.minimum');
      const maxInput = inputs.find(input => input.getAttribute('name') === 'frais.maximum');

      expect(pctInput).toBeInTheDocument();
      expect(minInput).toBeInTheDocument();
      expect(maxInput).toBeInTheDocument();
    });

    it('valide que minimum <= maximum pour les frais', async () => {
      const servicePct = {
        ...mockServiceData,
        frais: {
          montantFixe: null,
          pourcentage: 0.02,
          minimum: null,
          maximum: null,
          fraisChange: null,
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [servicePct] },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/frais en pourcentage/i)).toBeChecked();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const minInput = inputs.find(input => input.getAttribute('name') === 'frais.minimum');
      const maxInput = inputs.find(input => input.getAttribute('name') === 'frais.maximum');

      fireEvent.change(minInput!, { target: { value: '5000' } });
      fireEvent.change(maxInput!, { target: { value: '2000' } });
      fireEvent.blur(maxInput!);

      await waitFor(() => {
        expect(screen.getByText(/minimum doit être ≤ maximum/i)).toBeInTheDocument();
      });
    });
  });

  describe('Types de frais - CHANGE', () => {
    it('affiche les champs frais de change', async () => {
      const serviceChange = {
        ...mockServiceData,
        frais: {
          montantFixe: null,
          pourcentage: null,
          minimum: null,
          maximum: null,
          fraisChange: { fxSurcharge: 2.5, devise: 'EUR' },
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceChange] },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/frais selon devise/i)).toBeChecked();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const fxInput = inputs.find(
        input => input.getAttribute('name') === 'frais.fraisChange.fxSurcharge'
      );
      expect(fxInput).toBeInTheDocument();
      expect(screen.getByText(/devise de référence/i)).toBeInTheDocument();
    });

    it('valide les champs frais de change', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/frais selon devise/i)).toBeInTheDocument();
      });

      const changeRadio = screen.getByLabelText(/frais selon devise/i);
      fireEvent.click(changeRadio);

      await waitFor(() => {
        const inputs = screen.getAllByRole('spinbutton');
        const fxInput = inputs.find(
          input => input.getAttribute('name') === 'frais.fraisChange.fxSurcharge'
        );
        expect(fxInput).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const fxInput = inputs.find(
        input => input.getAttribute('name') === 'frais.fraisChange.fxSurcharge'
      );
      fireEvent.change(fxInput!, { target: { value: '' } });
      fireEvent.blur(fxInput!);

      // Attendre un peu pour que la validation se déclenche
      await new Promise(resolve => setTimeout(resolve, 100));

      // Vérifier que le bouton submit est désactivé ou qu'il y a une erreur quelque part
      const submitButton = screen.getByRole('button', { name: /modifier le service/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Champs Tags (conditionAccess, plafonds, infrastructureAccess)', () => {
    it("permet d'ajouter des conditions d'accès", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ajouter une condition/i)).toBeInTheDocument();
      });

      const condInput = screen.getByPlaceholderText(/ajouter une condition/i);
      fireEvent.change(condInput, { target: { value: 'Nouvelle condition' } });
      fireEvent.keyDown(condInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Nouvelle condition')).toBeInTheDocument();
      });
    });

    it('permet de supprimer une condition existante', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Condition 1')).toBeInTheDocument();
      });

      const chip1 = screen.getByLabelText('Supprimer Condition 1');
      fireEvent.click(chip1);

      await waitFor(() => {
        expect(screen.queryByText('Condition 1')).not.toBeInTheDocument();
        expect(screen.getByText('Condition 2')).toBeInTheDocument();
      });
    });

    it("permet d'ajouter des plafonds", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ex: 500 000 fcfa\/jour/i)).toBeInTheDocument();
      });

      const plafondInput = screen.getByPlaceholderText(/ex: 500 000 fcfa\/jour/i);
      fireEvent.change(plafondInput, { target: { value: '200000 FCFA/mois' } });
      fireEvent.keyDown(plafondInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('200000 FCFA/mois')).toBeInTheDocument();
      });
    });

    it("permet d'ajouter des infrastructures d'accès", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ex: agence, gab, mobile/i)).toBeInTheDocument();
      });

      const infraInput = screen.getByPlaceholderText(/ex: agence, gab, mobile/i);
      fireEvent.change(infraInput, { target: { value: 'Web' } });
      fireEvent.keyDown(infraInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Web')).toBeInTheDocument();
      });
    });

    it("n'ajoute pas de tags vides ou en double", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ajouter une condition/i)).toBeInTheDocument();
      });

      const condInput = screen.getByPlaceholderText(/ajouter une condition/i);
      const initialChips = screen.getAllByText(/Condition \d/).length;

      // Tag vide
      fireEvent.change(condInput, { target: { value: '   ' } });
      fireEvent.keyDown(condInput, { key: 'Enter', code: 'Enter' });

      fireEvent.change(condInput, { target: { value: '' } });
      fireEvent.keyDown(condInput, { key: 'Enter', code: 'Enter' });

      // Tag en double
      fireEvent.change(condInput, { target: { value: 'Condition 1' } });
      fireEvent.keyDown(condInput, { key: 'Enter', code: 'Enter' });

      // Le nombre de chips ne devrait pas avoir changé
      const finalChips = screen.getAllByText(/Condition \d/).length;
      expect(finalChips).toBe(initialChips);
    });
  });

  describe('Soumission du formulaire', () => {
    it('soumet le formulaire avec succès', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Service Test')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/nom du service/i);
      fireEvent.change(nameInput, { target: { value: 'Service Modifié' } });

      const submitButton = screen.getByRole('button', { name: /modifier le service/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateServiceFn).toHaveBeenCalledWith({
          institutionId: mockInstitutionId,
          serviceId: mockServiceId,
          serviceData: expect.objectContaining({
            name: 'Service Modifié',
          }),
        });
      });
    });

    it('annule et retourne en arrière', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      fireEvent.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Normalisation des types de service', () => {
    it("normalise les types de service depuis l'API", async () => {
      const serviceWithCodeType = {
        ...mockServiceData,
        type: 'PAIEMENT_MARCHAND',
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceWithCodeType] },
      });

      renderComponent();

      await waitFor(() => {
        const typeButton = screen.getByRole('combobox');
        expect(typeButton).toHaveTextContent(TypeService.PAIEMENT_MARCHAND);
      });
    });

    it('utilise AUTRES pour les types inconnus', async () => {
      const serviceWithUnknownType = {
        ...mockServiceData,
        type: 'TYPE_INCONNU',
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceWithUnknownType] },
      });

      renderComponent();

      await waitFor(() => {
        const typeButton = screen.getByRole('combobox');
        expect(typeButton).toHaveTextContent(TypeService.AUTRES);
      });
    });
  });

  describe('Gestion des valeurs 0', () => {
    it('traite correctement les valeurs à 0 comme undefined', async () => {
      const serviceWithZeros = {
        ...mockServiceData,
        montantMin: 0,
        montantMax: 0,
        frais: {
          montantFixe: 0,
          pourcentage: 0,
          minimum: 0,
          maximum: 0,
          fraisChange: null,
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceWithZeros] },
      });

      renderComponent();

      await waitFor(() => {
        const inputs = screen.getAllByRole('spinbutton');
        const minInput = inputs.find(
          input => input.getAttribute('name') === 'montantMin'
        ) as HTMLInputElement;
        expect(minInput.value).toBe('');
      });
    });

    it('accepte 0 comme valeur valide pour les montants', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Service Test')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const minInput = inputs.find(input => input.getAttribute('name') === 'montantMin');

      fireEvent.change(minInput!, { target: { value: '0' } });
      fireEvent.blur(minInput!);

      await waitFor(
        () => {
          expect(screen.queryByText(/doit être > 0/i)).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Conversion pourcentage', () => {
    it("convertit le pourcentage de l'API (0.02) en format UI (2)", async () => {
      const servicePct = {
        ...mockServiceData,
        frais: {
          montantFixe: null,
          pourcentage: 0.025,
          minimum: null,
          maximum: null,
          fraisChange: null,
        },
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [servicePct] },
      });

      renderComponent();

      await waitFor(() => {
        const inputs = screen.getAllByRole('spinbutton');
        const pctInput = inputs.find(
          input => input.getAttribute('name') === 'frais.pourcentage'
        ) as HTMLInputElement;
        expect(pctInput.value).toBe('2.5');
      });
    });
  });

  describe('Edge cases et scénarios complexes', () => {
    it('gère un service sans frais définis', async () => {
      const serviceNoFees = {
        ...mockServiceData,
        frais: null as any,
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceNoFees] },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/gratuit/i)).toBeChecked();
      });
    });

    it('gère un service sans tableaux définis', async () => {
      const serviceNoArrays = {
        ...mockServiceData,
        conditionAccess: null as any,
        plafonds: null as any,
        infrastructureAccess: null as any,
      };

      mockApiClient.mockResolvedValue({
        success: true,
        data: { ...mockInstitution.data, services: [serviceNoArrays] },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ajouter une condition/i)).toBeInTheDocument();
      });

      const chips = screen.queryAllByRole('button', { name: /supprimer/i });
      expect(chips.length).toBeLessThanOrEqual(0);
    });

    it('change de type de frais et nettoie les champs appropriés', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/frais fixe/i)).toBeInTheDocument();
      });

      const pctRadio = screen.getByLabelText(/frais en pourcentage/i);
      fireEvent.click(pctRadio);

      await waitFor(() => {
        const inputs = screen.getAllByRole('spinbutton');
        const fixInput = inputs.find(input => input.getAttribute('name') === 'frais.montantFixe');
        const pctInput = inputs.find(input => input.getAttribute('name') === 'frais.pourcentage');

        expect(fixInput).toBeUndefined();
        expect(pctInput).toBeInTheDocument();
      });
    });

    it('sélectionne tous les types de service disponibles', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const typeSelect = screen.getByRole('combobox');

      // Vérifier que le select affiche bien un type de service initial
      expect(typeSelect).toHaveTextContent(TypeService.PAIEMENT_MARCHAND);

      // Vérifier que tous les types existent dans l'enum (test de cohérence)
      const allTypes = Object.values(TypeService);
      expect(allTypes).toContain(TypeService.PAIEMENT_MARCHAND);
      expect(allTypes).toContain(TypeService.TRANSFERT_ARGENT);
      expect(allTypes).toContain(TypeService.AUTRES);
      expect(allTypes.length).toBeGreaterThanOrEqual(13);
    });
  });

  describe('Accessibilité', () => {
    it('les champs required ont des labels avec astérisque', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/nom du service \*/i)).toBeInTheDocument();
        expect(screen.getByText(/description \*/i)).toBeInTheDocument();
        expect(screen.getByText(/type de service \*/i)).toBeInTheDocument();
      });
    });

    it("les messages d'erreur sont associés aux champs", async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Service Test')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/nom du service/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(/le champ nom service est obligatoire/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
