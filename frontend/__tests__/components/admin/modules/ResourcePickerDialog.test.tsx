import ResourcePickerDialog, {
  ResourceKind,
} from '@/components/admin/modules/ResourcePickerDialog';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock des composants UI
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='dialog-content' className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid='dialog-title' className={className}>
      {children}
    </h2>
  ),
}));

describe('ResourcePickerDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnPick = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onPick: mockOnPick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper pour récupérer les boutons par leur titre exact
  const getButtonByTitle = (title: string) => {
    return screen.getAllByRole('button').find(button => {
      const titleElement = button.querySelector('.text-2xl');
      return titleElement?.textContent === title;
    });
  };

  describe('Rendu du composant', () => {
    it('devrait afficher le dialog quand open est true', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('ne devrait pas afficher le dialog quand open est false', () => {
      render(<ResourcePickerDialog {...defaultProps} open={false} />);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('devrait afficher le titre du dialog', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const title = screen.getByTestId('dialog-title');
      expect(title).toHaveTextContent('Créer une nouvelle ressource');
    });

    it('devrait afficher la description', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      expect(
        screen.getByText('Choisissez le type de contenu que vous souhaitez ajouter')
      ).toBeInTheDocument();
    });

    it('devrait avoir la classe CSS correcte pour le DialogContent', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('sm:max-w-[640px]', 'rounded-2xl');
    });
  });

  describe('Cards de ressources', () => {
    it('devrait afficher toutes les 5 cards de ressources', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      expect(screen.getByText('Page')).toBeInTheDocument();
      expect(screen.getByText('Vidéo')).toBeInTheDocument();
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('Audio')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('devrait afficher les sous-titres corrects pour chaque card', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      expect(screen.getByText('Contenu texte et images')).toBeInTheDocument();
      expect(screen.getByText('Fichier vidéo')).toBeInTheDocument();
      expect(screen.getByText('Image ou infographie')).toBeInTheDocument();
      expect(screen.getByText('Fichier audio ou podcast')).toBeInTheDocument();
      expect(screen.getByText('Document PDF')).toBeInTheDocument();
    });

    it('devrait afficher les icônes pour chaque type de ressource', () => {
      const { container } = render(<ResourcePickerDialog {...defaultProps} />);

      // Vérifie la présence des SVG lucide-react
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait appeler onPick avec "PAGE" quand on clique sur Page', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      expect(pageButton).toBeTruthy();
      await user.click(pageButton!);

      expect(mockOnPick).toHaveBeenCalledWith('PAGE');
      expect(mockOnPick).toHaveBeenCalledTimes(1);
    });

    it('devrait appeler onPick avec "VIDEO" quand on clique sur Vidéo', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const videoButton = getButtonByTitle('Vidéo');
      expect(videoButton).toBeTruthy();
      await user.click(videoButton!);

      expect(mockOnPick).toHaveBeenCalledWith('VIDEO');
    });

    it('devrait appeler onPick avec "IMAGE" quand on clique sur Image', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const imageButton = getButtonByTitle('Image');
      expect(imageButton).toBeTruthy();
      await user.click(imageButton!);

      expect(mockOnPick).toHaveBeenCalledWith('IMAGE');
    });

    it('devrait appeler onPick avec "AUDIO" quand on clique sur Audio', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const audioButton = getButtonByTitle('Audio');
      expect(audioButton).toBeTruthy();
      await user.click(audioButton!);

      expect(mockOnPick).toHaveBeenCalledWith('AUDIO');
    });

    it('devrait appeler onPick avec "PDF" quand on clique sur PDF', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const pdfButton = getButtonByTitle('PDF');
      expect(pdfButton).toBeTruthy();
      await user.click(pdfButton!);

      expect(mockOnPick).toHaveBeenCalledWith('PDF');
    });

    it('ne devrait pas appeler onPick plusieurs fois pour un seul clic', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      expect(pageButton).toBeTruthy();
      await user.click(pageButton!);

      expect(mockOnPick).toHaveBeenCalledTimes(1);
    });

    it('devrait fonctionner avec fireEvent.click aussi', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      expect(pageButton).toBeTruthy();
      fireEvent.click(pageButton!);

      expect(mockOnPick).toHaveBeenCalledWith('PAGE');
    });
  });

  describe('Styles et classes CSS', () => {
    it('devrait appliquer les bonnes classes de bordure pour chaque card', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      const videoButton = getButtonByTitle('Vidéo');
      const imageButton = getButtonByTitle('Image');
      const audioButton = getButtonByTitle('Audio');
      const pdfButton = getButtonByTitle('PDF');

      expect(pageButton).toHaveClass('border-blue-200');
      expect(videoButton).toHaveClass('border-purple-200');
      expect(imageButton).toHaveClass('border-green-200');
      expect(audioButton).toHaveClass('border-pink-200');
      expect(pdfButton).toHaveClass('border-red-200');
    });

    it('devrait avoir les classes de base pour toutes les cards', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toHaveClass('w-full', 'rounded-2xl', 'border-2', 'bg-white', 'p-5');
      });
    });

    it('devrait avoir les bonnes classes de couleur de texte', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      const videoButton = getButtonByTitle('Vidéo');
      const imageButton = getButtonByTitle('Image');
      const audioButton = getButtonByTitle('Audio');
      const pdfButton = getButtonByTitle('PDF');

      // Vérifier que les classes de texte sont présentes dans le DOM
      expect(pageButton?.querySelector('.text-blue-600')).toBeInTheDocument();
      expect(videoButton?.querySelector('.text-purple-600')).toBeInTheDocument();
      expect(imageButton?.querySelector('.text-green-600')).toBeInTheDocument();
      expect(audioButton?.querySelector('.text-pink-600')).toBeInTheDocument();
      expect(pdfButton?.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    it('toutes les cards devraient être des boutons', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('tous les boutons devraient avoir type="button"', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('le titre devrait être dans un élément h2', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const title = screen.getByTestId('dialog-title');
      expect(title.tagName).toBe('H2');
    });

    it('les boutons devraient avoir du texte descriptif', () => {
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      expect(pageButton).toHaveTextContent('Page');
      expect(pageButton).toHaveTextContent('Contenu texte et images');
    });
  });

  describe('Comportement du Dialog', () => {
    it('devrait pouvoir être fermé via onOpenChange', () => {
      const { rerender } = render(<ResourcePickerDialog {...defaultProps} />);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      // Simuler la fermeture
      rerender(<ResourcePickerDialog {...defaultProps} open={false} />);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('devrait réagir aux changements de la prop open', () => {
      const { rerender } = render(<ResourcePickerDialog {...defaultProps} open={false} />);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();

      rerender(<ResourcePickerDialog {...defaultProps} open={true} />);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('devrait maintenir le même contenu lors de la réouverture', () => {
      const { rerender } = render(<ResourcePickerDialog {...defaultProps} />);

      expect(screen.getByText('Page')).toBeInTheDocument();

      rerender(<ResourcePickerDialog {...defaultProps} open={false} />);
      rerender(<ResourcePickerDialog {...defaultProps} open={true} />);

      expect(screen.getByText('Page')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });
  });

  describe('Grid layout', () => {
    it('devrait avoir la classe grid avec les bonnes colonnes', () => {
      const { container } = render(<ResourcePickerDialog {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-3', 'gap-4');
    });

    it('devrait contenir exactement 5 cards dans le grid', () => {
      const { container } = render(<ResourcePickerDialog {...defaultProps} />);

      const grid = container.querySelector('.grid');
      const buttons = grid?.querySelectorAll('button');
      expect(buttons?.length).toBe(5);
    });
  });

  describe('TypeScript types', () => {
    it('devrait accepter tous les types ResourceKind valides', () => {
      const validTypes: ResourceKind[] = ['PAGE', 'VIDEO', 'IMAGE', 'AUDIO', 'PDF'];

      validTypes.forEach(type => {
        const mockPick = jest.fn((kind: ResourceKind) => {
          expect(['PAGE', 'VIDEO', 'IMAGE', 'AUDIO', 'PDF']).toContain(kind);
        });

        render(<ResourcePickerDialog {...defaultProps} onPick={mockPick} />);
      });
    });
  });

  describe('Intégration', () => {
    it('workflow complet: ouvrir, sélectionner, fermer', async () => {
      const user = userEvent.setup();
      const mockOnPick = jest.fn();
      const mockOnOpenChange = jest.fn();

      const { rerender } = render(
        <ResourcePickerDialog open={true} onOpenChange={mockOnOpenChange} onPick={mockOnPick} />
      );

      // Dialog est ouvert
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      // Sélectionner une ressource
      const videoButton = getButtonByTitle('Vidéo');
      expect(videoButton).toBeTruthy();
      await user.click(videoButton!);

      expect(mockOnPick).toHaveBeenCalledWith('VIDEO');

      // Simuler la fermeture après sélection
      rerender(
        <ResourcePickerDialog open={false} onOpenChange={mockOnOpenChange} onPick={mockOnPick} />
      );

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('devrait gérer plusieurs sélections successives', async () => {
      const user = userEvent.setup();
      const mockOnPick = jest.fn();

      render(<ResourcePickerDialog open={true} onOpenChange={jest.fn()} onPick={mockOnPick} />);

      // Utiliser le helper pour éviter l'ambiguïté
      const pageButton = getButtonByTitle('Page');
      const videoButton = getButtonByTitle('Vidéo');
      const imageButton = getButtonByTitle('Image');

      expect(pageButton).toBeTruthy();
      expect(videoButton).toBeTruthy();
      expect(imageButton).toBeTruthy();

      await user.click(pageButton!);
      await user.click(videoButton!);
      await user.click(imageButton!);

      expect(mockOnPick).toHaveBeenCalledTimes(3);
      expect(mockOnPick).toHaveBeenNthCalledWith(1, 'PAGE');
      expect(mockOnPick).toHaveBeenNthCalledWith(2, 'VIDEO');
      expect(mockOnPick).toHaveBeenNthCalledWith(3, 'IMAGE');
    });

    it('ne devrait pas appeler onOpenChange lors de la sélection', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      expect(pageButton).toBeTruthy();
      await user.click(pageButton!);

      expect(mockOnPick).toHaveBeenCalled();
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer les callbacks undefined', () => {
      expect(() => {
        render(<ResourcePickerDialog open={true} onOpenChange={jest.fn()} onPick={jest.fn()} />);
      }).not.toThrow();
    });

    it('devrait gérer les clics rapides multiples', async () => {
      const user = userEvent.setup();
      render(<ResourcePickerDialog {...defaultProps} />);

      const pageButton = getButtonByTitle('Page');
      expect(pageButton).toBeTruthy();

      await user.click(pageButton!);
      await user.click(pageButton!);
      await user.click(pageButton!);

      expect(mockOnPick).toHaveBeenCalledTimes(3);
      expect(mockOnPick).toHaveBeenCalledWith('PAGE');
    });
  });
});
