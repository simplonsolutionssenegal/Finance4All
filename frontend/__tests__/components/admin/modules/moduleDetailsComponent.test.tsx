import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import ModuleDetailsComponent from '@/components/admin/modules/moduleDetailsComponent';
import { useLoader } from '@/contexts/LoaderContext';
import { useGetModuleById } from '@/hooks/module/useGetModuleById';
import { useMediaUrl } from '@/hooks/module/media/useMedia';
import { useDeleteLesson } from '@/hooks/lesson/useDeleteLesson';
import { useDeleteQuiz } from '@/hooks/quiz/useDeleteQuiz';
import ModuleDetailsComponent from '@/components/admin/modules/moduleDetailsComponent';

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line jsx-a11y/alt-text
  default: (props: any) => <div data-testid='next-image' {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(),
}));

jest.mock('@/hooks/module/useGetModuleById', () => ({
  useGetModuleById: jest.fn(),
}));

jest.mock('@/hooks/module/media/useMedia', () => ({
  useMediaUrl: jest.fn(),
}));

jest.mock('@/hooks/module/media/useMedia', () => ({
  useMediaUrl: jest.fn(),
}));

jest.mock('@/hooks/lesson/useDeleteLesson', () => ({
  useDeleteLesson: jest.fn(),
}));

jest.mock('@/hooks/quiz/useDeleteQuiz', () => ({
  useDeleteQuiz: jest.fn(),
}));

jest.mock('@/lib/constants/module-constants', () => ({
  DIFFICULTY_LABELS: {
    BEGINNER: 'Debutant',
  },
  DIFFICULTY_COLORS: {
    BEGINNER: 'bg-green-100 text-green-800',
  },
}));

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

jest.mock('@/components/admin/modules/lesson-dialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='lesson-dialog' data-open={props.open ? '1' : '0'}>
      <button onClick={props.onDone}>lesson-done</button>
      <button onClick={() => props.onOpenChange(false)}>lesson-close</button>
    </div>
  ),
}));

jest.mock('@/components/admin/modules/quiz-dialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='quiz-dialog' data-open={props.open ? '1' : '0'}>
      <button onClick={props.onDone}>quiz-done</button>
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
      <button onClick={() => props.onDelete(props.lessons?.[0])}>call-onDelete</button>
    </div>
  ),
}));

jest.mock('@/components/admin/modules/quiz-list', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='quiz-list'>
      <div>quizzes:{props.quizzes?.length ?? 0}</div>
      <button onClick={() => props.onDelete?.(props.quizzes?.[0])}>call-onDeleteQuiz</button>
    </div>
  ),
}));

jest.mock('@/components/admin/modules/module-edit-dialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid='module-edit-dialog' data-open={props.open ? '1' : '0'}>
      <button onClick={props.onUpdated}>module-updated</button>
      <button onClick={() => props.onOpenChange(false)}>module-edit-close</button>
    </div>
  ),
}));

