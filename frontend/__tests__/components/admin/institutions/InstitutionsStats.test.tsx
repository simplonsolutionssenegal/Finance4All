import { render, screen } from '@testing-library/react';

import InstitutionsStats from '@/components/admin/institutions/InstitutionsStats';
import { useGetInstitutions } from '@/hooks/institution/useGetInstitutions';
import { InstitutionStatus } from '@/types/Institution';

// Mock du hook useGetInstitutions
jest.mock('@/hooks/institution/useGetInstitutions');

// Mock des icônes Lucide utilisés par le composant
jest.mock('lucide-react', () => ({
  Building2: (props: any) => <div data-testid='building2-icon' {...props} />,
  CheckCircle2: (props: any) => <div data-testid='check-circle-icon' {...props} />,
  AlertCircle: (props: any) => <div data-testid='alert-circle-icon' {...props} />,
  Archive: (props: any) => <div data-testid='archive-icon' {...props} />,
  Settings: (props: any) => <div data-testid='settings-icon' {...props} />,
}));

const mockUseGetInstitutions = useGetInstitutions as jest.MockedFunction<typeof useGetInstitutions>;

describe('InstitutionsStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering avec données vides par défaut', () => {
    it('rend sans crash quand aucune donnée', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('rend les 5 cartes de stats', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.bg-white');
      expect(cards.length).toBe(5);
    });

    it('affiche tous les titres de cartes', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Actives')).toBeInTheDocument();
      expect(screen.getByText('Inactives')).toBeInTheDocument();
      expect(screen.getByText('Archivées')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('affiche 0 pour toutes les stats sans institutions', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const values = screen.getAllByText('0');
      expect(values.length).toBe(5);
    });
  });

  describe('Calcul des données et affichage', () => {
    it('calcule le total depuis pagination quand disponible', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.ACTIVE, services: [] },
        ],
        pagination: { total: 150, page: 1, limit: 10, totalPages: 15 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it("calcule le total depuis la longueur d'institutions si pas de pagination", () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.INACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.PENDING, services: [] },
        ],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('compte correctement les actives', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.INACTIVE, services: [] },
        ],
        pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('compte correctement les inactives', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.INACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.INACTIVE, services: [] },
        ],
        pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('compte correctement les en attente', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.PENDING, services: [] },
          { id: '2', status: InstitutionStatus.ACTIVE, services: [] },
        ],
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const title = screen.getByText('En attente');
      const valueEl = title.previousElementSibling as HTMLElement; // la valeur est juste avant le titre
      expect(valueEl).toHaveTextContent('1');
    });

    it('affiche toujours 0 pour Archivées', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: [] }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const title = screen.getByText('Archivées');
      const valueEl = title.previousElementSibling as HTMLElement;
      expect(valueEl).toHaveTextContent('0');
    });
  });

  describe('Services (tolérance)', () => {
    it('gère les institutions sans propriété services', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE },
          { id: '2', status: InstitutionStatus.ACTIVE },
        ],
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      expect(() => render(<InstitutionsStats />)).not.toThrow();
    });

    it('gère services = null', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: null }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      expect(() => render(<InstitutionsStats />)).not.toThrow();
    });

    it('gère services = []', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: [] }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      expect(() => render(<InstitutionsStats />)).not.toThrow();
    });
  });

  describe('Rendu des icônes', () => {
    it('rend Building2 pour la carte Total', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('building2-icon')).toBeInTheDocument();
    });

    it('rend CheckCircle2 pour la carte Actives', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('rend AlertCircle pour la carte Inactives', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('rend Archive pour la carte Archivées', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
    });

    it('rend Settings pour la carte En attente', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });
  });

  describe('Style & layout', () => {
    it('utilise une grille responsive', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-5',
        'gap-4' // mis à jour (était gap-5)
      );
    });

    it('badge couleurs: Total (hex classes)', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const totalTitle = screen.getByText('Total');
      const iconContainer = totalTitle.previousElementSibling
        ?.previousElementSibling as HTMLElement;
      expect(iconContainer).toHaveClass('bg-[#6EC1E41A]', 'text-[#6EC1E4]');
    });

    it('badge couleurs: Actives', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const t = screen.getByText('Actives');
      const el = t.previousElementSibling?.previousElementSibling as HTMLElement;
      expect(el).toHaveClass('bg-[#16A34A1A]', 'text-[#16A34A]');
    });

    it('badge couleurs: Inactives', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const t = screen.getByText('Inactives');
      const el = t.previousElementSibling?.previousElementSibling as HTMLElement;
      expect(el).toHaveClass('bg-[#F59E0B1A]', 'text-[#F59E0B]');
    });

    it('badge couleurs: Archivées', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const t = screen.getByText('Archivées');
      const el = t.previousElementSibling?.previousElementSibling as HTMLElement;
      expect(el).toHaveClass('bg-[#E9ECEF]', 'text-[#6C757D]');
    });

    it('badge couleurs: En attente', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const t = screen.getByText('En attente');
      const el = t.previousElementSibling?.previousElementSibling as HTMLElement;
      expect(el).toHaveClass('bg-[#F3E8FF]', 'text-[#8200DB]');
    });

    it('carte avec ombre et conteneur attendu', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.rounded-2xl.bg-white');
      expect(cards.length).toBe(5);
      for (const card of Array.from(cards)) {
        expect(card).toHaveClass('relative', 'overflow-hidden');
      }
    });

    it("style du conteneur d'icône (h-11 w-11)", () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const iconContainers = container.querySelectorAll('.h-11.w-11.rounded-xl');
      expect(iconContainers.length).toBe(5);
    });

    it('style du texte valeur (text-4xl + classes)', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const values = container.querySelectorAll(
        '.text-4xl.leading-none.text-secondary-300.tracking-tight'
      );
      expect(values.length).toBe(5);
    });

    it('style du titre (text-sm + classes)', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const titles = container.querySelectorAll(
        '.text-sm.font-normal.text-tertiary-400.text-muted-foreground.tracking-wide'
      );
      expect(titles.length).toBe(5);
    });
  });

  describe('Cas limites & scénarios complexes', () => {
    it('gère un mix de statuts', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [
          { id: '1', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '2', status: InstitutionStatus.INACTIVE, services: [] },
          { id: '3', status: InstitutionStatus.PENDING, services: [] },
          { id: '4', status: InstitutionStatus.ACTIVE, services: [] },
          { id: '5', status: InstitutionStatus.PENDING, services: [] },
        ],
        pagination: { total: 5, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const totalValue = screen.getByText('Total').previousElementSibling as HTMLElement;
      expect(totalValue).toHaveTextContent('5');
      const activesValue = screen.getByText('Actives').previousElementSibling as HTMLElement;
      expect(activesValue).toHaveTextContent('2');
      const pendingValue = screen.getByText('En attente').previousElementSibling as HTMLElement;
      expect(pendingValue).toHaveTextContent('2');
      const inactivesValue = screen.getByText('Inactives').previousElementSibling as HTMLElement;
      expect(inactivesValue).toHaveTextContent('1');
    });

    it('gère les grands nombres', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: new Array(100).fill(null).map((_, i) => ({
          id: `${i}`,
          status: InstitutionStatus.ACTIVE,
          services: [],
        })),
        pagination: { total: 9999, page: 1, limit: 100, totalPages: 100 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('gère pagination total = 0', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const values = screen.getAllByText('0');
      expect(values.length).toBe(5);
    });

    it('rend correctement quand pagination = null', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [{ id: '1', status: InstitutionStatus.ACTIVE, services: [] }],
        pagination: null,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const totalValue = screen.getByText('Total').previousElementSibling as HTMLElement;
      expect(totalValue).toHaveTextContent('1');
    });
  });

  describe('Structure du composant', () => {
    it('rend les cartes dans le bon ordre', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      const titles = screen.getAllByText(/Total|Actives|Inactives|Archivées|En attente/);
      expect(titles[0]).toHaveTextContent('Total');
      expect(titles[1]).toHaveTextContent('Actives');
      expect(titles[2]).toHaveTextContent('Inactives');
      expect(titles[3]).toHaveTextContent('Archivées');
      expect(titles[4]).toHaveTextContent('En attente');
    });

    it('chaque carte a une clé unique (contenu distinct)', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<InstitutionsStats />);
      const cards = container.querySelectorAll('.bg-white');
      const keys = Array.from(cards).map(card => card.textContent);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(5);
    });
  });

  describe('Intégration du hook', () => {
    it('appelle useGetInstitutions avec les bons paramètres', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(mockUseGetInstitutions).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it("n'appelle le hook qu'une seule fois", () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        pagination: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<InstitutionsStats />);
      expect(mockUseGetInstitutions).toHaveBeenCalledTimes(1);
    });
  });
});
