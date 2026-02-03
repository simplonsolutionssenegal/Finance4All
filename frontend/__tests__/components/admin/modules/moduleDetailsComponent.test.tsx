import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useLoader } from '@/contexts/LoaderContext';
import { useGetModuleById } from '@/hooks/module/useGetModuleById';
import ModuleDetailsComponent from '@/components/admin/modules/moduleDetailsComponent';

// --- mocks Next ---
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt ?? ''} {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// --- mocks hooks ---
jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

jest.mock('@/hooks/module/useGetModuleById', () => ({
  useGetModuleById: jest.fn(),
}));

// --- mocks constants ---
jest.mock('@/lib/constants/module-constants', () => ({
  DIFFICULTY_LABELS: {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  },
  DIFFICULTY_COLORS: {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-blue-100 text-blue-800',
    ADVANCED: 'bg-orange-100 text-orange-800',
    EXPERT: 'bg-red-100 text-red-800',
  },
  THEMATIC_LABELS: {
    FINANCIAL_EDUCATION: 'Éducation financière',
  },
  THEMATIC_ICONS: {
    FINANCIAL_EDUCATION: '💰',
  },
}));

// --- mock Tabs (comportement minimal: switch via onValueChange) ---
jest.mock('@/components/ui/tabs', () => {
  const React = require('react');
  const Ctx = React.createContext({ value: '', onValueChange: (_v: string) => {} });

  function Tabs({ value, defaultValue, onValueChange, children }: any) {
    const current = value ?? defaultValue;
    return React.createElement(
      Ctx.Provider,
      { value: { value: current, onValueChange } },
      children
    );
  }

  function TabsList({ children }: any) {
    return <div>{children}</div>;
  }

  function TabsTrigger({ value, children }: any) {
    const ctx = React.useContext(Ctx);
    return (
      <button onClick={() => ctx.onValueChange(value)} aria-label={`tab-${value}`}>
        {children}
      </button>
    );
  }

  function TabsContent({ value, children }: any) {
    const ctx = React.useContext(Ctx);
    if (ctx.value !== value) return null;
    return <div>{children}</div>;
  }

  return { Tabs, TabsList, TabsTrigger, TabsContent };
});

// --- mock children components (pour contrôler open/onCreated/onEdit etc.) ---
jest.mock('@/components/admin/modules/lesson-dialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='lesson-dialog' data-open={props.open ? '1' : '0'}>
      <button onClick={props.onCreated}>lesson-created</button>
      <button onClick={() => props.onOpenChange(false)}>lesson-close</button>
    </div>
  ),
}));

jest.mock('@/components/admin/modules/quiz-dialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='quiz-dialog' data-open={props.open ? '1' : '0'}>
      <button onClick={props.onCreated}>quiz-created</button>
      <button onClick={() => props.onOpenChange(false)}>quiz-close</button>
    </div>
  ),
}));

jest.mock('@/components/admin/modules/lesson-list', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='lesson-list'>
      <div>lessons:{props.lessons?.length ?? 0}</div>
      <button onClick={props.onCreate}>call-onCreate</button>
      <button onClick={() => props.onEdit(props.lessons?.[0])}>call-onEdit</button>
    </div>
  ),
}));

jest.mock('@/components/admin/modules/quiz-list', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid='quiz-list'>quizzes:{props.quizzes?.length ?? 0}</div>,
}));

