// __tests__/components/admin/modules/stats-cards.test.tsx
import { render, screen } from '@testing-library/react';

import StatsCards from '@/components/admin/modules/stats-cards';

import '@testing-library/jest-dom';

// Mock des icônes de lucide-react
jest.mock('lucide-react', () => ({
  BookOpen: () => <span data-testid='book-open-icon'>📚</span>,
  GraduationCap: () => <span data-testid='graduation-cap-icon'>🎓</span>,
  CheckSquare: () => <span data-testid='check-square-icon'>✅</span>,
  Users: () => <span data-testid='users-icon'>👥</span>,
}));

describe('StatsCards', () => {
  const defaultProps = {
    totalModules: 12,
    publishedModules: 8,
    totalQuizzes: 5,
    totalLearners: 150,
  };

  describe('Rendu initial', () => {
    it('affiche la structure de base du composant', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByText('Gestion des contenus')).toBeInTheDocument();
      expect(
        screen.getByText('Créez et gérez les modules et quiz de la plateforme')
      ).toBeInTheDocument();
    });

    it('applique les bonnes classes CSS au conteneur principal', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const mainContainer = container.querySelector('.mb-8');
      expect(mainContainer).toBeInTheDocument();
    });

    it('affiche le titre principal avec les bonnes classes', () => {
      render(<StatsCards {...defaultProps} />);

      const title = screen.getByText('Gestion des contenus');
      expect(title.tagName).toBe('H1');
      expect(title).toHaveClass('text-4xl', 'font-bold', 'text-gray-900', 'mb-2');
    });

    it('affiche la description avec les bonnes classes', () => {
      render(<StatsCards {...defaultProps} />);

      const description = screen.getByText('Créez et gérez les modules et quiz de la plateforme');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-gray-500');
    });
  });

  describe('En-tête', () => {
    it("affiche l'en-tête avec la structure correcte", () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const headerContainer = container.querySelector('.mb-6');
      expect(headerContainer).toBeInTheDocument();
    });

    it('contient le titre et la description', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gestion des contenus');
      expect(
        screen.getByText('Créez et gérez les modules et quiz de la plateforme')
      ).toBeInTheDocument();
    });
  });

  describe('Grid des statistiques', () => {
    it('affiche la grille avec les bonnes classes CSS', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const grid = container.querySelector(
        '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6'
      );
      expect(grid).toBeInTheDocument();
    });

    it('affiche exactement 4 cartes de statistiques', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const cards = container.querySelectorAll('.bg-white.rounded-2xl');
      expect(cards).toHaveLength(4);
    });

    it('applique les bonnes classes CSS aux cartes', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const firstCard = container.querySelector('.bg-white.rounded-2xl');
      expect(firstCard).toHaveClass(
        'bg-white',
        'rounded-2xl',
        'shadow-sm',
        'border',
        'border-gray-100',
        'p-6',
        'hover:shadow-md',
        'transition-shadow'
      );
    });
  });

  describe('Carte Modules', () => {
    it('affiche la valeur des modules totaux', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it("affiche l'icône BookOpen", () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    });

    it('applique les bonnes couleurs pour la carte Modules', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const iconContainer = container.querySelector('.bg-purple-100');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass(
        'w-12',
        'h-12',
        'rounded-xl',
        'flex',
        'items-center',
        'justify-center',
        'mb-4'
      );
    });

    it('gère les valeurs nulles ou zéro pour les modules', () => {
      render(<StatsCards {...defaultProps} totalModules={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });
  });

  describe('Carte Modules Publiés', () => {
    it('affiche la valeur des modules publiés', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Publiés')).toBeInTheDocument();
    });

    it("affiche l'icône GraduationCap", () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByTestId('graduation-cap-icon')).toBeInTheDocument();
    });

    it('applique les bonnes couleurs pour la carte Publiés', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const iconContainer = container.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('gère les valeurs élevées pour les modules publiés', () => {
      render(<StatsCards {...defaultProps} publishedModules={999} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('Carte Quiz', () => {
    it('affiche la valeur des quiz totaux', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
    });

    it("affiche l'icône CheckSquare", () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
    });

    it('applique les bonnes couleurs pour la carte Quiz', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const iconContainer = container.querySelector('.bg-orange-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Carte Apprenants', () => {
    it('affiche la valeur des apprenants totaux', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Apprenants')).toBeInTheDocument();
    });

    it("affiche l'icône Users", () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('applique les bonnes couleurs pour la carte Apprenants', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const iconContainer = container.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it("gère les grands nombres d'apprenants", () => {
      render(<StatsCards {...defaultProps} totalLearners={1500} />);

      expect(screen.getByText('1500')).toBeInTheDocument();
    });
  });

  describe('Structure des cartes', () => {
    it('chaque carte contient une icône, une valeur et un label', () => {
      render(<StatsCards {...defaultProps} />);

      // Vérifier que toutes les icônes sont présentes
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
      expect(screen.getByTestId('graduation-cap-icon')).toBeInTheDocument();
      expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();

      // Vérifier que toutes les valeurs sont présentes
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();

      // Vérifier que tous les labels sont présents
      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('Publiés')).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
      expect(screen.getByText('Apprenants')).toBeInTheDocument();
    });

    it('applique les bonnes classes aux valeurs numériques', () => {
      render(<StatsCards {...defaultProps} />);

      const valueElements = screen.getAllByText(/^\d+$/);
      valueElements.forEach(element => {
        expect(element).toHaveClass('text-4xl', 'font-bold', 'text-gray-900', 'mb-2');
        expect(element.tagName).toBe('P');
      });
    });

    it('applique les bonnes classes aux labels', () => {
      render(<StatsCards {...defaultProps} />);

      const labelElements = [
        screen.getByText('Modules'),
        screen.getByText('Publiés'),
        screen.getByText('Quiz'),
        screen.getByText('Apprenants'),
      ];

      labelElements.forEach(element => {
        expect(element).toHaveClass('text-sm', 'text-gray-500');
        expect(element.tagName).toBe('P');
      });
    });
  });

  describe('Couleurs et thèmes', () => {
    it('utilise des couleurs distinctes pour chaque carte', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      expect(container.querySelector('.bg-purple-100')).toBeInTheDocument(); // Modules
      expect(container.querySelector('.bg-green-100')).toBeInTheDocument(); // Publiés
      expect(container.querySelector('.bg-orange-100')).toBeInTheDocument(); // Quiz
      expect(container.querySelector('.bg-blue-100')).toBeInTheDocument(); // Apprenants
    });
  });

  describe('Responsivité', () => {
    it('utilise les bonnes classes pour la grille responsive', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid-cols-1', // Mobile: 1 colonne
        'md:grid-cols-2', // Tablet: 2 colonnes
        'lg:grid-cols-4' // Desktop: 4 colonnes
      );
    });
  });

  describe('Gestion des props', () => {
    it('affiche correctement toutes les valeurs reçues en props', () => {
      const customProps = {
        totalModules: 25,
        publishedModules: 18,
        totalQuizzes: 12,
        totalLearners: 500,
      };

      render(<StatsCards {...customProps} />);

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('gère les valeurs zéro', () => {
      const zeroProps = {
        totalModules: 0,
        publishedModules: 0,
        totalQuizzes: 0,
        totalLearners: 0,
      };

      render(<StatsCards {...zeroProps} />);

      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(4);
    });

    it('gère les très grandes valeurs', () => {
      const largeProps = {
        totalModules: 9999,
        publishedModules: 8888,
        totalQuizzes: 7777,
        totalLearners: 10000,
      };

      render(<StatsCards {...largeProps} />);

      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('8888')).toBeInTheDocument();
      expect(screen.getByText('7777')).toBeInTheDocument();
      expect(screen.getByText('10000')).toBeInTheDocument();
    });
  });

  describe('Ordre des cartes', () => {
    it('affiche les cartes dans le bon ordre', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const cards = container.querySelectorAll('.bg-white.rounded-2xl');

      // Vérifier l'ordre des icônes dans les cartes
      expect(cards[0].querySelector('[data-testid="book-open-icon"]')).toBeInTheDocument();
      expect(cards[1].querySelector('[data-testid="graduation-cap-icon"]')).toBeInTheDocument();
      expect(cards[2].querySelector('[data-testid="check-square-icon"]')).toBeInTheDocument();
      expect(cards[3].querySelector('[data-testid="users-icon"]')).toBeInTheDocument();
    });

    it("maintient l'ordre lors du re-rendu", () => {
      const { container, rerender } = render(<StatsCards {...defaultProps} />);

      const initialOrder = Array.from(container.querySelectorAll('.bg-white.rounded-2xl')).map(
        card => card.querySelector('[data-testid]')?.getAttribute('data-testid')
      );

      rerender(<StatsCards {...defaultProps} totalModules={100} />);

      const newOrder = Array.from(container.querySelectorAll('.bg-white.rounded-2xl')).map(card =>
        card.querySelector('[data-testid]')?.getAttribute('data-testid')
      );

      expect(newOrder).toEqual(initialOrder);
    });
  });

  describe('Accessibilité', () => {
    it('utilise un heading approprié pour le titre', () => {
      render(<StatsCards {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Gestion des contenus');
    });

    it('fournit du contenu textuel lisible', () => {
      render(<StatsCards {...defaultProps} />);

      // Tous les textes sont accessibles via screen readers
      expect(screen.getByText('Gestion des contenus')).toBeInTheDocument();
      expect(
        screen.getByText('Créez et gérez les modules et quiz de la plateforme')
      ).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('Publiés')).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
      expect(screen.getByText('Apprenants')).toBeInTheDocument();
    });
  });

  describe('Performance et rendu', () => {
    it("ne génère pas d'erreurs lors du rendu", () => {
      expect(() => render(<StatsCards {...defaultProps} />)).not.toThrow();
    });

    it('supporte les multiples re-rendus', () => {
      const { rerender } = render(<StatsCards {...defaultProps} />);

      rerender(<StatsCards {...defaultProps} totalModules={50} />);
      expect(screen.getByText('50')).toBeInTheDocument();

      rerender(<StatsCards {...defaultProps} publishedModules={30} />);
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });
});
