/**
 * @jest-environment jsdom
 */
import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import LessonDialog from '@/components/admin/modules/lesson-dialog';
import { LessonStatus } from '@/types/modules/Lesson';

// --------------------
// Mocks: icons
// --------------------
jest.mock('lucide-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler: any = { get: () => (props: any) => <svg {...props} /> };
  return new Proxy({}, handler);
});

// --------------------
// Mocks: UI primitives
// --------------------
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, ...props }: any) => (
    // on laisse un data-disabled mais on n'applique pas disabled HTML ici
    <button data-disabled={disabled ? 'true' : 'false'} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/input', () => {
  const React = require('react');
  return {
    Input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />),
  };
});

// Select mock: click SelectItem => onValueChange
jest.mock('@/components/ui/select', () => {
  const React = require('react');
  const Ctx = React.createContext({ onValueChange: (_v: string) => {} });

  const Select = ({ onValueChange, children }: any) => (
    <Ctx.Provider value={{ onValueChange }}>{children}</Ctx.Provider>
  );
  const SelectTrigger = ({ children }: any) => <div>{children}</div>;
  const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
  const SelectContent = ({ children }: any) => <div>{children}</div>;
  const SelectItem = ({ value, children }: any) => {
    const ctx = React.useContext(Ctx);
    return (
      <button
        type='button'
        data-testid={`select-item-${value}`}
        onClick={() => ctx.onValueChange(value)}
      >
        {children}
      </button>
    );
  };

  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
});

