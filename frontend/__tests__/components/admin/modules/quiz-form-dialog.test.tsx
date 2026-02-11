// frontend/__tests__/components/admin/modules/quiz-form-dialog.test.tsx

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import QuizFormDialog, { type QuizDraft } from '@/components/admin/modules/quiz-form-dialog';
import { QuizStatus } from '@/types/modules/Quiz';

// --------------------
// Mocks UI + icons
// --------------------
jest.mock('lucide-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler: any = {
    get: () => (props: any) => <svg {...props} />,
  };
  return new Proxy({}, handler);
});

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, ...props }: any) => (
    // IMPORTANT : on ne met pas disabled sur le DOM pour pouvoir cliquer et couvrir "if (!canSubmit) return"
    <button data-disabled={disabled ? 'true' : 'false'} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => (
    <label {...props} data-testid='label'>
      {children}
    </label>
  ),
}));

// Select mock (on clique direct sur SelectItem => appelle onValueChange)
jest.mock('@/components/ui/select', () => {
  const React = require('react');
  const Ctx = React.createContext({ value: undefined, onValueChange: (_v: string) => {} });

  const Select = ({ value, onValueChange, children }: any) => (
    <Ctx.Provider value={{ value, onValueChange }}>{children}</Ctx.Provider>
  );

  const SelectTrigger = ({ children }: any) => <div>{children}</div>;

  const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;

  const SelectContent = ({ children }: any) => <div>{children}</div>;

  const SelectItem = ({ value, children, ...rest }: any) => {
    const ctx = React.useContext(Ctx);
    return (
      <button
        type='button'
        data-testid={`select-item-${value}`}
        onClick={() => ctx.onValueChange(value)}
        {...rest}
      >
        {children}
      </button>
    );
  };

  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
});

// QuestionDialog mock : quand open=true on affiche un bouton pour ajouter une question
jest.mock('@/components/admin/modules/question-dialog', () => ({
  __esModule: true,
  default: ({ open, onOpenChange, onAdd }: any) =>
    open ? (
      <div data-testid='question-dialog'>
        <button
          type='button'
          onClick={() => {
            onAdd({
              question: 'Question mock',
              type: 'CHOIX_UNIQUE',
              points: 2,
              options: [{ text: 'Option A', isCorrect: true }],
            });
            onOpenChange(false);
          }}
        >
          Mock add question
        </button>
      </div>
    ) : null,
}));

// --------------------
// Helpers
// --------------------
function getTitleInput() {
  return screen.getByPlaceholderText('Ex: Quiz de compréhension') as HTMLInputElement;
}

function getDescTextarea() {
  return screen.getByPlaceholderText('Décrivez les objectifs de ce quiz...') as HTMLTextAreaElement;
}

function getDureeInput() {
  return screen.getByPlaceholderText('Illimité') as HTMLInputElement;
}

function getSaveButton() {
  // Le bouton contient un icon + texte, on cherche par texte
  return screen.getByRole('button', { name: /Ajouter le quiz|Créer le quiz|Enregistrer/i });
}

function getCancelButton() {
  return screen.getByRole('button', { name: 'Annuler' });
}

function spinbuttons() {
  // scoreMinimum puis nombreTentatives (ordre dans le DOM)
  return screen.getAllByRole('spinbutton') as HTMLInputElement[];
}

const qUnique = {
  question: 'Q unique',
  type: 'CHOIX_UNIQUE',
  points: 2,
  options: [
    { text: 'A', isCorrect: true },
    { text: 'B', isCorrect: false },
  ],
};

const qMultiple = {
  question: 'Q multiple',
  type: 'CHOIX_MULTIPLE',
  points: 3,
  options: [
    { text: 'A', isCorrect: true },
    { text: 'B', isCorrect: true },
    { text: 'C', isCorrect: false },
  ],
};

