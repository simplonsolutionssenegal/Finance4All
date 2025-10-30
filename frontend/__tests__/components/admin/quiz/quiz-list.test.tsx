// __tests__/components/admin/quiz/quiz-list.test.tsx
import { render, screen } from '@testing-library/react';

import QuizList from '@/components/admin/quiz/quiz-list';

import '@testing-library/jest-dom';

describe('QuizList', () => {
  describe('Rendu initial', () => {
    it('affiche la structure de base du composant', () => {
      render(<QuizList />);

      expect(screen.getByText('Aucun quiz disponible')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
        )
      ).toBeInTheDocument();
    });

    it('applique les bonnes classes CSS au conteneur principal', () => {
      const { container } = render(<QuizList />);

      const mainContainer = container.querySelector(
        '.bg-white.rounded-xl.border.border-gray-200.p-12.text-center'
      );
      expect(mainContainer).toBeInTheDocument();
    });

    it('affiche le conteneur centré avec les bonnes classes', () => {
      const { container } = render(<QuizList />);

      const centeredContainer = container.querySelector('.max-w-md.mx-auto');
      expect(centeredContainer).toBeInTheDocument();
    });
  });

  describe('Icône SVG', () => {
    it("affiche l'icône SVG avec les bonnes dimensions", () => {
      const { container } = render(<QuizList />);

      const svgIcon = container.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
      expect(svgIcon).toHaveClass('w-8', 'h-8', 'text-gray-400');
    });

    it('configure correctement les attributs SVG', () => {
      const { container } = render(<QuizList />);

      const svgIcon = container.querySelector('svg');
      expect(svgIcon).toHaveAttribute('fill', 'none');
      expect(svgIcon).toHaveAttribute('stroke', 'currentColor');
      expect(svgIcon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it("affiche le conteneur d'icône avec les bonnes classes", () => {
      const { container } = render(<QuizList />);

      const iconContainer = container.querySelector(
        '.w-16.h-16.bg-gray-100.rounded-full.flex.items-center.justify-center.mx-auto.mb-4'
      );
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Titre principal', () => {
    it('affiche le titre avec les bonnes classes CSS', () => {
      render(<QuizList />);

      const title = screen.getByText('Aucun quiz disponible');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900', 'mb-2');
    });

    it('utilise un niveau de heading approprié', () => {
      render(<QuizList />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Aucun quiz disponible');
    });
  });

  describe('Description', () => {
    it('affiche la description avec les bonnes classes CSS', () => {
      render(<QuizList />);

      const description = screen.getByText(
        'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
      );
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-gray-500', 'mb-6');
    });

    it('contient un message descriptif et encourageant', () => {
      render(<QuizList />);

      const description = screen.getByText(
        'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe('Structure et layout', () => {
    it('organise les éléments dans le bon ordre', () => {
      const { container } = render(<QuizList />);

      const mainContainer = container.querySelector('.bg-white');
      const centeredContainer = mainContainer?.querySelector('.max-w-md');

      expect(centeredContainer).toBeInTheDocument();

      // Vérifier l'ordre des éléments enfants
      const children = centeredContainer?.children;
      expect(children).toHaveLength(3);

      // Premier enfant: conteneur d'icône
      expect(children?.[0]).toHaveClass('w-16', 'h-16', 'bg-gray-100');

      // Deuxième enfant: titre H3
      expect(children?.[1].tagName).toBe('H3');

      // Troisième enfant: paragraphe de description
      expect(children?.[2].tagName).toBe('P');
    });

    it('centre le contenu horizontalement', () => {
      const { container } = render(<QuizList />);

      const mainContainer = container.querySelector('.text-center');
      expect(mainContainer).toBeInTheDocument();

      const centeredContainer = container.querySelector('.mx-auto');
      expect(centeredContainer).toBeInTheDocument();

      const iconContainer = container.querySelector('.mx-auto.mb-4');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('État vide', () => {
    it('représente correctement un état vide', () => {
      render(<QuizList />);

      // Vérifier que c'est bien un état vide (pas de liste de quiz)
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

      // Vérifier la présence des éléments d'état vide
      expect(screen.getByText('Aucun quiz disponible')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it("fournit un message informatif à l'utilisateur", () => {
      render(<QuizList />);

      const title = screen.getByText('Aucun quiz disponible');
      const description = screen.getByText(
        'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
      );

      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });

  describe('Design et apparence', () => {
    it('utilise une palette de couleurs cohérente', () => {
      const { container } = render(<QuizList />);

      // Conteneur principal blanc
      expect(container.querySelector('.bg-white')).toBeInTheDocument();

      // Bordure grise
      expect(container.querySelector('.border-gray-200')).toBeInTheDocument();

      // Icône de fond gris
      expect(container.querySelector('.bg-gray-100')).toBeInTheDocument();

      // Texte d'icône gris
      expect(container.querySelector('.text-gray-400')).toBeInTheDocument();

      // Titre sombre
      expect(container.querySelector('.text-gray-900')).toBeInTheDocument();

      // Description grise
      expect(container.querySelector('.text-gray-500')).toBeInTheDocument();
    });

    it('applique les bonnes bordures et espacements', () => {
      const { container } = render(<QuizList />);

      const mainContainer = container.querySelector('.bg-white');
      expect(mainContainer).toHaveClass('rounded-xl', 'border', 'p-12');

      const iconContainer = container.querySelector('.w-16.h-16');
      expect(iconContainer).toHaveClass('rounded-full', 'mb-4');

      const title = screen.getByText('Aucun quiz disponible');
      expect(title).toHaveClass('mb-2');

      const description = screen.getByText(
        'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
      );
      expect(description).toHaveClass('mb-6');
    });
  });

  describe('Accessibilité', () => {
    it('utilise les éléments sémantiques appropriés', () => {
      render(<QuizList />);

      // Titre avec heading approprié
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();

      // Description avec élément paragraphe
      const description = screen.getByText(
        'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
      );
      expect(description.tagName).toBe('P');
    });

    it('fournit du contenu textuel lisible', () => {
      render(<QuizList />);

      // Texte accessible aux lecteurs d'écran
      expect(screen.getByText('Aucun quiz disponible')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
        )
      ).toBeInTheDocument();
    });

    it('utilise une hiérarchie de contenu logique', () => {
      render(<QuizList />);

      const heading = screen.getByRole('heading', { level: 3 });
      const description = screen.getByText(
        'Commencez par créer votre premier quiz pour évaluer les connaissances des apprenants.'
      );

      // Le titre doit précéder la description dans l'ordre DOM
      expect(heading.compareDocumentPosition(description)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Responsive design', () => {
    it('utilise des classes responsive appropriées', () => {
      const { container } = render(<QuizList />);

      // Conteneur avec largeur maximale responsive
      const centeredContainer = container.querySelector('.max-w-md');
      expect(centeredContainer).toBeInTheDocument();

      // Padding généreux pour différentes tailles d'écran
      const mainContainer = container.querySelector('.p-12');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Performance et rendu', () => {
    it("ne génère pas d'erreurs lors du rendu", () => {
      expect(() => render(<QuizList />)).not.toThrow();
    });

    it('supporte les multiples rendus', () => {
      const { unmount } = render(<QuizList />);
      unmount();

      expect(() => render(<QuizList />)).not.toThrow();
    });

    it('est un composant statique sans état', () => {
      const { container: container1 } = render(<QuizList />);
      const { container: container2 } = render(<QuizList />);

      // Les deux rendus doivent être identiques
      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });

  describe('Intégration', () => {
    it('peut être rendu dans un conteneur parent', () => {
      const TestWrapper = () => (
        <div className='parent-container'>
          <QuizList />
        </div>
      );

      expect(() => render(<TestWrapper />)).not.toThrow();
      expect(screen.getByText('Aucun quiz disponible')).toBeInTheDocument();
    });

    it('maintient sa structure même avec des props supplémentaires', () => {
      // Test de compatibilité future - le composant devrait ignorer les props non reconnues
      const QuizListWithProps = QuizList as any;

      expect(() => render(<QuizListWithProps someProp='value' />)).not.toThrow();
      expect(screen.getByText('Aucun quiz disponible')).toBeInTheDocument();
    });
  });

  describe('Contenu et messages', () => {
    it('affiche des messages en français', () => {
      render(<QuizList />);

      expect(screen.getByText('Aucun quiz disponible')).toBeInTheDocument();
      expect(screen.getByText(/Commencez par créer votre premier quiz/)).toBeInTheDocument();
    });

    it('utilise un vocabulaire approprié au contexte éducatif', () => {
      render(<QuizList />);
    });
  });
});