// Accordion mock pour pouvoir changer openChapterIndex via click trigger
jest.mock('@/components/ui/accordion', () => {
  const React = require('react');

  const AccCtx = React.createContext({
    active: '',
    onValueChange: (_v: string) => {},
    item: '',
  });

  const Accordion = ({ value, onValueChange, children }: any) => (
    <AccCtx.Provider value={{ active: value ?? '', onValueChange, item: '' }}>
      <div>{children}</div>
    </AccCtx.Provider>
  );

  const AccordionItem = ({ value, children }: any) => {
    const ctx = React.useContext(AccCtx);
    return (
      <AccCtx.Provider value={{ ...ctx, item: value }}>
        <div data-testid={`acc-item-${value}`}>{children}</div>
      </AccCtx.Provider>
    );
  };

  const AccordionTrigger = ({ children, ...props }: any) => {
    const ctx = React.useContext(AccCtx);
    return (
      <button
        type='button'
        {...props}
        onClick={() => ctx.onValueChange(ctx.active === ctx.item ? '' : ctx.item)}
      >
        {children}
      </button>
    );
  };

  const AccordionContent = ({ children }: any) => <div>{children}</div>;

  return { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
});

// --------------------
// Mocks: hooks
// --------------------
const createLessonMock = jest.fn();
let onSuccessCreateLesson: (() => void) | undefined;

jest.mock('@/hooks/lesson/useCreateLesson', () => ({
  useCreateLesson: (opts: { onSuccess?: () => void }) => {
    onSuccessCreateLesson = opts?.onSuccess;
    return { createLesson: createLessonMock, isCreating: false };
  },
}));

const uploadMutateAsyncMock = jest.fn();
jest.mock('@/hooks/media/useUploadMedia', () => ({
  useUploadMedia: () => ({ mutateAsync: uploadMutateAsyncMock }),
}));

const deleteMediaAsyncMock = jest.fn();
jest.mock('@/hooks/media/useDeleteMedia', () => ({
  useDeleteMedia: () => ({ deleteMediaAsync: deleteMediaAsyncMock }),
}));

// --------------------
// Mocks: child dialogs (exact module ids via alias)
// --------------------
jest.mock('@/components/admin/modules/ResourcePickerDialog', () => ({
  __esModule: true,
  default: ({ open, onPick }: any) => (
    <div>
      {/* pour couvrir chapterIndex null */}
      <button type='button' aria-label='pick-no-target' onClick={() => onPick('PDF')}>
        pick-no-target
      </button>

      {open ? (
        <div data-testid='resource-picker'>
          <button type='button' aria-label='pick-page' onClick={() => onPick('PAGE')}>
            pick-page
          </button>
          <button type='button' aria-label='pick-pdf' onClick={() => onPick('PDF')}>
            pick-pdf
          </button>
        </div>
      ) : null}
    </div>
  ),
}));

// QuizFormDialog mock :
// - bouton "force-open" (même quand open=false) pour couvrir targetChapterIdx===null
// - quand open=true, bouton "submit-quiz"
jest.mock('@/components/admin/modules/quiz-form-dialog', () => ({
  __esModule: true,
  default: ({ open, subtitle, onOpenChange, onSubmit }: any) => (
    <div data-testid={`quiz-form-wrapper-${subtitle}`}>
      <button
        type='button'
        aria-label={`force-open-${subtitle}`}
        onClick={() => onOpenChange(true)}
      >
        force-open
      </button>

      {open ? (
        <div data-testid={`quiz-form-${subtitle}`}>
          <button
            type='button'
            onClick={() => {
              onSubmit({
                title: `Quiz-${subtitle}`,
                description: 'Desc',
                status: 'DRAFT',
                scoreMinimum: 70,
                duree: undefined,
                nombreTentatives: 3,
                questions: [
                  {
                    question: 'Q1',
                    type: 'CHOIX_UNIQUE',
                    points: 2,
                    options: [{ text: 'A', isCorrect: true }],
                  },
                ],
              });
              onOpenChange(false);
            }}
          >
            submit-quiz
          </button>
        </div>
      ) : null}
    </div>
  ),
}));

// --------------------
// Helpers
// --------------------
function getFileInput(container: HTMLElement) {
  const el = container.querySelector('input[type="file"]') as HTMLInputElement | null;
  if (!el) throw new Error('file input not found');
  return el;
}

function fillBaseLesson() {
  fireEvent.change(screen.getByPlaceholderText('Ex: Introduction au budget familial'), {
    target: { value: 'Titre leçon' },
  });
  fireEvent.change(
    screen.getByPlaceholderText('Décrivez brièvement le contenu de cette leçon...'),
    {
      target: { value: 'Conférence + pratique' },
    }
  );
  fireEvent.change(screen.getByPlaceholderText('Ex: 15'), { target: { value: '20' } });
}

function makeChapterValidNoMedia() {
  fireEvent.change(screen.getByPlaceholderText('Titre de chapitre'), {
    target: { value: 'Chap 1' },
  });
  fireEvent.change(screen.getByPlaceholderText('Description de chapitre ...'), {
    target: { value: 'Desc 1' },
  });

  // checkbox "Aucun média..." (dans la partie chapitre)
  const cb = screen.getAllByRole('checkbox')[0];
  fireEvent.click(cb);
}

// --------------------
// Tests
// --------------------
describe('LessonDialog (high coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onSuccessCreateLesson = undefined;
    uploadMutateAsyncMock.mockReset();
    deleteMediaAsyncMock.mockReset();
  });

  it('init + statusLabel branches + warning PUBLISHED sans chapitre', () => {
    const { rerender } = render(
      <LessonDialog open={false} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />
    );

    // open=false => useEffect return
    expect(screen.getByText('Nouvelle leçon')).toBeInTheDocument();

    rerender(
      <LessonDialog
        open={true}
        onOpenChange={jest.fn()}
        moduleId='m1'
        nextOrder={1}
        chapters={[{ title: 'C', description: 'D', order: 0, mediaId: 'mid' } as any]}
      />
    );

    // statusLabel est appelé via la liste des SelectItem
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
    expect(screen.getByText('Publié')).toBeInTheDocument();
    expect(screen.getByText('Programmé')).toBeInTheDocument();
    expect(screen.getByText('Archivé')).toBeInTheDocument();

    // chapitre init -> resourcesCount = 1 (noMedia=false, mediaId présent)
    expect(screen.getByText(/1 chapitre • 1 ressource/)).toBeInTheDocument();

    // warning publié sans chapitre => render avec 0 chapitre
    rerender(<LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />);
    fireEvent.click(screen.getByTestId(`select-item-${LessonStatus.PUBLISHED}`));
    expect(screen.getByText('Pour publier, ajoute au moins 1 chapitre.')).toBeInTheDocument();
  });

  it('handleAddChapter: empty state + branche erreur (forcer click) + ajout normal', async () => {
    render(<LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />);

    // 1) créer le 1er chapitre (chapitre invalide car vide)
    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));
    expect(screen.getByPlaceholderText('Titre de chapitre')).toBeInTheDocument();

    // 2) forcer le click sur "Ajouter un chapitre" même si disabled (branche chapterError)
    const addBtn = screen.getByRole('button', { name: 'Ajouter un chapitre' }) as HTMLButtonElement;

    // le composant met disabled via prop => property DOM peut rester true
    addBtn.removeAttribute('disabled');
    addBtn.disabled = false;

    fireEvent.click(addBtn);

    expect(
      await screen.findByText(t =>
        t.includes("Veuillez compléter les chapitres avant d'en ajouter un nouveau.")
      )
    ).toBeInTheDocument();

    // 3) rendre le chapitre valide : titre + desc + cocher "Aucun média"
    fireEvent.change(screen.getByPlaceholderText('Titre de chapitre'), {
      target: { value: 'Chap 1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description de chapitre ...'), {
      target: { value: 'Desc 1' },
    });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // 4) maintenant l'ajout doit marcher => 2 chapitres
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un chapitre' }));
    expect(screen.getAllByPlaceholderText('Titre de chapitre')).toHaveLength(2);
  });

  it('resource flow: PAGE + PDF upload success + accept change + resourcesCount', async () => {
    uploadMutateAsyncMock.mockResolvedValueOnce({ id: 'media-1', originalName: 'file.pdf' });

    const { container } = render(
      <LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />
    );

    // créer un chapitre
    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));

    // ouvrir picker via "Ajouter une ressource"
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une ressource' }));
    expect(screen.getByTestId('resource-picker')).toBeInTheDocument();

    // PAGE
    fireEvent.click(screen.getByLabelText('pick-page'));
    expect(screen.getByText('Ce chapitre sera créé sans média.')).toBeInTheDocument();

    // PDF (remplacer)
    fireEvent.click(screen.getByRole('button', { name: 'Remplacer' }));
    fireEvent.click(screen.getByLabelText('pick-pdf'));

    // accept doit être application/pdf
    const fileEl = getFileInput(container);
    await waitFor(() => expect(fileEl.getAttribute('accept')).toBe('application/pdf'));

    // simuler file selection
    fireEvent.change(fileEl, {
      target: { files: [new File(['x'], 'file.pdf', { type: 'application/pdf' })] },
    });

    await waitFor(() => expect(screen.getByText('media-1')).toBeInTheDocument());

    // resourcesCount = 1 (noMedia false + mediaId présent)
    expect(screen.getByText(/1 chapitre • 1 ressource/)).toBeInTheDocument();
  });

  it('delete media branches: success=false + throw + success=true, et replace supprime puis ouvre picker', async () => {
    uploadMutateAsyncMock.mockResolvedValueOnce({ id: 'media-2', originalName: 'file2.pdf' });

    const { container } = render(
      <LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />
    );

    // créer chapitre + upload PDF
    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une ressource' }));
    fireEvent.click(screen.getByLabelText('pick-pdf'));
    fireEvent.change(getFileInput(container), {
      target: { files: [new File(['x'], 'file2.pdf', { type: 'application/pdf' })] },
    });

    await waitFor(() => expect(screen.getByText('media-2')).toBeInTheDocument());

    // success=false
    deleteMediaAsyncMock.mockResolvedValueOnce({ success: false, message: 'nope' });
    fireEvent.click(screen.getByRole('button', { name: 'Retirer la ressource' }));
    await waitFor(() => expect(screen.getByText('nope')).toBeInTheDocument());
    expect(screen.getByText('media-2')).toBeInTheDocument();

    // throw
    deleteMediaAsyncMock.mockRejectedValueOnce(new Error('boom'));
    fireEvent.click(screen.getByRole('button', { name: 'Retirer la ressource' }));
    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument());
    expect(screen.getByText('media-2')).toBeInTheDocument();

    // success=true => media disparaît et noMedia devient true
    deleteMediaAsyncMock.mockResolvedValueOnce({ success: true });
    fireEvent.click(screen.getByRole('button', { name: 'Retirer la ressource' }));
    await waitFor(() => expect(screen.queryByText('media-2')).not.toBeInTheDocument());
    expect(screen.getByText('Ce chapitre sera créé sans média.')).toBeInTheDocument();

    // replace avec media existant: re-upload puis click "Remplacer" doit delete puis ouvrir picker
    uploadMutateAsyncMock.mockResolvedValueOnce({ id: 'media-3', originalName: 'file3.pdf' });
    fireEvent.click(screen.getByRole('button', { name: 'Remplacer' }));
    fireEvent.click(screen.getByLabelText('pick-pdf'));
    fireEvent.change(getFileInput(container), {
      target: { files: [new File(['y'], 'file3.pdf', { type: 'application/pdf' })] },
    });

    await waitFor(() => expect(screen.getByText('media-3')).toBeInTheDocument());

    deleteMediaAsyncMock.mockResolvedValueOnce({ success: true });
    fireEvent.click(screen.getByRole('button', { name: 'Remplacer' }));

    await waitFor(() => expect(deleteMediaAsyncMock).toHaveBeenCalledWith({ mediaId: 'media-3' }));
    expect(await screen.findByTestId('resource-picker')).toBeInTheDocument();
  });

  it('handleNoMediaChange: checked=true avec mediaId => delete puis reset', async () => {
    uploadMutateAsyncMock.mockResolvedValueOnce({ id: 'media-4', originalName: 'file4.pdf' });
    deleteMediaAsyncMock.mockResolvedValueOnce({ success: true });

    const { container } = render(
      <LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une ressource' }));
    fireEvent.click(screen.getByLabelText('pick-pdf'));
    fireEvent.change(getFileInput(container), {
      target: { files: [new File(['x'], 'file4.pdf', { type: 'application/pdf' })] },
    });

    await waitFor(() => expect(screen.getByText('media-4')).toBeInTheDocument());

    // cocher "Aucun média..." => doit supprimer media côté API
    const cb = screen.getAllByRole('checkbox')[0];
    fireEvent.click(cb);

    await waitFor(() => expect(deleteMediaAsyncMock).toHaveBeenCalledWith({ mediaId: 'media-4' }));
    await waitFor(() => expect(screen.queryByText('media-4')).not.toBeInTheDocument());
  });

  it('quiz flows: couvre targetChapterIdx===null, puis ajout/suppression quiz chapitre + quiz leçon', async () => {
    render(<LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />);

    // créer chapitre + valide
    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));
    makeChapterValidNoMedia();

    // ✅ couvrir la branche targetChapterIdx === null :
    // on force l'ouverture du QuizFormDialog "Quiz de chapitre" via son onOpenChange(true)
    fireEvent.click(screen.getByLabelText('force-open-Quiz de chapitre'));
    expect(screen.getByTestId('quiz-form-Quiz de chapitre')).toBeInTheDocument();
    fireEvent.click(screen.getByText('submit-quiz')); // onSubmit appelé mais targetChapterIdx null => return

    // ✅ ajout quiz chapitre normal (via bouton dans la section "Quiz du chapitre")
    const chapterQuizHeader = screen.getByText('Quiz du chapitre').closest('div')!;
    fireEvent.click(within(chapterQuizHeader).getByRole('button', { name: 'Ajouter un quiz' }));

    expect(screen.getByTestId('quiz-form-Quiz de chapitre')).toBeInTheDocument();
    fireEvent.click(screen.getByText('submit-quiz'));

    // le quiz est listé -> supprimer
    fireEvent.click(screen.getByLabelText('Supprimer le quiz du chapitre'));

    // ✅ quiz de fin de leçon
    const lessonQuizSection = screen.getByText('Quiz de fin de leçon').parentElement!;
    fireEvent.click(within(lessonQuizSection).getByRole('button', { name: 'Ajouter un quiz' }));

    expect(screen.getByTestId('quiz-form-Quiz de fin de leçon')).toBeInTheDocument();
    fireEvent.click(screen.getByText('submit-quiz'));

    fireEvent.click(screen.getByLabelText('Supprimer le quiz'));
  });

  it('removeChapter branches: openChapterIndex===index et openChapterIndex>index', () => {
    render(<LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />);

    // 2 chapitres
    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un chapitre' }));

    const triggers = screen.getAllByRole('button', { name: /Chapitre/i });

    // ouvrir chapitre 1 puis supprimer => openChapterIndex === index
    fireEvent.click(triggers[0]);
    fireEvent.click(screen.getAllByLabelText('Supprimer le chapitre')[0]);

    // ouvrir chapitre restant (qui était 2) et supprimer le premier => openChapterIndex > index
    // (on recrée 2 chapitres pour couvrir)
    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un chapitre' }));

    const triggers2 = screen.getAllByRole('button', { name: /Chapitre/i });
    fireEvent.click(triggers2[1]); // ouvre chapitre 2 (index=1)
    fireEvent.click(screen.getAllByLabelText('Supprimer le chapitre')[0]); // supprime index 0 => openChapterIndex > index
  });

  it('submit: invalide => pas d’appel, valide => createLesson + onSuccess ferme', () => {
    const onOpenChange = jest.fn();
    const onCreated = jest.fn();

    render(
      <LessonDialog
        open={true}
        onOpenChange={onOpenChange}
        moduleId='m1'
        nextOrder={5}
        onCreated={onCreated}
      />
    );

    // invalide => rien
    fireEvent.click(screen.getByRole('button', { name: 'Créer la leçon' }));
    expect(createLessonMock).not.toHaveBeenCalled();

    // valide avec 1 chapitre + quiz chapitre + quiz lesson
    fireEvent.click(screen.getByRole('button', { name: 'Créer le premier chapitre' }));
    makeChapterValidNoMedia();

    // quiz chapitre
    const chapterQuizHeader = screen.getByText('Quiz du chapitre').closest('div')!;
    fireEvent.click(within(chapterQuizHeader).getByRole('button', { name: 'Ajouter un quiz' }));
    fireEvent.click(screen.getByText('submit-quiz'));

    // quiz leçon
    const lessonQuizSection = screen.getByText('Quiz de fin de leçon').parentElement!;
    fireEvent.click(within(lessonQuizSection).getByRole('button', { name: 'Ajouter un quiz' }));
    fireEvent.click(screen.getByText('submit-quiz'));

    fillBaseLesson();

    fireEvent.click(screen.getByRole('button', { name: 'Créer la leçon' }));

    expect(createLessonMock).toHaveBeenCalledTimes(1);
    expect(createLessonMock).toHaveBeenCalledWith({
      moduleId: 'm1',
      payload: expect.objectContaining({
        title: 'Titre leçon',
        description: 'Conférence + pratique',
        duration: 20,
        order: 5,
        status: LessonStatus.DRAFT,
        chapters: expect.any(Array),
        quizzes: expect.any(Array),
      }),
    });

    // onSuccess du hook
    onSuccessCreateLesson?.();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('onPickResourceKind: chapterIndex null => early return', () => {
    render(<LessonDialog open={true} onOpenChange={jest.fn()} moduleId='m1' nextOrder={1} />);
    fireEvent.click(screen.getByLabelText('pick-no-target'));
  });
});