// --------------------
// Tests
// --------------------
describe('QuizFormDialog', () => {
  it('ne charge pas "initial" quand open=false, puis charge quand open=true', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    const initial: Partial<QuizDraft> = {
      title: 'Init Title',
      description: 'Init Desc',
      status: QuizStatus.PUBLISHED,
      scoreMinimum: 80,
      duree: 12,
      nombreTentatives: 2,
      questions: [qUnique as any],
    };

    const { rerender } = render(
      <QuizFormDialog
        open={false}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
        initial={initial}
      />
    );

    // open=false => useEffect return => valeurs restent vides
    expect(getTitleInput().value).toBe('');
    expect(getDescTextarea().value).toBe('');

    // open=true => initialise depuis initial
    rerender(
      <QuizFormDialog
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
        initial={initial}
      />
    );

    expect(getTitleInput().value).toBe('Init Title');
    expect(getDescTextarea().value).toBe('Init Desc');

    // la liste questions est affichée (pas l'état "aucune question")
    expect(screen.queryByText('Aucune question pour l’instant')).not.toBeInTheDocument();
    expect(screen.getByText('Q unique')).toBeInTheDocument();
  });

  it('bloque le submit quand invalide (branche if(!canSubmit) return), puis submit quand valide', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    // invalide : title/desc vides
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();

    // remplir title + desc => valide en DRAFT même sans questions
    fireEvent.change(getTitleInput(), { target: { value: '  Mon Quiz  ' } });
    fireEvent.change(getDescTextarea(), { target: { value: '  Ma description  ' } });

    fireEvent.click(getSaveButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Mon Quiz',
      description: 'Ma description',
      status: QuizStatus.DRAFT,
      scoreMinimum: 70,
      duree: undefined, // '' => undefined
      nombreTentatives: 3,
      questions: [],
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('status PUBLISHED sans question => warning + submit bloqué, puis ajout question => submit OK', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    fireEvent.change(getTitleInput(), { target: { value: 'Quiz Publié' } });
    fireEvent.change(getDescTextarea(), { target: { value: 'Desc' } });

    // passer en PUBLISHED
    fireEvent.click(screen.getByTestId(`select-item-${QuizStatus.PUBLISHED}`));

    expect(screen.getByText('Pour publier, ajoute au moins 1 question.')).toBeInTheDocument();

    // click save => bloqué
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    // ouvrir QuestionDialog
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une question' }));
    expect(screen.getByTestId('question-dialog')).toBeInTheDocument();

    // ajouter une question (mock)
    fireEvent.click(screen.getByRole('button', { name: 'Mock add question' }));

    // warning disparu
    expect(screen.queryByText('Pour publier, ajoute au moins 1 question.')).not.toBeInTheDocument();

    // submit OK
    fireEvent.click(getSaveButton());
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.status).toBe(QuizStatus.PUBLISHED);
    expect(payload.questions).toHaveLength(1);
  });

  it('valide score / tentatives / durée (branches timeOk, scoreOk, attemptsOk) + duree numérique', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    fireEvent.change(getTitleInput(), { target: { value: 'Quiz' } });
    fireEvent.change(getDescTextarea(), { target: { value: 'Desc' } });

    const [scoreInput, attemptsInput] = spinbuttons();

    // score invalid >100
    fireEvent.change(scoreInput, { target: { value: '101' } });
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    // score ok
    fireEvent.change(scoreInput, { target: { value: '70' } });

    // tentatives invalid (4)
    fireEvent.change(attemptsInput, { target: { value: '4' } });
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    // tentatives ok
    fireEvent.change(attemptsInput, { target: { value: '3' } });

    // durée invalid (0)
    fireEvent.change(getDureeInput(), { target: { value: '0' } });
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    // durée ok (15)
    fireEvent.change(getDureeInput(), { target: { value: '15' } });
    fireEvent.click(getSaveButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].duree).toBe(15);
  });

  it('affiche choix unique / multiple, pluralisation, totalPoints, et permet de supprimer une question', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    const initial: Partial<QuizDraft> = {
      title: 'Quiz init',
      description: 'Desc init',
      status: QuizStatus.DRAFT,
      scoreMinimum: 70,
      duree: 20,
      nombreTentatives: 3,
      questions: [qUnique as any, qMultiple as any],
    };

    render(
      <QuizFormDialog
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
        initial={initial}
        subtitle='Quiz custom'
        submitLabel='Enregistrer'
      />
    );

    // subtitle + label custom
    expect(screen.getByText('Quiz custom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();

    // labels de type (branches)
    expect(screen.getByText(/Choix unique/)).toBeInTheDocument();
    expect(screen.getByText(/Choix multiple/)).toBeInTheDocument();

    // pluralisation + points (2 + 3 = 5)
    expect(screen.getByText(/2 questions/)).toBeInTheDocument();
    expect(screen.getByText(/5 points/)).toBeInTheDocument();

    // supprimer une question
    const deleteButtons = screen.getAllByLabelText('Supprimer la question');
    fireEvent.click(deleteButtons[0]);

    // maintenant 1 question et points recalculés (reste 3)
    expect(screen.getByText(/1 question/)).toBeInTheDocument();
    expect(screen.getByText(/3 points/)).toBeInTheDocument();
  });

  it('Annuler appelle onOpenChange(false)', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    fireEvent.click(getCancelButton());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