describe('ModuleDetailsComponent', () => {
  const useLoaderMock = useLoader as unknown as jest.Mock;
  const useGetModuleByIdMock = useGetModuleById as unknown as jest.Mock;
  const useMediaUrlMock = useMediaUrl as unknown as jest.Mock;
  const useDeleteLessonMock = useDeleteLesson as unknown as jest.Mock;
  const useDeleteQuizMock = useDeleteQuiz as unknown as jest.Mock;

  const showLoader = jest.fn();
  const hideLoader = jest.fn();
  const deleteLesson = jest.fn();
  const deleteQuiz = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useLoaderMock.mockReturnValue({ showLoader, hideLoader });
    useDeleteLessonMock.mockReturnValue({ deleteLesson });
    useDeleteQuizMock.mockReturnValue({ deleteQuiz });
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
      imageMediaId: 'img-1',
      thematics: 'Education financiere',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 120,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lessons: [
        {
          id: 'l1',
          title: 'L1',
          description: 'D',
          duration: 10,
          order: 2,
          status: 'DRAFT',
          chapters: [],
          quizzes: [],
        },
        {
          id: 'l2',
          title: 'L2',
          description: 'D',
          duration: 45,
          order: 1,
          status: 'PUBLISHED',
          chapters: [],
          quizzes: [],
        },
      ],
      quizzesGlobal: [quizzes[0], { ...quizzes[0] }],
      ...overrides,
    };
  }

  it('renders error UI when isError=true', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    useMediaUrlMock.mockReturnValue({ url: null });

    render(<ModuleDetailsComponent moduleId='m1' />);

    expect(screen.getByText('Erreur lors du chargement du module.')).toBeInTheDocument();
    expect(screen.getAllByText(/Retour/)[0]).toBeInTheDocument();
    expect(hideLoader).toHaveBeenCalledTimes(1);
    expect(showLoader).not.toHaveBeenCalled();
  });

  it('renders "Module introuvable" when module is undefined and isError=false', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    useMediaUrlMock.mockReturnValue({ url: null });

    render(<ModuleDetailsComponent moduleId='m1' />);

    expect(screen.getByText('Module introuvable')).toBeInTheDocument();
    expect(hideLoader).toHaveBeenCalledTimes(1);
  });

  it('calls showLoader when isLoading=true and hideLoader when isLoading=false (rerender)', () => {
    const refetch = jest.fn();

    useGetModuleByIdMock.mockReturnValue({
      module: undefined,
      isLoading: true,
      isError: false,
      refetch,
    });
    useMediaUrlMock.mockReturnValue({ url: null });

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

  it('renders main UI, opens dialogs, calls refetch on done, and triggers delete hooks', () => {
    const refetch = jest.fn();
    useGetModuleByIdMock.mockReturnValue({
      module: baseModule(),
      isLoading: false,
      isError: false,
      refetch,
    });
    useMediaUrlMock.mockReturnValue({ url: 'https://img.test/x.png' });

    render(<ModuleDetailsComponent moduleId='m1' />);

    expect(screen.getByText('Mon module')).toBeInTheDocument();
    expect(screen.getByText('Education financiere')).toBeInTheDocument();
    expect(screen.getByText('Debutant')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();

    expect(screen.getByText('55min')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-list')).toHaveTextContent('lessons:2');

    expect(screen.getByTestId('lesson-dialog')).toHaveAttribute('data-open', '0');
    fireEvent.click(screen.getByText(/Nouvelle/i));
    expect(screen.getByTestId('lesson-dialog')).toHaveAttribute('data-open', '1');

    fireEvent.click(screen.getByText('lesson-close'));
    expect(screen.getByTestId('lesson-dialog')).toHaveAttribute('data-open', '0');

    fireEvent.click(screen.getByLabelText('tab-quiz'));
    fireEvent.click(screen.getByText(/Nouveau/i));
    expect(screen.getByTestId('quiz-dialog')).toHaveAttribute('data-open', '1');

    fireEvent.click(screen.getByText('quiz-done'));
    expect(refetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('tab-lessons'));
    fireEvent.click(screen.getByText('call-onDelete'));
    expect(deleteLesson).toHaveBeenCalledWith({ lessonId: 'l2', moduleId: 'm1' });

    fireEvent.click(screen.getByLabelText('tab-quiz'));
    fireEvent.click(screen.getByText('call-onDeleteQuiz'));
    expect(deleteQuiz).toHaveBeenCalledWith({ quizId: 'q1', moduleId: 'm1' });
  });

  it('uses estimatedDuration when there are no lessons', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: baseModule({ lessons: [], estimatedDuration: 120 }),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    useMediaUrlMock.mockReturnValue({ url: null });

    render(<ModuleDetailsComponent moduleId='m1' />);
    expect(screen.getByText('120min')).toBeInTheDocument();
  });

  it('shows emoji fallback when imageUrl is null', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: baseModule({ imageMediaId: null }),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    useMediaUrlMock.mockReturnValue({ url: null });

    render(<ModuleDetailsComponent moduleId='m1' />);
    expect(screen.queryByRole('img', { name: /mon module/i })).not.toBeInTheDocument();
    expect(screen.getByText(/ðŸ“˜|📘/)).toBeInTheDocument();
  });

  it('devrait ouvrir le dialog de modification quand on clique sur le bouton Modifier', () => {
    const refetch = jest.fn();

    useGetModuleByIdMock.mockReturnValue({
      module: baseModule(),
      isLoading: false,
      isError: false,
      refetch,
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    // Le dialog est fermé par défaut
    expect(screen.getByTestId('module-edit-dialog')).toHaveAttribute('data-open', '0');

    // Cliquer sur le bouton Modifier
    fireEvent.click(screen.getByText('Modifier'));

    // Le dialog s'ouvre
    expect(screen.getByTestId('module-edit-dialog')).toHaveAttribute('data-open', '1');
  });

  it('devrait fermer le dialog de modification et appeler refetch quand onUpdated est appelé', () => {
    const refetch = jest.fn();

    useGetModuleByIdMock.mockReturnValue({
      module: baseModule(),
      isLoading: false,
      isError: false,
      refetch,
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    // Ouvrir le dialog
    fireEvent.click(screen.getByText('Modifier'));
    expect(screen.getByTestId('module-edit-dialog')).toHaveAttribute('data-open', '1');

    // Simuler la mise à jour du module
    fireEvent.click(screen.getByText('module-updated'));

    // Refetch doit être appelé
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('devrait fermer le dialog de modification via le bouton close', () => {
    useGetModuleByIdMock.mockReturnValue({
      module: baseModule(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    // Ouvrir le dialog
    fireEvent.click(screen.getByText('Modifier'));
    expect(screen.getByTestId('module-edit-dialog')).toHaveAttribute('data-open', '1');

    // Fermer le dialog
    fireEvent.click(screen.getByText('module-edit-close'));
    expect(screen.getByTestId('module-edit-dialog')).toHaveAttribute('data-open', '0');
  });

  it("devrait afficher l'image du module via useMediaUrl", () => {
    useMediaUrlMock.mockReturnValue({ url: 'https://media.test/module-image.jpg', loading: false });

    useGetModuleByIdMock.mockReturnValue({
      module: baseModule({ imageMediaId: 'media-456' }),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<ModuleDetailsComponent moduleId='m1' />);

    const img = screen.getByTestId('next-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://media.test/module-image.jpg');
    expect(img).toHaveAttribute('alt', 'Mon module');
  });
});
