import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock pour Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin/institution-financiere',
}));

// Mock pour l'API
jest.mock('@/lib/api/institutions', () => ({
  fetchInstitutions: jest.fn(() => 
    Promise.resolve({
      institutions: [
        {
          id: '1',
          nom: 'Test Institution',
          type: 'Banque',
          statut: 'Actif',
          siteWeb: 'https://test.com',
        },
      ],
      total: 1,
    })
  ),
}));

// Test simple pour vérifier que Jest fonctionne
describe('Basic Test Setup', () => {
  it('should run tests correctly', () => {
    expect(true).toBe(true);

  });

  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>;
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});