describe('ModuleDetailsComponent', () => {
  const useLoaderMock = useLoader as unknown as jest.Mock;
  const useGetModuleByIdMock = useGetModuleById as unknown as jest.Mock;

  const showLoader = jest.fn();
  const hideLoader = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });
  });
  function baseModule(overrides?: Partial<any>) {
    const quizzes = [
      {
        id: 'q1',
        title: 'Q1',
        description: 'D',
        status: 'DRAFT',
        scoreMinimum: 50,
        nombreTentatives: 1,
        questions: [],
        totalPoints: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      id: 'm1',
      title: 'Mon module',
      description: 'Desc',
      imageUrl: 'https://img.test/x.png',
      thematics: ['FINANCIAL_EDUCATION'],
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 120,
      status: 'PUBLISHED',
      lessons: [
        {
          id: 'l1',
          title: 'L1',
          description: 'D',
          duration: 10,
          order: 2,
          status: 'DRAFT',
          chapters: [],
          chaptersCount: 0,
          quizzes: [], // ⭐ AJOUT : quizzes de la leçon
        },
        {
          id: 'l2',
          title: 'L2',
          description: 'D',
          duration: 45,
          order: 1,
          status: 'PUBLISHED',
          chapters: [],
          chaptersCount: 0,
          quizzes: [], // ⭐ AJOUT : quizzes de la leçon
        },
      ],
      quizzes, // Quizzes du module uniquement
      quizzesGlobal: quizzes, // ⭐ AJOUT : Tous les quizzes (module + leçons + chapitres)
      ...overrides,
    };
  }
  it('should render error UI when isError=true', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    expect(screen.getByText('Erreur lors du chargement du module.')).toBeInTheDocument();
    expect(screen.getAllByText(/Retour/)[0]).toBeInTheDocument();
    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(showLoader).not.toHaveBeenCalled();
  });

  it('should render "Module introuvable" when module is undefined and isError=false', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    expect(screen.getByText('Module introuvable')).toBeInTheDocument();
    expect(hideLoader).toHaveBeenCalledTimes(1);
  });

  it('should call showLoader when isLoading=true and hideLoader when isLoading=false (rerender)', () => {
    const refetch = jest.fn();

    useGetModuleByIdMock.mockReturnValue({
      module: undefined,
      isLoading: true,
      isError: false,
      refetch,
    });

    const { rerender } = render(<ModuleDetailsComponent moduleId='m1' />);
    expect(showLoader).toHaveBeenCalledTimes(1);

    useGetModuleByIdMock.mockReturnValue({
      module: baseModule(),
      isLoading: false,
      isError: false,
      refetch,
    });

    rerender(<ModuleDetailsComponent moduleId='m1' />);
    expect(hideLoader).toHaveBeenCalledTimes(1);
  });

  it('should render main UI, sort lessons, compute duration from lessons, open dialogs, call refetch via onCreated, and call onEdit', () => {
    const refetch = jest.fn();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    useGetModuleByIdMock.mockReturnValue({
      module: baseModule(),
      isLoading: false,
      isError: false,
      refetch,
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    // Header (textes uniques)
    expect(screen.getByText('Mon module')).toBeInTheDocument();
    expect(screen.getByText('Éducation financière')).toBeInTheDocument();
    expect(screen.getByText('Débutant')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();

    // ✅ Ne JAMAIS faire getByText('2') si ça peut apparaître plusieurs fois
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // totalLessons
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // quizCount (peut apparaître plusieurs fois)

    // Durée: 10 + 45 = 55 => "55min"
    expect(screen.getByText('55min')).toBeInTheDocument();

    // LessonList mock (par défaut sur l'onglet lessons)
    expect(screen.getByTestId('lesson-list')).toHaveTextContent('lessons:2');

    // Open lesson dialog
    expect(screen.getByTestId('lesson-dialog')).toHaveAttribute('data-open', '0');
    fireEvent.click(screen.getByText('Nouvelle leçon'));
    expect(screen.getByTestId('lesson-dialog')).toHaveAttribute('data-open', '1');

    // Close lesson dialog
    fireEvent.click(screen.getByText('lesson-close'));
    expect(screen.getByTestId('lesson-dialog')).toHaveAttribute('data-open', '0');

    // Switch to quiz tab
    expect(screen.getByTestId('quiz-dialog')).toHaveAttribute('data-open', '0');
    fireEvent.click(screen.getByLabelText('tab-quiz'));

    fireEvent.click(screen.getByText('Nouveau quiz'));
    expect(screen.getByTestId('quiz-dialog')).toHaveAttribute('data-open', '1');

    // onCreated -> refetch()
    fireEvent.click(screen.getByText('quiz-created'));
    expect(refetch).toHaveBeenCalledTimes(1);

    // ✅ Revenir à l'onglet lessons avant d'interagir avec LessonList
    fireEvent.click(screen.getByLabelText('tab-lessons'));

    // Cover callbacks LessonList
    fireEvent.click(screen.getByText('call-onCreate'));
    expect(screen.getByTestId('lesson-dialog')).toHaveAttribute('data-open', '1');

    // Close lesson dialog avant d'appeler onEdit
    fireEvent.click(screen.getByText('lesson-close'));

    fireEvent.click(screen.getByText('call-onEdit'));
    expect(consoleSpy).toHaveBeenCalledWith('edit lesson', expect.objectContaining({ id: 'l2' }));

    // ✅ Test onCreated pour lesson dialog
    fireEvent.click(screen.getByText('lesson-created'));
    expect(refetch).toHaveBeenCalledTimes(2); // 1 quiz + 1 lesson

    consoleSpy.mockRestore();
  });

  it('should use estimatedDuration when there are no lessons (totalLessons=0)', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: baseModule({ lessons: [], estimatedDuration: 120 }),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    expect(screen.getByText('120min')).toBeInTheDocument();
  });

  it('should show emoji fallback when imageUrl is null and fallback thematic label/icon when thematics is empty', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: baseModule({ imageUrl: null, thematics: [] }),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    // Fallback label and icon
    expect(screen.getByText('Thématique')).toBeInTheDocument();
    expect(screen.getByText('📘')).toBeInTheDocument();
  });

  it.each([
    ['PUBLISHED', 'bg-emerald-100'],
    ['DRAFT', 'bg-slate-100'],
    ['ARCHIVED', 'bg-amber-100'],
    ['SCHEDULED', 'bg-indigo-100'],
    ['UNKNOWN', 'bg-slate-100'], // default
  ])(
    'should render status badge classes for %s (covers statusBadge switch)',
    (status, expectedClassPart) => {
      useGetModuleByIdMock.mockReturnValue({
        module: baseModule({ status }),
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      render(<ModuleDetailsComponent moduleId='m1' />);

      const badge = screen.getByText(String(status));
      expect(badge.className).toContain(expectedClassPart);
    }
  );

  it('should switch tabs and render quiz content', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: baseModule(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    // default lessons tab -> lesson list visible
    expect(screen.getByTestId('lesson-list')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-list')).not.toBeInTheDocument();

    // switch to quiz tab
    fireEvent.click(screen.getByLabelText('tab-quiz'));

    expect(screen.getByTestId('quiz-list')).toBeInTheDocument();
    expect(screen.queryByTestId('lesson-list')).not.toBeInTheDocument();
  });
});
