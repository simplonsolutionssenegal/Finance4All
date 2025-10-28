// __tests__/app/(auth)/modules/page.test.tsx
import { render, screen } from '@testing-library/react';

import ModulesPage from '@/app/(auth)/modules/page';
import { getModules } from '@/lib/api/modules';
import '@testing-library/jest-dom';

// Mock des dépendances
jest.mock('@/lib/api/modules');

jest.mock('@/components/admin/modules/modules-page-content', () => {
  return function MockModulesPageContent({ initialModules }: any) {
    return (
      <div data-testid='modules-page-content'>
        <h1>Modules de formation</h1>
        <div data-testid='modules-list'>
          {initialModules.map((module: any) => (
            <div key={module.id} data-testid={`module-${module.id}`}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
          ))}
        </div>
        {initialModules.length === 0 && <div data-testid='empty-state'>Aucun module trouvé</div>}
      </div>
    );
  };
});

describe('ModulesPage', () => {
  const mockModules = [
    {
      id: 1,
      title: 'Module de Finance Personnelle',
      description: 'Apprenez les bases de la finance personnelle',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 60,
      thematics: ['FINANCIAL_EDUCATION'],
    },
    {
      id: 2,
      title: "Module d'Investissement",
      description: "Découvrez les stratégies d'investissement",
      difficultyLevel: 'INTERMEDIATE',
      estimatedDuration: 90,
      thematics: ['INVESTMENT'],
    },
    {
      id: 3,
      title: 'Module de Développement Personnel',
      description: 'Développez vos compétences personnelles',
      difficultyLevel: 'ADVANCED',
      estimatedDuration: 120,
      thematics: ['PERSONAL_DEVELOPMENT'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rend la page avec le composant ModulesPageContent', async () => {
    (getModules as jest.Mock).mockResolvedValue(mockModules);

    render(await ModulesPage());

    expect(screen.getByTestId('modules-page-content')).toBeInTheDocument();
  });

  it('affiche le titre de la page', async () => {
    (getModules as jest.Mock).mockResolvedValue(mockModules);

    render(await ModulesPage());

    expect(screen.getByText('Modules de formation')).toBeInTheDocument();
  });

  it('appelle getModules au chargement', async () => {
    (getModules as jest.Mock).mockResolvedValue(mockModules);

    render(await ModulesPage());

    expect(getModules).toHaveBeenCalledTimes(1);
  });

  it('passe les modules récupérés à ModulesPageContent', async () => {
    (getModules as jest.Mock).mockResolvedValue(mockModules);

    render(await ModulesPage());

    const modulesList = screen.getByTestId('modules-list');
    expect(modulesList).toBeInTheDocument();

    mockModules.forEach(module => {
      expect(screen.getByTestId(`module-${module.id}`)).toBeInTheDocument();
      expect(screen.getByText(module.title)).toBeInTheDocument();
      expect(screen.getByText(module.description)).toBeInTheDocument();
    });
  });

  it("affiche l'état vide quand il n'y a pas de modules", async () => {
    (getModules as jest.Mock).mockResolvedValue([]);

    render(await ModulesPage());

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Aucun module trouvé')).toBeInTheDocument();
  });

  it("propage les erreurs de l'API getModules", async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getModules as jest.Mock).mockRejectedValue(new Error('Erreur de récupération des modules'));

    await expect(ModulesPage()).rejects.toThrow('Erreur de récupération des modules');

    consoleError.mockRestore();
  });

  it('gère les modules avec des propriétés manquantes', async () => {
    const incompleteModules = [
      { id: 1, title: 'Module incomplet' },
      { id: 2, title: 'Autre module', description: 'Description uniquement' },
    ];

    (getModules as jest.Mock).mockResolvedValue(incompleteModules);

    render(await ModulesPage());

    expect(screen.getByTestId(`module-1`)).toBeInTheDocument();
    expect(screen.getByTestId(`module-2`)).toBeInTheDocument();
    expect(screen.getByText('Module incomplet')).toBeInTheDocument();
    expect(screen.getByText('Description uniquement')).toBeInTheDocument();
  });

  it('fonctionne avec un grand nombre de modules', async () => {
    const manyModules = Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      title: `Module ${index + 1}`,
      description: `Description du module ${index + 1}`,
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 60,
      thematics: ['FINANCIAL_EDUCATION'],
    }));

    (getModules as jest.Mock).mockResolvedValue(manyModules);

    render(await ModulesPage());

    expect(screen.getByTestId('modules-list')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^module-\d+$/)).toHaveLength(50);
  });
});
