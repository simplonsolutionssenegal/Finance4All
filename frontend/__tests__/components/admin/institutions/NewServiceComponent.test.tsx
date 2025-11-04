import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCreateService } from '@/hooks/service/useCreateService';
import { TypeService } from '@/types/Service';
import NewServiceComponent from '@/components/admin/institutions/NewServiceComponent';

// Mock des dépendances
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/service/useCreateService', () => ({
  useCreateService: jest.fn(),
}));

// Mock pour scrollIntoView utilisé par Radix UI
Element.prototype.scrollIntoView = jest.fn();

// Mock pour les méthodes de PointerEvent
global.PointerEvent = class PointerEvent extends Event {
  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props);
    Object.assign(this, {
      button: props.button || 0,
      ctrlKey: props.ctrlKey || false,
      pointerType: props.pointerType || 'mouse',
    });
  }
} as any;

// Mock pour hasPointerCapture
Element.prototype.hasPointerCapture = jest.fn();
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();

// Helper pour wrapper avec QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('NewServiceComponent', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockCreateService = jest.fn();

  const institutionId = 'test-institution-123';
  let capturedOnSuccess: ((...args: any[]) => void) | undefined;

  const createServiceImpl = (_args: any) => {
    if (typeof capturedOnSuccess === 'function') {
      capturedOnSuccess();
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });

    (useCreateService as jest.Mock).mockReturnValue({
      createService: mockCreateService,
      isCreating: false,
    });
  });

  describe('Rendu initial', () => {
    it('devrait afficher le titre et le lien de retour', () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      expect(screen.getByText('Nouveau service')).toBeInTheDocument();
      expect(screen.getByText('Créez un nouveau service')).toBeInTheDocument();
      expect(screen.getByText("Retour à l'institution")).toBeInTheDocument();
    });

    it('devrait afficher les étapes du formulaire', () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      expect(screen.getByText('Informations')).toBeInTheDocument();
      expect(screen.getByText('Frais')).toBeInTheDocument();
    });

    it("devrait afficher l'étape 1 par défaut", () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText('Ex: Transfert')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ex: Transfert d'argent")).toBeInTheDocument();
    });
  });

  describe('Étape 1 - Informations de base', () => {
    it('devrait valider les champs requis', async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      const continueButton = screen.getByRole('button', { name: /continuer/i });
      expect(continueButton).toBeDisabled();

      // Remplir le nom (trop court)
      const nameInput = screen.getByPlaceholderText('Ex: Transfert');
      fireEvent.change(nameInput, { target: { value: 'T' } });
      expect(continueButton).toBeDisabled();

      // Nom valide
      fireEvent.change(nameInput, { target: { value: 'Transfert' } });

      // Description valide
      const descInput = screen.getByPlaceholderText("Ex: Transfert d'argent");
      fireEvent.change(descInput, { target: { value: 'Service de transfert' } });

      // Type de service - utiliser pointerDown pour Radix UI
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });

      await screen.findByRole('option', { name: TypeService.TRANSFERT_ARGENT });

      const option = screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT });
      fireEvent.click(option);

      await waitFor(() => expect(continueButton).not.toBeDisabled());
    });

    it('devrait valider que montantMin <= montantMax', async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Remplir les champs requis
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert' },
      });

      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));

      // Montant min > montant max
      const minInput = screen.getByLabelText(/montant minimum/i);
      const maxInput = screen.getByLabelText(/montant maximum/i);

      fireEvent.change(minInput, { target: { value: '10000' } });
      fireEvent.change(maxInput, { target: { value: '5000' } });

      // Attendre que le bouton soit actif
      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /continuer/i });
        expect(continueButton).not.toBeDisabled();
      });

      // Cliquer sur Continuer pour déclencher la validation
      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      // La validation empêche le passage à l'étape 2
      // On vérifie qu'on est toujours sur l'étape 1
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Ex: Transfert')).toBeInTheDocument();
      });
    });

    it("devrait passer à l'étape 2 quand valide", async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Remplir le formulaire
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert' },
      });

      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));

      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      const headerAfterContinue = await screen.findByText(/type de frais/i);
      expect(headerAfterContinue).toBeInTheDocument();
    });
  });

  describe('Étape 2 - Configuration des frais', () => {
    const setupStep2 = async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Remplir l'étape 1
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert' },
      });

      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });

      await screen.findByRole('option', { name: TypeService.TRANSFERT_ARGENT });

      const option = screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT });
      fireEvent.click(option);

      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      const typeDeFraisHeaderInitial = await screen.findByText(/type de frais/i);
      expect(typeDeFraisHeaderInitial).toBeInTheDocument();
    };

    it('devrait afficher les options de frais', async () => {
      await setupStep2();

      expect(screen.getByText('Gratuit')).toBeInTheDocument();
      expect(screen.getByText('Frais fixe')).toBeInTheDocument();
      expect(screen.getByText('Frais en pourcentage')).toBeInTheDocument();
    });

    it('devrait ajouter une condition avec la touche Entrée', async () => {
      await setupStep2();

      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      fireEvent.change(conditionInput, { target: { value: 'KYC' } });
      fireEvent.keyDown(conditionInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('KYC')).toBeInTheDocument();
      });
    });

    it('devrait supprimer un plafond en cliquant sur le badge', async () => {
      await setupStep2();

      const plafondInput = screen.getByPlaceholderText('Ex: 500 000 FCFA/jour');
      fireEvent.change(plafondInput, { target: { value: '300000 FCFA/jour' } });
      const addButton = plafondInput.nextElementSibling as HTMLElement;
      fireEvent.click(addButton);

      await waitFor(() => expect(screen.getByText('300000 FCFA/jour')).toBeInTheDocument());

      const badge = screen.getByText('300000 FCFA/jour');
      fireEvent.click(badge);

      await waitFor(() => {
        expect(screen.queryByText('300000 FCFA/jour')).not.toBeInTheDocument();
      });
    });

    it('devrait ajouter et supprimer une infrastructure via Entrée et clic', async () => {
      await setupStep2();

      const infraInput = screen.getByPlaceholderText('Ex: Agence, GAB, Mobile');
      fireEvent.change(infraInput, { target: { value: 'Mobile' } });
      fireEvent.keyDown(infraInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => expect(screen.getByText('Mobile')).toBeInTheDocument());

      const badge = screen.getByText('Mobile');
      fireEvent.click(badge);

      await waitFor(() => expect(screen.queryByText('Mobile')).not.toBeInTheDocument());
    });

    it('devrait soumettre le formulaire avec frais en pourcentage', async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Étape 1
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert P' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Desc P' },
      });
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });
      await waitFor(() =>
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));
      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      // Étape 2 - Pourcentage
      const headerPercent = await screen.findByText(/type de frais/i);
      expect(headerPercent).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText(/frais en pourcentage/i));

      await waitFor(() => expect(screen.getByLabelText(/pourcentage \(%\)/i)).toBeInTheDocument());

      // Remplir tous les champs requis pour le type POURCENTAGE
      fireEvent.change(screen.getByLabelText(/pourcentage \(%\)/i), { target: { value: '2.5' } });

      // Cibler les champs Minimum et Maximum spécifiques à la configuration des frais
      const feeConfigInputs = screen.getAllByRole('spinbutton');
      // Filtrer pour obtenir uniquement les champs de la section "Configuration des frais"
      const pourcentageInput = screen.getByLabelText(/pourcentage \(%\)/i);
      const pourcentageIndex = feeConfigInputs.indexOf(pourcentageInput as HTMLInputElement);

      // Les champs minimum et maximum sont après le champ pourcentage dans la configuration
      const minInput = feeConfigInputs[pourcentageIndex + 1];
      const maxInput = feeConfigInputs[pourcentageIndex + 2];

      fireEvent.change(minInput, { target: { value: '50' } });
      fireEvent.change(maxInput, { target: { value: '500' } });

      // Attendre que le bouton soit activé
      const submitButton = screen.getByRole('button', { name: /créer le service/i });
      await waitFor(() => expect(submitButton).toBeEnabled());

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateService).toHaveBeenCalledWith({
          institutionId,
          serviceData: expect.objectContaining({
            name: 'Transfert P',
            longName: 'Desc P',
            type: TypeService.TRANSFERT_ARGENT,
            frais: expect.objectContaining({
              pourcentage: 2.5,
              minimum: 50,
              maximum: 500,
            }),
          }),
        });
      });
    });

    it('devrait afficher les champs pour frais fixe', async () => {
      await setupStep2();

      const fixOption = screen.getByLabelText(/frais fixe/i);
      fireEvent.click(fixOption);

      await waitFor(() => {
        expect(screen.getByLabelText(/montant fixe \(fcfa\)/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/pourcentage \(%\)/i)).toBeInTheDocument();
      });
    });

    it('devrait afficher les champs pour frais en pourcentage', async () => {
      await setupStep2();

      const percentOption = screen.getByLabelText(/frais en pourcentage/i);
      fireEvent.click(percentOption);

      await waitFor(() => {
        expect(screen.getByLabelText(/pourcentage \(%\)/i)).toBeInTheDocument();
        const minimumInputs = screen.getAllByLabelText(/minimum/i);
        expect(minimumInputs.length).toBeGreaterThan(0);
        const maximumInputs = screen.getAllByLabelText(/maximum/i);
        expect(maximumInputs.length).toBeGreaterThan(0);
      });
    });

    it("devrait ajouter des conditions d'accès", async () => {
      await setupStep2();

      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      fireEvent.change(conditionInput, { target: { value: 'Compte vérifié' } });

      const addButton = conditionInput.nextElementSibling as HTMLElement;
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Compte vérifié')).toBeInTheDocument();
      });
    });

    it("devrait supprimer une condition d'accès", async () => {
      await setupStep2();

      const conditionInput = screen.getByPlaceholderText('Ajouter une condition');
      fireEvent.change(conditionInput, { target: { value: 'Compte vérifié' } });

      const addButton = conditionInput.nextElementSibling as HTMLElement;
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Compte vérifié')).toBeInTheDocument();
      });

      const badge = screen.getByText('Compte vérifié');
      fireEvent.click(badge);

      await waitFor(() => {
        expect(screen.queryByText('Compte vérifié')).not.toBeInTheDocument();
      });
    });

    it('devrait ajouter des plafonds avec Entrée', async () => {
      await setupStep2();

      const plafondInput = screen.getByPlaceholderText('Ex: 500 000 FCFA/jour');
      fireEvent.change(plafondInput, { target: { value: '500000 FCFA/jour' } });
      fireEvent.keyDown(plafondInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('500000 FCFA/jour')).toBeInTheDocument();
      });
    });
  });

  describe('Soumission du formulaire', () => {
    it('devrait soumettre le formulaire avec les bonnes données', async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Étape 1
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert Mobile' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert mobile' },
      });

      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));

      fireEvent.change(screen.getByLabelText(/montant minimum/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/montant maximum/i), { target: { value: '500000' } });

      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      // Étape 2
      await waitFor(() => {
        expect(screen.getByText(/type de frais/i)).toBeInTheDocument();
      });

      const fixOption = screen.getByLabelText(/frais fixe/i);
      fireEvent.click(fixOption);

      await waitFor(() => {
        const montantFixeInput = screen.getByLabelText(/montant fixe \(fcfa\)/i);
        fireEvent.change(montantFixeInput, { target: { value: '500' } });

        const pourcentageInput = screen.getByLabelText(/pourcentage \(%\)/i);
        fireEvent.change(pourcentageInput, { target: { value: '0' } });
      });

      const submitButton = screen.getByRole('button', { name: /créer le service/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateService).toHaveBeenCalledWith({
          institutionId,
          serviceData: expect.objectContaining({
            name: 'Transfert Mobile',
            longName: 'Service de transfert mobile',
            type: TypeService.TRANSFERT_ARGENT,
            montantMin: 1000,
            montantMax: 500000,
            frais: expect.objectContaining({
              montantFixe: 500,
              pourcentage: 0,
            }),
          }),
        });
      });
    });

    it('devrait désactiver le formulaire pendant la création', async () => {
      (useCreateService as jest.Mock).mockReturnValue({
        createService: mockCreateService,
        isCreating: true,
      });

      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      const nameInput = screen.getByPlaceholderText('Ex: Transfert');
      expect(nameInput).toBeDisabled();
    });
  });

  describe('Comportements additionnels', () => {
    it('devrait réinitialiser les champs de frais quand le type GRATUIT est sélectionné', async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Remplir l'étape 1
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert' },
      });
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });
      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));
      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));
      const headerAfterContinue2 = await screen.findByText(/type de frais/i);
      expect(headerAfterContinue2).toBeInTheDocument();

      // Sélectionner pourcentage et renseigner des valeurs
      const percentOption = screen.getByLabelText(/frais en pourcentage/i);
      fireEvent.click(percentOption);

      const pourcentageInput = await screen.findByLabelText(/pourcentage \(%\)/i);
      expect(pourcentageInput).toBeInTheDocument();
      fireEvent.change(pourcentageInput, { target: { value: '10' } });

      // Maintenant sélectionner Gratuit
      const freeOption = screen.getByLabelText(/gratuit/i);
      fireEvent.click(freeOption);

      // Les champs de configuration des frais doivent disparaître
      await waitFor(() => {
        expect(screen.queryByLabelText(/pourcentage \(%\)/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/configuration des frais/i)).not.toBeInTheDocument();
      });
    });

    it('devrait masquer la configuration des frais pour le type GRATUIT', async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert' },
      });
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });
      await waitFor(() =>
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));
      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));
      const headerAfterClick = await screen.findByText(/type de frais/i);
      expect(headerAfterClick).toBeInTheDocument();

      // Choisir Gratuit
      const freeOption = screen.getByLabelText(/gratuit/i);
      fireEvent.click(freeOption);

      await waitFor(() => {
        expect(screen.queryByText(/configuration des frais/i)).not.toBeInTheDocument();
      });
    });

    it('devrait rediriger après création (simuler onSuccess)', async () => {
      (useCreateService as jest.Mock).mockImplementation(({ onSuccess }: any) => {
        capturedOnSuccess = onSuccess;
        return {
          createService: createServiceImpl,
          isCreating: false,
        };
      });

      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Étape 1
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert Mobile' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert mobile' },
      });

      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));

      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      // Étape 2
      await waitFor(() => {
        expect(screen.getByText(/type de frais/i)).toBeInTheDocument();
      });

      // Choisir "Gratuit" pour éviter les champs obligatoires
      fireEvent.click(screen.getByLabelText(/gratuit/i));

      const submitButton = screen.getByRole('button', { name: /créer le service/i });
      await waitFor(() => expect(submitButton).toBeEnabled());

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/institutions/${institutionId}`);
      });
    });
  });

  describe('Navigation', () => {
    it("devrait retourner à l'étape 1 depuis l'étape 2", async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      // Aller à l'étape 2
      fireEvent.change(screen.getByPlaceholderText('Ex: Transfert'), {
        target: { value: 'Transfert' },
      });
      fireEvent.change(screen.getByPlaceholderText("Ex: Transfert d'argent"), {
        target: { value: 'Service de transfert' },
      });

      const selectTrigger = screen.getByRole('combobox');
      fireEvent.pointerDown(selectTrigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('option', { name: TypeService.TRANSFERT_ARGENT }));

      fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

      // Retour
      await waitFor(() => {
        expect(screen.getByText(/type de frais/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /précédent/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Ex: Transfert')).toBeInTheDocument();
      });
    });

    it('devrait annuler et retourner en arrière', async () => {
      render(<NewServiceComponent institutionId={institutionId} />, { wrapper: createWrapper() });

      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      fireEvent.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });
});
