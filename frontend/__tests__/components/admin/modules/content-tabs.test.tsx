// __tests__/components/admin/modules/content-tabs.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContentTabs from '@/components/admin/modules/content-tabs';

import '@testing-library/jest-dom';

// Mock des icônes de lucide-react
jest.mock('lucide-react', () => ({
  BookOpen: () => <span data-testid='book-open-icon'>📚</span>,
  CheckSquare: () => <span data-testid='check-square-icon'>✅</span>,
}));

// Mock des composants UI (Tabs)
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, onValueChange, className }: any) => (
    <div data-testid='tabs' data-default-value={defaultValue} className={className}>
      <div
        data-testid='tabs-trigger'
        onClick={() => onValueChange?.('modules')}
        style={{ marginRight: '10px' }}
      >
        Switch to modules
      </div>
      <div data-testid='tabs-trigger-quiz' onClick={() => onValueChange?.('quiz')}>
        Switch to quiz
      </div>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid='tabs-list' className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className, ...props }: any) => (
    <button
      data-testid={`tab-trigger-${value}`}
      data-value={value}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tab-content-${value}`} data-value={value} className={className}>
      {children}
    </div>
  ),
}));

describe('ContentTabs', () => {
  // Mock du render prop
  const mockChildren = jest.fn((activeTab: 'modules' | 'quiz') => (
    <div data-testid={`content-${activeTab}`}>Content for {activeTab}</div>
  ));

  beforeEach(() => {
    mockChildren.mockClear();
  });

  describe('Rendu initial', () => {
    it('affiche la structure de base des tabs', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-modules')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-quiz')).toBeInTheDocument();
    });

    it('applique les bonnes classes CSS au conteneur Tabs', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      const tabsContainer = screen.getByTestId('tabs');
      expect(tabsContainer).toHaveClass('w-full');
      expect(tabsContainer).toHaveAttribute('data-default-value', 'modules');
    });

    it('applique les bonnes classes CSS à TabsList', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass(
        'w-full',
        'justify-start',
        'bg-gray-100',
        'p-1',
        'rounded-full',
        'gap-1',
        'mb-6'
      );
    });

    it('définit "modules" comme valeur par défaut', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      const tabsContainer = screen.getByTestId('tabs');
      expect(tabsContainer).toHaveAttribute('data-default-value', 'modules');
    });
  });

  describe('Onglets et icônes', () => {
    it('affiche les deux onglets avec leurs labels', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(screen.getByTestId('tab-trigger-modules')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-quiz')).toBeInTheDocument();

      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
    });

    it('affiche les icônes appropriées pour chaque onglet', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
      expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
    });

    it('applique les bonnes classes CSS aux triggers', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      const modulesTab = screen.getByTestId('tab-trigger-modules');
      const quizTab = screen.getByTestId('tab-trigger-quiz');

      const expectedClasses = [
        'group',
        'flex',
        'items-center',
        'justify-center',
        'gap-2',
        'rounded-full',
        'px-6',
        'py-2',
        'text-sm',
        'font-medium',
        'text-gray-600',
        'hover:text-gray-900',
        'data-[state=active]:bg-white',
        'data-[state=active]:text-gray-900',
        'data-[state=active]:shadow-sm',
        'transition-all',
        'flex-1',
      ];

      expectedClasses.forEach(className => {
        expect(modulesTab).toHaveClass(className);
        expect(quizTab).toHaveClass(className);
      });
    });

    it('configure correctement les valeurs des onglets', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(screen.getByTestId('tab-trigger-modules')).toHaveAttribute('data-value', 'modules');
      expect(screen.getByTestId('tab-trigger-quiz')).toHaveAttribute('data-value', 'quiz');
    });
  });

  describe('Contenu des onglets', () => {
    it('affiche le contenu pour les modules et quiz', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(screen.getByTestId('tab-content-modules')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content-quiz')).toBeInTheDocument();
    });

    it('applique les bonnes classes aux TabsContent', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      const modulesContent = screen.getByTestId('tab-content-modules');
      const quizContent = screen.getByTestId('tab-content-quiz');

      expect(modulesContent).toHaveClass('mt-0');
      expect(quizContent).toHaveClass('mt-0');
    });

    it('configure correctement les valeurs des contenus', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(screen.getByTestId('tab-content-modules')).toHaveAttribute('data-value', 'modules');
      expect(screen.getByTestId('tab-content-quiz')).toHaveAttribute('data-value', 'quiz');
    });
  });

  describe('Render prop et état', () => {
    it('appelle la fonction children avec "modules" par défaut', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(mockChildren).toHaveBeenCalledWith('modules');
      expect(screen.getByTestId('content-modules')).toBeInTheDocument();
      expect(screen.getByText('Content for modules')).toBeInTheDocument();
    });

    it("met à jour l'état lors du changement d'onglet", async () => {
      const user = userEvent.setup();
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      // Déclencher le changement d'onglet via le mock
      const quizTrigger = screen.getByTestId('tabs-trigger-quiz');
      await user.click(quizTrigger);

      await waitFor(() => {
        expect(mockChildren).toHaveBeenCalledWith('quiz');
      });
    });

    it("affiche le bon contenu selon l'onglet actif", async () => {
      const user = userEvent.setup();
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      // Initialement, modules est actif
      expect(screen.getByTestId('content-modules')).toBeInTheDocument();

      // Changer vers quiz
      const quizTrigger = screen.getByTestId('tabs-trigger-quiz');
      await user.click(quizTrigger);

      await waitFor(() => {
        expect(screen.getByTestId('content-quiz')).toBeInTheDocument();
      });
    });
  });

  describe("Gestion d'état avancée", () => {
    it("maintient l'état correct lors de multiples changements", async () => {
      const user = userEvent.setup();
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      // Modules → Quiz
      await user.click(screen.getByTestId('tabs-trigger-quiz'));

      await waitFor(() => {
        expect(mockChildren).toHaveBeenCalledWith('quiz');
      });

      // Quiz → Modules
      await user.click(screen.getByTestId('tabs-trigger'));

      await waitFor(() => {
        expect(mockChildren).toHaveBeenCalledWith('modules');
      });

      // Vérifier que les appels sont corrects
      expect(mockChildren).toHaveBeenCalledTimes(3); // Initial + 2 changements
    });

    it('gère correctement les valeurs de type TabValue', () => {
      // Test avec une fonction children qui vérifie le type
      const typedChildren = jest.fn((activeTab: 'modules' | 'quiz') => {
        // Vérifier que le type est correct
        const validValues: ('modules' | 'quiz')[] = ['modules', 'quiz'];
        expect(validValues).toContain(activeTab);

        return <div data-testid={`typed-content-${activeTab}`}>Typed content</div>;
      });

      render(<ContentTabs>{typedChildren}</ContentTabs>);

      expect(typedChildren).toHaveBeenCalledWith('modules');
      expect(screen.getByTestId('typed-content-modules')).toBeInTheDocument();
    });
  });

  describe('Props et interface', () => {
    it('accepte correctement la prop children comme render prop', () => {
      const customChildren = (activeTab: 'modules' | 'quiz') => (
        <div data-testid='custom-content'>
          <h2>Custom {activeTab} content</h2>
        </div>
      );

      render(<ContentTabs>{customChildren}</ContentTabs>);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom modules content')).toBeInTheDocument();
    });

    it('fonctionne avec des render props complexes', () => {
      const complexChildren = (activeTab: 'modules' | 'quiz') => (
        <div data-testid={`complex-${activeTab}`}>
          {activeTab === 'modules' ? (
            <div>
              <h3>Modules List</h3>
              <ul>
                <li>Module 1</li>
                <li>Module 2</li>
              </ul>
            </div>
          ) : (
            <div>
              <h3>Quiz List</h3>
              <p>No quizzes available</p>
            </div>
          )}
        </div>
      );

      render(<ContentTabs>{complexChildren}</ContentTabs>);

      expect(screen.getByTestId('complex-modules')).toBeInTheDocument();
      expect(screen.getByText('Modules List')).toBeInTheDocument();
      expect(screen.getByText('Module 1')).toBeInTheDocument();
    });
  });

  describe('Accessibilité et UX', () => {
    it('les onglets sont des boutons accessibles', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      const modulesTab = screen.getByTestId('tab-trigger-modules');
      const quizTab = screen.getByTestId('tab-trigger-quiz');

      expect(modulesTab.tagName).toBe('BUTTON');
      expect(quizTab.tagName).toBe('BUTTON');
    });

    it('fournit des labels textuels lisibles', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
    });

    it('inclut des icônes visuelles pour une meilleure UX', () => {
      render(<ContentTabs>{mockChildren}</ContentTabs>);

      // Vérifier que les icônes sont présentes
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
      expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('gère les render props qui retournent null', () => {
      const nullChildren = () => null;

      render(<ContentTabs>{nullChildren}</ContentTabs>);

      // Le composant devrait toujours s'afficher même si children retourne null
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tab-trigger-modules')).toBeInTheDocument();
    });

    it('gère les render props qui retournent des fragments', () => {
      const fragmentChildren = (activeTab: 'modules' | 'quiz') => (
        <>
          <div data-testid='fragment-1'>Fragment 1 for {activeTab}</div>
          <div data-testid='fragment-2'>Fragment 2 for {activeTab}</div>
        </>
      );

      render(<ContentTabs>{fragmentChildren}</ContentTabs>);

      expect(screen.getByTestId('fragment-1')).toBeInTheDocument();
      expect(screen.getByTestId('fragment-2')).toBeInTheDocument();
      expect(screen.getByText('Fragment 1 for modules')).toBeInTheDocument();
    });

    it('maintient la cohérence lors de re-rendus', () => {
      const { rerender } = render(<ContentTabs>{mockChildren}</ContentTabs>);

      expect(mockChildren).toHaveBeenCalledWith('modules');

      // Re-render avec la même fonction
      rerender(<ContentTabs>{mockChildren}</ContentTabs>);

      // La fonction devrait être appelée à nouveau avec la même valeur
      expect(mockChildren).toHaveBeenCalledWith('modules');
    });
  });
});
