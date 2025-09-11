import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import InstitutionFinancierePage from '@/app/(auth)/admin/institution-financiere/page';

// Mock des composants ui
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, className, ...props }: any) => 
    <input data-testid="input" placeholder={placeholder} className={className} {...props} />
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, ...props }: any) => 
    <button data-testid="button" onClick={onClick} className={className} {...props}>
      {children}
    </button>
}));

// Mock complet des icônes lucide-react
jest.mock('lucide-react', () => ({
  PlusIcon: ({ className, ...props }: any) => <div data-testid="plus-icon" className={className} {...props} />,
  SearchIcon: ({ className, ...props }: any) => <div data-testid="search-icon" className={className} {...props} />,
  PencilIcon: ({ className, ...props }: any) => <div data-testid="pencil-icon" className={className} {...props} />,
  Trash2Icon: ({ className, ...props }: any) => <div data-testid="trash-icon" className={className} {...props} />,
}));

// Mock du composant AddInstitutionDialog
jest.mock('@/components/admin/institution-financiere/add-institution-dialog', () => ({
  AddInstitutionDialog: ({ open, onOpenChange }: any) => {
    return open ? (
      <div data-testid="add-institution-dialog">
        <button onClick={() => onOpenChange(false)}>Close Dialog</button>
      </div>
    ) : null;
  }
}));

describe('InstitutionFinancierePage - Lines 3-93 Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('covers imports and component initialization (lines 3-10)', () => {
    render(<InstitutionFinancierePage />);
    
    // Vérifier les cartes de statistiques qui testent les imports
    expect(screen.getByText('Terminés')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
    
    // Vérifier le titre de la liste
    expect(screen.getByText('Liste des institutions')).toBeInTheDocument();
    
    // Vérifier la présence du bouton d'ajout
    expect(screen.getByText('Ajouter une institut')).toBeInTheDocument();
  });

  test('covers useState hook for dialog state (lines 11-12)', () => {
    render(<InstitutionFinancierePage />);
    
    // Vérifier que le dialog n'est pas visible initialement
    expect(screen.queryByText('Ajouter une institution')).not.toBeInTheDocument();
    
    // Tester le useState hook - cliquer sur le bouton d'ajout
    const addButton = screen.getByText('Ajouter une institut');
    fireEvent.click(addButton);
    
    // Vérifier que le dialog est maintenant visible par son titre
    expect(screen.getByText('Ajouter une institution')).toBeInTheDocument();
  });

  test('covers institutions array definition (lines 14-26)', () => {
    render(<InstitutionFinancierePage />);
    
    // Vérifier la présence des institutions demo qui testent l'array
    const societyElements = screen.getAllByText('Société générale');
    expect(societyElements).toHaveLength(3);
    
    // Vérifier les types
    const banqueElements = screen.getAllByText('Banque');
    expect(banqueElements).toHaveLength(3);
    
    // Vérifier les statuts
    const actifElements = screen.getAllByText('Actif');
    expect(actifElements).toHaveLength(3);
  });

  test('covers Card components and grid layout (lines 30-50)', () => {
    render(<InstitutionFinancierePage />);
    
    // Vérifier la présence des cartes de statistiques par leur contenu
    expect(screen.getByText('Terminés')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
    
    // Vérifier les valeurs des statistiques
    expect(screen.getByText('12,350')).toBeInTheDocument();
    expect(screen.getByText('134,640.00')).toBeInTheDocument();
    
    // Vérifier les pourcentages et descriptions
    expect(screen.getByText('7,332 Lorem ipsum')).toBeInTheDocument();
    expect(screen.getByText('13% Lorem ipsum')).toBeInTheDocument();
  });

  test('covers search input and button components (lines 60-80)', () => {
    render(<InstitutionFinancierePage />);
    
    // Vérifier l'input de recherche
    const searchInput = screen.getByPlaceholderText('Rechercher...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('pl-10', 'pr-4', 'py-2', 'w-full');
    
    // Vérifier le bouton d'ajout avec ses classes CSS
    const addButton = screen.getByText('Ajouter une institut');
    expect(addButton).toHaveClass('bg-teal-500', 'hover:bg-teal-600');
  });

  test('covers table structure and headers (lines 82-93)', () => {
    render(<InstitutionFinancierePage />);
    
    // Vérifier les en-têtes du tableau
    expect(screen.getByText('Nom de l\'institut')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Vérifier que le tableau est rendu
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('w-full', 'border-collapse');
  });

  test('covers complete component rendering and all interactive elements', () => {
    render(<InstitutionFinancierePage />);
    
    // Test complet qui couvre toutes les lignes 3-93
    expect(screen.getByText('Liste des institutions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    expect(screen.getByText('Ajouter une institut')).toBeInTheDocument();
    
    // Vérifier que tous les éléments principaux sont présents
    expect(screen.getAllByText('Société générale')).toHaveLength(3);
    expect(screen.getAllByText('Banque')).toHaveLength(3);
    expect(screen.getAllByText('Actif')).toHaveLength(3);
    
    // Test de l'état avec le useState hook
    const addButton = screen.getByText('Ajouter une institut');
    fireEvent.click(addButton);
    expect(screen.getByText('Ajouter une institution')).toBeInTheDocument();
  });
});
