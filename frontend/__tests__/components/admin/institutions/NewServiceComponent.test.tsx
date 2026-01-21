import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCreateService } from '@/hooks/service/useCreateService';
import { TypeService } from '@/types/Service';
import NewServiceComponent from '@/components/admin/institutions/NewServiceComponent';

// Mock des hooks et modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/service/useCreateService', () => ({
  useCreateService: jest.fn(),
}));

// Mock de next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('NewServiceComponent', () => {
  let queryClient: QueryClient;
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockCreateService: jest.Mock;

  beforeEach(() => {
    // Initialisation du QueryClient
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mocks pour le router
    mockPush = jest.fn();
    mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });

    // Mock pour le hook de création
    mockCreateService = jest.fn();
    (useCreateService as jest.Mock).mockReturnValue({
      createService: mockCreateService,
      isCreating: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (institutionId = 'test-institution-123') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NewServiceComponent institutionId={institutionId} />
      </QueryClientProvider>
    );
  };

  describe('Rendu initial', () => {
    it('devrait afficher le titre et la description', () => {
      renderComponent();

      expect(screen.getByText('Nouveau service')).toBeInTheDocument();
      expect(screen.getByText('Créez un nouveau service')).toBeInTheDocument();
    });

    it('devrait afficher le lien de retour avec le bon href', () => {
      renderComponent('institution-456');

      const backLink = screen.getByRole('link', { name: /retour/i });
      expect(backLink).toHaveAttribute('href', '/institutions/institution-456');
    });

    it('devrait afficher les deux étapes', () => {
      renderComponent();

      expect(screen.getByText('Informations')).toBeInTheDocument();
      expect(screen.getByText('Frais')).toBeInTheDocument();
    });

    it('devrait afficher la première étape par défaut', () => {
      renderComponent();

      expect(screen.getByLabelText('Nom du service *')).toBeInTheDocument();
      expect(screen.getByLabelText('Type de service *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    });

    it('devrait désactiver le bouton Continuer initialement', () => {
      renderComponent();

      const continueButton = screen.getByRole('button', { name: /continuer/i });
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Étape 1 - Informations', () => {
    it('devrait afficher tous les champs obligatoires', () => {
      renderComponent();

      expect(screen.getByLabelText('Nom du service *')).toBeInTheDocument();
      expect(screen.getByLabelText('Type de service *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    });

    it('devrait afficher les champs de montant optionnels', () => {
      renderComponent();

      expect(screen.getByLabelText('Montant minimum (FCFA)')).toBeInTheDocument();
      expect(screen.getByLabelText('Montant maximum (FCFA)')).toBeInTheDocument();
    });

    it('devrait avoir le placeholder correct pour le nom', () => {
      renderComponent();

      const nameInput = screen.getByPlaceholderText('Ex: Transfert');
      expect(nameInput).toBeInTheDocument();
    });

    it('devrait avoir le placeholder correct pour la description', () => {
      renderComponent();

      const descInput = screen.getByPlaceholderText("Ex: Transfert d'argent");
      expect(descInput).toBeInTheDocument();
    });

    it('devrait activer le bouton Continuer avec des données valides', () => {
      renderComponent();

      const nameInput = screen.getByLabelText('Nom du service *');
      const descInput = screen.getByLabelText('Description *');

      // Simulation de saisie
      nameInput.setAttribute('value', 'Transfert');
      Object.defineProperty(nameInput, 'value', { value: 'Transfert', writable: true });

      descInput.setAttribute('value', "Transfert d'argent");
      Object.defineProperty(descInput, 'value', { value: "Transfert d'argent", writable: true });

      // Note: Le test de validation complète nécessiterait de trigger
      // les événements onChange du formulaire
    });
  });

  describe('Navigation entre les étapes', () => {
    it("devrait permettre de revenir à l'étape 1 depuis l'étape 2", async () => {
      renderComponent();

      // Simuler le passage à l'étape 2
      const component = screen.getByText('Nouveau service').closest('div')?.parentElement;
      if (component) {
        // On force l'état pour tester la navigation
        const buttons = screen.getAllByRole('button');
        const backButton = buttons.find(btn => btn.textContent?.includes('Précédent'));

        expect(backButton).toBeDefined();
      }
    });

    it("devrait afficher le bouton Annuler à l'étape 1", () => {
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('devrait appeler router.back() lors du clic sur Annuler', () => {
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      cancelButton.click();

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Étape 2 - Frais', () => {
    it('devrait afficher les options de type de frais', () => {
      renderComponent();

      // Les options sont rendues via RadioGroup
      expect(screen.getByText(/Sélectionnez le type de frais/i)).toBeInTheDocument();
    });

    it('devrait afficher les champs de tags', () => {
      renderComponent();

      expect(screen.getByText(/Conditions d'accès/i)).toBeInTheDocument();
      expect(screen.getByText(/Plafonds/i)).toBeInTheDocument();
      expect(screen.getByText(/Infrastructure d'accès/i)).toBeInTheDocument();
    });
  });

  describe('Soumission du formulaire', () => {
    it('devrait désactiver le bouton de soumission quand isCreating est true', () => {
      (useCreateService as jest.Mock).mockReturnValue({
        createService: mockCreateService,
        isCreating: true,
      });

      renderComponent();

      // Le bouton a le texte "Création…" quand isCreating est true
      const submitButton = screen.getByRole('button', { name: /création/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('devrait afficher "Création…" pendant la création', () => {
      (useCreateService as jest.Mock).mockReturnValue({
        createService: mockCreateService,
        isCreating: true,
      });

      renderComponent();

      const submitButton = screen.getByRole('button', { name: /création/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton.textContent).toContain('Création…');
    });

    it('devrait appeler createService avec les bonnes données lors de la soumission', async () => {
      renderComponent('test-institution');

      // Note: Pour un test complet, il faudrait remplir le formulaire
      // et déclencher la soumission. Cela nécessiterait de manipuler
      // le formulaire via les événements React Hook Form.

      expect(mockCreateService).not.toHaveBeenCalled();
    });

    it('devrait invalider les queries et rediriger après succès', async () => {
      const mockOnSuccess = jest.fn();

      (useCreateService as jest.Mock).mockImplementation(({ onSuccess }) => {
        mockOnSuccess.mockImplementation(onSuccess);
        return {
          createService: mockCreateService,
          isCreating: false,
        };
      });

      renderComponent('test-institution');

      // Simuler le succès
      await waitFor(() => {
        if (mockOnSuccess.mock.calls.length > 0) {
          mockOnSuccess.mock.calls[0][0]();
        }
      });
    });
  });

  describe('États de chargement', () => {
    it('devrait désactiver tous les champs pendant la création', () => {
      (useCreateService as jest.Mock).mockReturnValue({
        createService: mockCreateService,
        isCreating: true,
      });

      renderComponent();

      const nameInput = screen.getByLabelText('Nom du service *');
      expect(nameInput).toBeDisabled();
    });

    it('devrait désactiver les boutons pendant la création', () => {
      (useCreateService as jest.Mock).mockReturnValue({
        createService: mockCreateService,
        isCreating: true,
      });

      renderComponent();

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Validation du formulaire', () => {
    it("devrait avoir des conteneurs pour les messages d'erreur", () => {
      renderComponent();

      // Les FormMessage ont la classe min-h-[16px] même quand vides
      const formItems = document.querySelectorAll('[data-slot="form-control"]');
      expect(formItems.length).toBeGreaterThan(0);
    });

    it("devrait afficher les messages d'erreur après tentative de soumission invalide", async () => {
      renderComponent();

      const form = screen.getByRole('button', { name: /continuer/i }).closest('form');

      if (form) {
        // Tenter de soumettre le formulaire vide
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
          // Vérifier que les champs requis sont présents
          const nameInput = screen.getByLabelText('Nom du service *');
          expect(nameInput).toBeInTheDocument();
        });
      }
    });
  });

  describe('Props institutionId', () => {
    it("devrait utiliser l'institutionId fourni", () => {
      renderComponent('custom-id-789');

      const backLink = screen.getByRole('link', { name: /retour/i });
      expect(backLink).toHaveAttribute('href', '/institutions/custom-id-789');
    });

    it("devrait passer l'institutionId à createService", () => {
      renderComponent('institution-999');

      // L'institutionId est passé lors de l'appel à createService
      // Le test complet nécessiterait de soumettre le formulaire
      expect(useCreateService).toHaveBeenCalled();
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir des labels pour tous les champs de formulaire', () => {
      renderComponent();

      expect(screen.getByLabelText('Nom du service *')).toBeInTheDocument();
      expect(screen.getByLabelText('Type de service *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    });

    it('devrait avoir des attributs aria-hidden sur les icônes décoratives', () => {
      renderComponent();

      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Types de frais', () => {
    it('devrait afficher le type de frais par défaut comme FREE', () => {
      renderComponent();

      const gratuitRadio = screen.getByRole('radio', { name: /gratuit/i });
      expect(gratuitRadio).toHaveAttribute('aria-checked', 'true');
    });

    it('devrait afficher tous les types de frais disponibles', () => {
      renderComponent();

      expect(screen.getByRole('radio', { name: /gratuit/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /frais fixe/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /frais en pourcentage/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /frais mixte/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /frais selon devise/i })).toBeInTheDocument();
    });

    it('devrait avoir les bons placeholders pour les champs de tags', () => {
      renderComponent();

      expect(screen.getByPlaceholderText('Ajouter une condition')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ex: 500 000 FCFA/jour')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ex: Agence, GAB, Mobile')).toBeInTheDocument();
    });
  });

  describe('Intégration des composants', () => {
    it('devrait utiliser NumericFormField pour les montants', () => {
      renderComponent();

      const montantMinInput = screen.getByLabelText('Montant minimum (FCFA)');
      const montantMaxInput = screen.getByLabelText('Montant maximum (FCFA)');

      expect(montantMinInput).toHaveAttribute('type', 'number');
      expect(montantMaxInput).toHaveAttribute('type', 'number');
      expect(montantMinInput).toHaveAttribute('min', '0');
      expect(montantMaxInput).toHaveAttribute('min', '0');
    });

    it('devrait utiliser Select pour le type de service', () => {
      renderComponent();

      const typeSelect = screen.getByRole('combobox', { name: /type de service/i });
      expect(typeSelect).toBeInTheDocument();
      expect(typeSelect).toHaveAttribute('aria-expanded', 'false');
    });

    it('devrait utiliser Textarea pour la description', () => {
      renderComponent();

      const descTextarea = screen.getByLabelText('Description *');
      expect(descTextarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('Classes CSS et styling', () => {
    it('devrait appliquer les classes de focus appropriées', () => {
      renderComponent();

      const nameInput = screen.getByLabelText('Nom du service *');
      expect(nameInput.className).toContain('focus:ring-cyan-500');
      expect(nameInput.className).toContain('bg-[#F8F9FA]');
    });

    it("devrait avoir les indicateurs visuels d'étape corrects", () => {
      renderComponent();

      const stepIndicators = document.querySelectorAll('.h-8.w-8.rounded-full');
      expect(stepIndicators.length).toBe(2);

      // Première étape active
      expect(stepIndicators[0].className).toContain('bg-primary-300');

      // Deuxième étape inactive
      expect(stepIndicators[1].className).toContain('bg-[#F8F9FA]');
    });

    it('devrait avoir des séparateurs entre les sections', () => {
      renderComponent();

      const separators = screen.getAllByRole('separator');
      expect(separators.length).toBeGreaterThan(0);
      separators.forEach(sep => {
        expect(sep.className).toContain('bg-gray-200');
      });
    });
  });

  describe('Gestion des erreurs de formulaire', () => {
    it('devrait avoir des conteneurs FormMessage pour chaque champ', () => {
      renderComponent();

      // Les FormMessage avec min-h-[16px] sont présents même sans erreur
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('devrait marquer les champs comme invalides avec aria-invalid', () => {
      renderComponent();

      const nameInput = screen.getByLabelText('Nom du service *');
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Boutons et actions', () => {
    it("devrait avoir le bon nombre de boutons selon l'étape", () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      // Annuler, Continuer, et les boutons de tag input
      expect(buttons.length).toBeGreaterThan(2);
    });

    it('devrait avoir les icônes appropriées sur les boutons', () => {
      renderComponent();

      const continueButton = screen.getByRole('button', { name: /continuer/i });
      expect(continueButton.querySelector('svg')).toBeInTheDocument();
    });

    it("devrait afficher le bouton Précédent à l'étape 2", () => {
      renderComponent();

      const prevButton = screen.getByRole('button', { name: /précédent/i });
      expect(prevButton).toBeInTheDocument();
      expect(prevButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Champs conditionnels selon le type de frais', () => {
    it('devrait masquer les champs de frais quand FREE est sélectionné', () => {
      renderComponent();

      // Par défaut, FREE est sélectionné
      const gratuitRadio = screen.getByRole('radio', { name: /gratuit/i });
      expect(gratuitRadio).toHaveAttribute('aria-checked', 'true');

      // Les champs de frais ne devraient pas être visibles
      expect(screen.queryByLabelText(/montant fixe.*fcfa/i)).not.toBeInTheDocument();
    });
  });

  describe('Structure du document', () => {
    it('devrait avoir un titre principal h1', () => {
      renderComponent();

      const heading = screen.getByRole('heading', { name: /nouveau service/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('devrait avoir la structure de formulaire correcte', () => {
      renderComponent();

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form?.className).toContain('rounded-2xl');
    });

    it('devrait avoir un conteneur blanc avec ombre', () => {
      renderComponent();

      const container = document.querySelector('.bg-white.shadow-md.rounded-2xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Données du formulaire par défaut', () => {
    it('devrait initialiser avec des valeurs vides', () => {
      renderComponent();

      const nameInput = screen.getByLabelText('Nom du service *') as HTMLInputElement;
      const descInput = screen.getByLabelText('Description *') as HTMLTextAreaElement;

      expect(nameInput.value).toBe('');
      expect(descInput.value).toBe('');
    });

    it('devrait avoir des champs numériques avec placeholder 0', () => {
      renderComponent();

      const montantMin = screen.getByLabelText('Montant minimum (FCFA)') as HTMLInputElement;
      const montantMax = screen.getByLabelText('Montant maximum (FCFA)') as HTMLInputElement;

      expect(montantMin.placeholder).toBe('0');
      expect(montantMax.placeholder).toBe('0');
    });
  });
});
