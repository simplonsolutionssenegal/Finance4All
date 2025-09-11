import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock des composants UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

// Mock de la dialog
jest.mock('@/components/admin/institution-financiere/add-institution-dialog', () => ({
  AddInstitutionDialog: ({ open, onOpenChange }: any) => (
    <div data-testid="add-institution-dialog" data-open={open}>
      Dialog Mock
    </div>
  ),
}));

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  PlusIcon: () => <div data-testid="plus-icon">+</div>,
  SearchIcon: () => <div data-testid="search-icon">🔍</div>,
  PencilIcon: () => <div data-testid="pencil-icon">✏️</div>,
  Trash2Icon: () => <div data-testid="trash-icon">🗑️</div>,
}));

describe('InstitutionFinancierePage', () => {
  it('should render the page with all main elements', () => {
    const InstitutionFinancierePage = require('@/app/(auth)/admin/institution-financiere/page').default;
    
    render(<InstitutionFinancierePage />);
    
    // Vérifier le titre principal
    expect(screen.getByText('Liste des institutions')).toBeInTheDocument();
    
    // Vérifier les cartes de statistiques
    expect(screen.getAllByTestId('card')).toHaveLength(2);
    expect(screen.getByText('Terminés')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
    
    // Vérifier la barre de recherche
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    
    // Vérifier le bouton d'ajout
    expect(screen.getByText('Ajouter une institut')).toBeInTheDocument();
    
    // Vérifier les en-têtes du tableau
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Vérifier les données de démo
    expect(screen.getAllByText('Société générale')).toHaveLength(3);
    expect(screen.getAllByText('Banque')).toHaveLength(3);
    expect(screen.getAllByText('Actif')).toHaveLength(3);
  });

  it('should have edit and delete buttons for each institution', () => {
    const InstitutionFinancierePage = require('@/app/(auth)/admin/institution-financiere/page').default;
    
    render(<InstitutionFinancierePage />);
    
    // Vérifier qu'il y a 3 boutons d'édition et 3 boutons de suppression
    expect(screen.getAllByTestId('pencil-icon')).toHaveLength(3);
    expect(screen.getAllByTestId('trash-icon')).toHaveLength(3);
  });

  it('should render the add institution dialog', () => {
    const InstitutionFinancierePage = require('@/app/(auth)/admin/institution-financiere/page').default;
    
    render(<InstitutionFinancierePage />);
    
    // Vérifier que la dialog est présente
    expect(screen.getByTestId('add-institution-dialog')).toBeInTheDocument();
  });
});
