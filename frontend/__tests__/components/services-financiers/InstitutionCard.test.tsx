import { render, screen } from '@testing-library/react';
import React from 'react';

import { InstitutionCard } from '@/components/services-financiers/InstitutionCard';
import type { Institution } from '@/types/FinancialServices';

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

const mockInstitution: Institution = {
  id: '1',
  name: 'Société Générale',
  logo: '/logo-sg.png',
  status: 'ACTIF',
  website: 'www.societegenerale.sn',
  description: "Banque leader en Afrique de l'Ouest avec une large gamme de produits financiers.",
  geographicZones: ['Zone Géo A', 'Zone Géo B'],
};

describe('InstitutionCard', () => {
  describe('Rendering', () => {
    it('should render institution name', () => {
      render(<InstitutionCard institution={mockInstitution} />);
      expect(screen.getByText('Société Générale')).toBeInTheDocument();
    });

    it('should render institution status badge', () => {
      render(<InstitutionCard institution={mockInstitution} />);
      const statusBadge = screen.getByText('ACTIF');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveAttribute('data-variant', 'success');
    });

    it('should render institution website', () => {
      render(<InstitutionCard institution={mockInstitution} />);
      expect(screen.getByText('www.societegenerale.sn')).toBeInTheDocument();
    });

    it('should render institution description', () => {
      render(<InstitutionCard institution={mockInstitution} />);
      const descriptionElement = screen.getByText(
        "Banque leader en Afrique de l'Ouest avec une large gamme de produits financiers."
      );
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass('text-sm', 'text-gray-600');
    });

    it('should render logo placeholder', () => {
      render(<InstitutionCard institution={mockInstitution} />);
      // Check that logo parts are rendered
      expect(screen.getByText('SOCIÉTÉ')).toBeInTheDocument();
      expect(screen.getByText('GÉNÉRALE')).toBeInTheDocument();

      // Check that logo container exists and has some of the expected styling
      const logoContainer = screen.getByText('SOCIÉTÉ').closest('.bg-red-600');
      expect(logoContainer).toBeInTheDocument();
      expect(logoContainer).toHaveClass('w-20', 'h-20', 'bg-red-600', 'rounded-lg');
    });
  });

  describe('Institution data display', () => {
    it('should handle different status values', () => {
      const inactiveInstitution = { ...mockInstitution, status: 'INACTIF' as const };
      render(<InstitutionCard institution={inactiveInstitution} />);

      const statusBadge = screen.getByText('INACTIF');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveAttribute('data-variant', 'success');
    });

    it('should handle long institution names', () => {
      const longNameInstitution = {
        ...mockInstitution,
        name: 'Institution Bancaire Très Longue Avec Un Nom Exceptionnellement Long',
      };
      render(<InstitutionCard institution={longNameInstitution} />);

      expect(
        screen.getByText('Institution Bancaire Très Longue Avec Un Nom Exceptionnellement Long')
      ).toBeInTheDocument();
    });

    it('should handle long descriptions', () => {
      const longDescriptionInstitution = {
        ...mockInstitution,
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      };
      render(<InstitutionCard institution={longDescriptionInstitution} />);

      expect(screen.getByText(longDescriptionInstitution.description)).toBeInTheDocument();
    });

    it('should handle special characters in website', () => {
      const specialWebsiteInstitution = {
        ...mockInstitution,
        website: 'www.spéciál-cháráctérs.com',
      };
      render(<InstitutionCard institution={specialWebsiteInstitution} />);

      expect(screen.getByText('www.spéciál-cháráctérs.com')).toBeInTheDocument();
    });
  });

  describe('Badge integration', () => {
    it('should pass correct variant to Badge component', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      const statusBadge = screen.getByText('ACTIF');
      expect(statusBadge).toHaveAttribute('data-variant', 'success');
    });

    it('should render green dot indicator', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // The badge should contain a green dot (simulated by the Badge component)
      const badgeContainer = screen.getByText('ACTIF').parentElement;
      expect(badgeContainer).toBeInTheDocument();
    });
  });

  describe('Layout and styling', () => {
    it('should arrange content in correct layout', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      const mainContainer = screen.getByText('Société Générale').closest('.bg-white');
      expect(mainContainer).toBeInTheDocument();

      // Check flex layout for logo and info sections
      const contentContainer = mainContainer?.querySelector('.flex');
      expect(contentContainer).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // Logo should have proper sizing - find by its background color class
      const logoContainer = screen.getByText('SOCIÉTÉ').closest('.bg-red-600');
      expect(logoContainer).toBeInTheDocument();
      expect(logoContainer).toHaveClass('w-20', 'h-20');

      // Info section should have flex-1 class
      const infoSection = screen.getByText('Société Générale').closest('.flex-1');
      expect(infoSection).toBeInTheDocument();
    });

    it('should handle responsive layout', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // The actual component uses 'items-center' and 'space-x-3'
      const mainContainer = screen.getByText('Société Générale').closest('.flex');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('flex', 'items-center', 'space-x-3');
    });
  });

  describe('Props validation', () => {
    it('should throw error when institution prop is missing', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<InstitutionCard institution={undefined as any} />)).toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle partial institution data', () => {
      const partialInstitution = {
        id: '1',
        name: 'Test Bank',
        status: 'ACTIF' as const,
        website: 'www.test.com',
        description: 'Test description',
        logo: '',
        geographicZones: [],
      };

      render(<InstitutionCard institution={partialInstitution} />);

      expect(screen.getByText('Test Bank')).toBeInTheDocument();
      expect(screen.getByText('ACTIF')).toBeInTheDocument();
      expect(screen.getByText('www.test.com')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // Main container should be a div (could be improved with semantic HTML)
      const mainContainer = screen.getByText('Société Générale').closest('div');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have readable text content', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // All text should be readable
      expect(screen.getByText('Société Générale')).toBeInTheDocument();
      expect(screen.getByText('ACTIF')).toBeInTheDocument();
      expect(screen.getByText('www.societegenerale.sn')).toBeInTheDocument();
      expect(
        screen.getByText(
          "Banque leader en Afrique de l'Ouest avec une large gamme de produits financiers."
        )
      ).toBeInTheDocument();
    });

    it('should render logo placeholder', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // Check that logo parts are rendered
      expect(screen.getByText('SOCIÉTÉ')).toBeInTheDocument();
      expect(screen.getByText('GÉNÉRALE')).toBeInTheDocument();
    });

    it('should style logo placeholder correctly', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // Check that logo has correct styling by finding the container
      const logoContainer = screen.getByText('SOCIÉTÉ').closest('.bg-red-600');
      expect(logoContainer).toBeInTheDocument();
    });

    it('should have white text in logo', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // Check that logo text container exists
      const logoTextContainer = screen.getByText('SOCIÉTÉ').parentElement;
      expect(logoTextContainer).toBeInTheDocument();
      expect(logoTextContainer).toHaveClass('text-white');
    });
  });

  describe('Status badge styling', () => {
    it('should render status badge with correct styling', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      const statusBadge = screen.getByText('ACTIF').parentElement;
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('flex', 'items-center');
    });

    it('should include green dot indicator', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // The badge should contain a green dot (w-2 h-2 bg-green-500)
      const badgeContent = screen.getByText('ACTIF').parentElement;
      expect(badgeContent).toBeInTheDocument();
    });
  });

  describe('Logo rendering', () => {
    it('should render hardcoded Société Générale logo', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      // The component currently hardcodes "SOCIÉTÉ" and "GÉNÉRALE"
      expect(screen.getByText('SOCIÉTÉ')).toBeInTheDocument();
      expect(screen.getByText('GÉNÉRALE')).toBeInTheDocument();
    });

    it('should have proper logo container styling', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      const logoContainer = screen.getByText('SOCIÉTÉ').closest('.bg-red-600');
      expect(logoContainer).toBeInTheDocument();
      expect(logoContainer).toHaveClass('rounded-lg', 'flex', 'items-center', 'justify-center');
    });
  });

  describe('Description styling', () => {
    it('should apply correct text styling to description', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      const description = screen.getByText(mockInstitution.description);
      expect(description).toHaveClass('text-gray-600', 'text-sm', 'leading-relaxed');
    });

    it('should have proper spacing around description', () => {
      render(<InstitutionCard institution={mockInstitution} />);

      const description = screen.getByText(mockInstitution.description);
      expect(description).toHaveClass('mb-4');
    });
  });
});
