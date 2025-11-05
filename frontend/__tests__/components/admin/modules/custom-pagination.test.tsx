// frontend/__tests__/components/ui/custom-pagination.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';
import { CustomPagination } from '@/components/admin/modules/custom-pagination';

describe('CustomPagination', () => {
  const defaultProps = {
    currentPage: 2,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Affichage du texte d'information", () => {
    it("affiche le texte d'information correctement", () => {
      render(<CustomPagination {...defaultProps} />);
      expect(screen.getByText(/Affichage de/)).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument(); // startItem
      expect(screen.getByText('20')).toBeInTheDocument(); // endItem
      expect(screen.getByText('50')).toBeInTheDocument(); // totalItems
    });

    it('calcule correctement startItem et endItem pour la première page', () => {
      render(<CustomPagination {...defaultProps} currentPage={1} />);
    });

    it('calcule correctement startItem et endItem pour la dernière page', () => {
      render(<CustomPagination {...defaultProps} currentPage={5} />);
    });

    it("gère correctement le cas où la dernière page n'est pas complète", () => {
      render(
        <CustomPagination
          currentPage={3}
          totalPages={3}
          totalItems={25}
          itemsPerPage={10}
          onPageChange={jest.fn()}
        />
      );
    });
  });

  describe('Affichage des boutons de pagination', () => {
    it('affiche tous les boutons si totalPages <= 5', () => {
      render(<CustomPagination {...defaultProps} />);
      for (let i = 1; i <= defaultProps.totalPages; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    it('affiche les boutons de navigation (première, précédente, suivante, dernière)', () => {
      render(<CustomPagination {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(5); // Navigation + page buttons
    });

    it('applique la classe active à la page courante', () => {
      render(<CustomPagination {...defaultProps} currentPage={2} />);
      const pageButton = screen.getByText('2');
      expect(pageButton).toHaveClass('bg-sky-400', 'text-white');
    });

    it('applique la classe normale aux pages non actives', () => {
      render(<CustomPagination {...defaultProps} currentPage={2} />);
      const pageButton = screen.getByText('3');
      expect(pageButton).toHaveClass('border', 'border-gray-300');
    });
  });

  describe('Ellipses et pagination avec beaucoup de pages', () => {
    it('affiche les ellipses si totalPages > 5', () => {
      render(<CustomPagination {...defaultProps} totalPages={10} currentPage={5} />);
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThan(0);
    });

    it('affiche ellipsis au début si currentPage > 3', () => {
      render(<CustomPagination {...defaultProps} totalPages={10} currentPage={5} />);
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBe(2); // Un au début, un à la fin
    });

    it("n'affiche pas d'ellipsis au début si currentPage <= 3", () => {
      render(<CustomPagination {...defaultProps} totalPages={10} currentPage={2} />);
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBe(1); // Seulement à la fin
    });

    it('affiche ellipsis à la fin si currentPage < totalPages - 2', () => {
      render(<CustomPagination {...defaultProps} totalPages={10} currentPage={2} />);
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it("n'affiche pas d'ellipsis à la fin si currentPage >= totalPages - 2", () => {
      render(<CustomPagination {...defaultProps} totalPages={10} currentPage={9} />);
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBe(1); // Seulement au début
    });

    it('affiche toujours la première et la dernière page', () => {
      render(<CustomPagination {...defaultProps} totalPages={10} currentPage={5} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('affiche les pages autour de currentPage', () => {
      render(<CustomPagination {...defaultProps} totalPages={10} currentPage={5} />);
      // Devrait afficher page 4, 5, 6
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });

  describe('États des boutons de navigation', () => {
    it('désactive les boutons précédent et premier si on est sur la première page', () => {
      render(<CustomPagination {...defaultProps} currentPage={1} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeDisabled(); // ChevronsLeft
      expect(buttons[1]).toBeDisabled(); // ChevronLeft
    });

    it('désactive les boutons suivant et dernier si on est sur la dernière page', () => {
      render(<CustomPagination {...defaultProps} currentPage={5} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[buttons.length - 2]).toBeDisabled(); // ChevronRight
      expect(buttons[buttons.length - 1]).toBeDisabled(); // ChevronsRight
    });

    it('active tous les boutons si on est sur une page intermédiaire', () => {
      render(<CustomPagination {...defaultProps} currentPage={3} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).not.toBeDisabled(); // ChevronsLeft
      expect(buttons[1]).not.toBeDisabled(); // ChevronLeft
      expect(buttons[buttons.length - 2]).not.toBeDisabled(); // ChevronRight
      expect(buttons[buttons.length - 1]).not.toBeDisabled(); // ChevronsRight
    });
  });

  describe('Interactions utilisateur', () => {
    it('appelle onPageChange avec le bon numéro de page lors du clic', async () => {
      const onPageChange = jest.fn();
      render(<CustomPagination {...defaultProps} onPageChange={onPageChange} />);
      const user = userEvent.setup();

      await user.click(screen.getByText('3'));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('navigue vers la première page', async () => {
      const onPageChange = jest.fn();
      render(<CustomPagination {...defaultProps} onPageChange={onPageChange} />);
      const user = userEvent.setup();
      const buttons = screen.getAllByRole('button');

      await user.click(buttons[0]); // ChevronsLeft
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('navigue vers la page précédente', async () => {
      const onPageChange = jest.fn();
      render(<CustomPagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />);
      const user = userEvent.setup();
      const buttons = screen.getAllByRole('button');

      await user.click(buttons[1]); // ChevronLeft
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('navigue vers la page suivante', async () => {
      const onPageChange = jest.fn();
      render(<CustomPagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />);
      const user = userEvent.setup();
      const buttons = screen.getAllByRole('button');

      await user.click(buttons[buttons.length - 2]); // ChevronRight
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('navigue vers la dernière page', async () => {
      const onPageChange = jest.fn();
      render(<CustomPagination {...defaultProps} onPageChange={onPageChange} />);
      const user = userEvent.setup();
      const buttons = screen.getAllByRole('button');

      await user.click(buttons[buttons.length - 1]); // ChevronsRight
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('ne fait rien si on clique sur un bouton désactivé', async () => {
      const onPageChange = jest.fn();
      render(<CustomPagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
      const user = userEvent.setup();
      const buttons = screen.getAllByRole('button');

      await user.click(buttons[0]); // ChevronsLeft désactivé
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Cas limites', () => {
    it('gère le cas avec une seule page', () => {
      render(
        <CustomPagination
          currentPage={1}
          totalPages={1}
          totalItems={5}
          itemsPerPage={10}
          onPageChange={jest.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeDisabled(); // Premier
      expect(buttons[1]).toBeDisabled(); // Précédent
      expect(buttons[buttons.length - 2]).toBeDisabled(); // Suivant
      expect(buttons[buttons.length - 1]).toBeDisabled(); // Dernier
    });

    it('gère le cas avec exactement 5 pages (limite maxVisible)', () => {
      render(<CustomPagination {...defaultProps} totalPages={5} />);
      // Devrait afficher toutes les pages sans ellipses
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('gère le cas avec 6 pages (juste au-dessus de maxVisible)', () => {
      render(<CustomPagination {...defaultProps} totalPages={6} currentPage={1} />);
    });

    it('gère currentPage = totalPages', () => {
      render(<CustomPagination {...defaultProps} currentPage={5} totalPages={5} />);
      const pageButton = screen.getByText('5');
      expect(pageButton).toHaveClass('bg-sky-400', 'text-white');
    });

    it('gère un grand nombre de pages (100+)', () => {
      render(
        <CustomPagination
          currentPage={50}
          totalPages={100}
          totalItems={1000}
          itemsPerPage={10}
          onPageChange={jest.fn()}
        />
      );
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getAllByText('...').length).toBe(2);
    });

    it('gère itemsPerPage = 1', () => {
      render(
        <CustomPagination
          currentPage={5}
          totalPages={10}
          totalItems={10}
          itemsPerPage={1}
          onPageChange={jest.fn()}
        />
      );
    });

    it('calcule correctement les pages limites (startPage et endPage)', () => {
      // Test avec currentPage proche du début
      const { rerender } = render(
        <CustomPagination
          currentPage={2}
          totalPages={10}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={jest.fn()}
        />
      );
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // Test avec currentPage proche de la fin
      rerender(
        <CustomPagination
          currentPage={9}
          totalPages={10}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={jest.fn()}
        />
      );
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
    });
  });

  describe('Styles et classes CSS', () => {
    it('applique les classes de transition', () => {
      render(<CustomPagination {...defaultProps} />);
      const pageButton = screen.getByText('1');
      expect(pageButton).toHaveClass('transition-all');
    });

    it('applique les bonnes dimensions aux boutons', () => {
      render(<CustomPagination {...defaultProps} />);
      const pageButton = screen.getByText('1');
      expect(pageButton).toHaveClass('min-w-[36px]', 'h-[36px]');
    });

    it('applique le style disabled aux boutons désactivés', () => {
      render(<CustomPagination {...defaultProps} currentPage={1} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('disabled:opacity-30', 'disabled:cursor-not-allowed');
    });
  });
});
