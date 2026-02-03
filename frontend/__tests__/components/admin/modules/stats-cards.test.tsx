// __tests__/components/admin/modules/stats-cards.test.tsx
import { render, screen } from '@testing-library/react';

import StatsCards from '@/components/admin/modules/stats-cards';

import '@testing-library/jest-dom';

// Mock des icônes lucide pour simplifier les sélecteurs et éviter les SVG réels
jest.mock('lucide-react', () => ({
  BookOpen: (props: any) => <span data-testid='book-open-icon' {...props} />,
  FileText: (props: any) => <span data-testid='file-text-icon' {...props} />,
  HelpCircle: (props: any) => <span data-testid='help-circle-icon' {...props} />,
  Users: (props: any) => <span data-testid='users-icon' {...props} />,
}));

describe('StatsCards (admin modules)', () => {
  const defaultProps = {
    totalModules: 10,
    publishedModules: 6,
    totalLessons: 30,
    totalQuizzes: 5,
    totalLearners: 120,
    completionRate: 75,
  };

  describe('Rendu général', () => {
    it('affiche la barre de titre avec le bon texte', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const wrapper = container.querySelector('.mb-6.space-y-4');
      expect(wrapper).toBeInTheDocument();

      expect(screen.getByText("Gestion des Contenus d'Apprentissage")).toBeInTheDocument();

      // Icône de livre dans la barre de titre
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    });
  });

  describe('Grille de statistiques', () => {
    it('affiche une grille responsive avec 4 cartes', () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-5');

      const cards = container.querySelectorAll('div.rounded-2xl.border.border-slate-100.p-5');
      expect(cards).toHaveLength(4);
    });

    it('affiche les 4 cartes avec les bons titres', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('Leçons')).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
      expect(screen.getByText('Apprenants')).toBeInTheDocument();
    });
  });

  describe('Carte Modules', () => {
    it('affiche le total de modules, le nombre de brouillons et les publiés', () => {
      render(<StatsCards {...defaultProps} />);

      const formattedModules = Number(defaultProps.totalModules).toLocaleString('fr-FR');
      expect(screen.getByText(formattedModules)).toBeInTheDocument();

      // 10 - 6 = 4 brouillons
      expect(screen.getByText('4 brouillons')).toBeInTheDocument();
      expect(screen.getByText('6 publiés')).toBeInTheDocument();
    });

    it('ne produit jamais de brouillons négatifs', () => {
      render(<StatsCards {...defaultProps} totalModules={3} publishedModules={5} />);

      expect(screen.getByText('0 brouillon')).toBeInTheDocument();
    });

    it("utilise le bon fond d'icône pour la carte Modules", () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      // Première carte : Modules => fond bleu
      expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
    });
  });

  describe('Carte Leçons', () => {
    it('affiche le total de leçons et la moyenne par module', () => {
      render(<StatsCards {...defaultProps} totalModules={10} totalLessons={25} />);

      const formattedLessons = Number(25).toLocaleString('fr-FR');
      expect(screen.getByText(formattedLessons)).toBeInTheDocument();
      // 25 / 10 = 2.5 => arrondi à 3
      expect(screen.getByText('~3 par module')).toBeInTheDocument();

      expect(screen.getByText('Structure')).toBeInTheDocument();
    });

    it('affiche ~0 par module quand aucun module', () => {
      render(<StatsCards {...defaultProps} totalModules={0} totalLessons={50} />);

      expect(screen.getByText('~0 par module')).toBeInTheDocument();
    });

    it("utilise le bon fond d'icône pour la carte Leçons", () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      expect(container.querySelector('.bg-emerald-100')).toBeInTheDocument();
    });
  });

  describe('Carte Quiz', () => {
    it('affiche le total de quiz et le badge Évaluations', () => {
      render(<StatsCards {...defaultProps} />);

      const formattedQuizzes = Number(defaultProps.totalQuizzes).toLocaleString('fr-FR');
      expect(screen.getByText(formattedQuizzes)).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
      expect(screen.getByText('Évaluations')).toBeInTheDocument();
    });

    it("utilise le bon fond d'icône pour la carte Quiz", () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      expect(container.querySelector('.bg-orange-100')).toBeInTheDocument();
    });
  });

  describe('Carte Apprenants', () => {
    it('affiche le total des apprenants avec format fr-FR et le taux de complétion', () => {
      const learners = 1500;
      const completionRate = 92;

      render(
        <StatsCards {...defaultProps} totalLearners={learners} completionRate={completionRate} />
      );

      const formattedLearners = Number(learners).toLocaleString('fr-FR');
      expect(screen.getByText(formattedLearners)).toBeInTheDocument();
      expect(screen.getByText('Apprenants')).toBeInTheDocument();
      expect(screen.getByText('92% taux')).toBeInTheDocument();
    });

    it('utilise 0% taux par défaut quand completionRate est omis', () => {
      render(
        <StatsCards totalModules={5} publishedModules={3} totalQuizzes={2} totalLearners={10} />
      );

      expect(screen.getByText('0% taux')).toBeInTheDocument();
    });

    it("utilise le bon fond d'icône pour la carte Apprenants", () => {
      const { container } = render(<StatsCards {...defaultProps} />);

      expect(container.querySelector('.bg-purple-100')).toBeInTheDocument();
    });
  });

  describe('Icônes Lucide', () => {
    it('rend les icônes définies dans la configuration des stats', () => {
      render(<StatsCards {...defaultProps} />);

      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
      expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });
  });
});
