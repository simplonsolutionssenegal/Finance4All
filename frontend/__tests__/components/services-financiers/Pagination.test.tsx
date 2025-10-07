import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Pagination } from '../../components/services-financiers/Pagination';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid='chevron-left'>‹</span>,
  ChevronRight: () => <span data-testid='chevron-right'>›</span>,
}));

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should not render when totalPages is 1 or less', () => {
      render(<Pagination {...defaultProps} totalPages={1} />);
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should render pagination when totalPages > 1', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should display current page and total pages', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByTestId('current-page')).toHaveTextContent('1');
      expect(screen.getByTestId('total-pages')).toHaveTextContent('5');
    });

    it('should display correct items range', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByText('Affichage de 1 à 10 sur 50 résultats')).toBeInTheDocument();
    });
  });

  describe('Page navigation', () => {
    it('should call onPageChange when next button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPageChange = jest.fn();
      render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);

      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPageChange = jest.fn();
      render(<Pagination {...defaultProps} currentPage={2} onPageChange={mockOnPageChange} />);

      const prevButton = screen.getByTestId('prev-page');
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should disable previous button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByTestId('prev-page');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

      const nextButton = screen.getByTestId('next-page');
      expect(nextButton).toBeDisabled();
    });

    it('should enable both buttons on middle pages', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const prevButton = screen.getByTestId('prev-page');
      const nextButton = screen.getByTestId('next-page');

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Page number buttons', () => {
    it('should render page number buttons for small page count', () => {
      render(<Pagination {...defaultProps} totalPages={3} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('should call onPageChange when page number is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPageChange = jest.fn();
      render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);

      const pageButton = screen.getByRole('button', { name: '2' });
      await user.click(pageButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should highlight current page', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);

      const currentPageButton = screen.getByRole('button', { name: '2' });
      expect(currentPageButton).toHaveClass('bg-teal-50', 'border-teal-500', 'text-teal-600');
    });

    it('should style non-current pages correctly', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      const otherPageButton = screen.getByRole('button', { name: '2' });
      expect(otherPageButton).toHaveClass('bg-white', 'border-gray-300', 'text-gray-500');
    });
  });

  describe('Ellipsis handling', () => {
    it('should show ellipsis for large page counts', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

      // Should show ellipsis before and after current page range
      const ellipsisElements = screen.getAllByText('...');
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });

    it('should not show ellipsis for small page counts', () => {
      render(<Pagination {...defaultProps} totalPages={3} />);

      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('should handle edge case with current page near start', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={2} />);

      const ellipsisElements = screen.getAllByText('...');
      // Should have ellipsis at the end
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });

    it('should handle edge case with current page near end', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={9} />);

      const ellipsisElements = screen.getAllByText('...');
      // Should have ellipsis at the beginning
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile responsiveness', () => {
    it('should show mobile navigation on small screens', () => {
      // Mock window.matchMedia for mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 640px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Pagination {...defaultProps} />);

      // Mobile version should show Previous/Next buttons
      expect(screen.getByText('Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant')).toBeInTheDocument();
    });

    it('should show desktop pagination on larger screens', () => {
      // Mock window.matchMedia for desktop viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(min-width: 641px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Pagination {...defaultProps} />);

      // Desktop version should show page numbers and results info
      expect(screen.getByText(/Affichage de/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    });
  });

  describe('Items calculation', () => {
    it('should calculate correct start and end items for first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} itemsPerPage={10} totalItems={50} />);

      expect(screen.getByText('Affichage de 1 à 10 sur 50 résultats')).toBeInTheDocument();
    });

    it('should calculate correct start and end items for middle page', () => {
      render(<Pagination {...defaultProps} currentPage={3} itemsPerPage={10} totalItems={50} />);

      expect(screen.getByText('Affichage de 21 à 30 sur 50 résultats')).toBeInTheDocument();
    });

    it('should handle last page with fewer items', () => {
      render(<Pagination {...defaultProps} currentPage={5} itemsPerPage={10} totalItems={47} />);

      expect(screen.getByText('Affichage de 41 à 47 sur 47 résultats')).toBeInTheDocument();
    });

    it('should handle edge case with zero total items', () => {
      render(<Pagination {...defaultProps} totalItems={0} />);

      expect(screen.getByText('Affichage de 1 à 0 sur 0 résultats')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Pagination {...defaultProps} />);

      const nav = screen.getByLabelText('Pagination');
      expect(nav).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<Pagination {...defaultProps} />);

      const pageButtons = screen.getAllByRole('button');
      expect(pageButtons.length).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />);

      // Tab to first page button
      await user.tab();
      const firstPageButton = screen.getByRole('button', { name: '1' });
      expect(firstPageButton).toHaveFocus();

      // Tab to next button
      await user.tab();
      const nextButton = screen.getByTestId('next-page');
      expect(nextButton).toHaveFocus();
    });
  });

  describe('Error handling', () => {
    it('should handle invalid current page gracefully', () => {
      render(<Pagination {...defaultProps} currentPage={999} totalPages={5} />);

      // Should still render without crashing
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should handle zero total pages gracefully', () => {
      render(<Pagination {...defaultProps} totalPages={0} />);

      // Should not render pagination
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should handle negative current page gracefully', () => {
      render(<Pagination {...defaultProps} currentPage={-1} />);

      // Should still render without crashing
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Page number generation', () => {
    it('should generate correct page numbers for small range', () => {
      render(<Pagination {...defaultProps} totalPages={3} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('should generate correct page numbers for large range', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

      // Should show: 1 ... 4 5 6 ... 10
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();

      const ellipsisElements = screen.getAllByText('...');
      expect(ellipsisElements.length).toBe(2);
    });

    it('should handle boundary conditions correctly', () => {
      render(<Pagination {...defaultProps} totalPages={7} currentPage={1} />);

      // Should show: 1 2 3 ... 7
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();

      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('Callback functions', () => {
    it('should call onPageChange with correct page number', async () => {
      const user = userEvent.setup();
      const mockOnPageChange = jest.fn();
      render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);

      const pageButton = screen.getByRole('button', { name: '3' });
      await user.click(pageButton);

      expect(mockOnPageChange).toHaveBeenCalledTimes(1);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should not call onPageChange for disabled buttons', async () => {
      const user = userEvent.setup();
      const mockOnPageChange = jest.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={mockOnPageChange} />);

      const prevButton = screen.getByTestId('prev-page');
      await user.click(prevButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('should handle rapid clicking gracefully', async () => {
      const user = userEvent.setup();
      const mockOnPageChange = jest.fn();
      render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);

      const nextButton = screen.getByTestId('next-page');

      // Click rapidly multiple times
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Should only call for enabled clicks
      expect(mockOnPageChange).toHaveBeenCalledTimes(2); // First two clicks should work
    });
  });

  describe('Styling and CSS classes', () => {
    it('should apply correct CSS classes to container', () => {
      render(<Pagination {...defaultProps} />);

      const container = screen.getByTestId('pagination').closest('div');
      expect(container).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'bg-white',
        'px-4',
        'py-3',
        'border-t',
        'border-gray-200',
        'sm:px-6'
      );
    });

    it('should apply correct CSS classes to page buttons', () => {
      render(<Pagination {...defaultProps} />);

      const pageButton = screen.getByRole('button', { name: '1' });
      expect(pageButton).toHaveClass(
        'relative',
        'inline-flex',
        'items-center',
        'px-4',
        'py-2',
        'border',
        'text-sm',
        'font-medium'
      );
    });

    it('should apply disabled styles correctly', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByTestId('prev-page');
      expect(prevButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle single page scenario', () => {
      render(<Pagination {...defaultProps} totalPages={1} totalItems={5} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should handle very large page counts', () => {
      render(<Pagination {...defaultProps} totalPages={1000} currentPage={500} />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();

      // Should show ellipsis and relevant pages
      const ellipsisElements = screen.getAllByText('...');
      expect(ellipsisElements.length).toBe(2);
    });

    it('should handle zero items per page gracefully', () => {
      render(<Pagination {...defaultProps} itemsPerPage={0} totalItems={50} />);

      // This might cause issues in real implementation, but should not crash
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should handle mismatched props gracefully', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={5} />);

      // Should still render without crashing
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });
});
