import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import QuizFormDialog, { type QuizDraft } from '@/components/admin/modules/quiz-form-dialog';
import { QuizStatus } from '@/types/modules/Quiz';

jest.mock('lucide-react', () => {
  const handler: any = { get: () => (props: any) => <svg {...props} /> };
  return new Proxy({}, handler);
});

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, ...props }: any) => (
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

jest.mock('@/components/admin/modules/question-dialog', () => ({
  __esModule: true,
  default: ({ open, onOpenChange, onSave, initial }: any) =>
    open ? (
      <div data-testid='question-dialog'>
        <button
          type='button'
          onClick={() => {
            onSave({
              question: initial ? 'Question edited' : 'Question mock',
              type: 'CHOIX_UNIQUE',
              points: 2,
              options: [{ text: 'Option A', isCorrect: true }],
            });
            onOpenChange(false);
          }}
        >
          Mock save question
        </button>
      </div>
    ) : null,
}));

function getTitleInput() {
  return screen.getByPlaceholderText(/Ex: Quiz de compr/) as HTMLInputElement;
}

function getDescTextarea() {
  return screen.getByPlaceholderText(/crivez les objectifs de ce quiz/) as HTMLTextAreaElement;
}

function getDureeInput() {
  return screen.getByPlaceholderText(/Illimit/) as HTMLInputElement;
}

function getSaveButton() {
  return screen.getByRole('button', { name: /Ajouter le quiz|Cr??er le quiz|Enregistrer/i });
}

function getCancelButton() {
  return screen.getByRole('button', { name: 'Annuler' });
}

function spinbuttons() {
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

describe('QuizFormDialog', () => {
  it('loads initial only when open=true', () => {
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

    expect(getTitleInput().value).toBe('');
    expect(getDescTextarea().value).toBe('');

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
    expect(screen.queryByText('Aucune question pour l???instant')).not.toBeInTheDocument();
    expect(screen.getByText('Q unique')).toBeInTheDocument();
  });

  it('blocks submit when invalid, then submits when valid', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(getTitleInput(), { target: { value: '  Mon Quiz  ' } });
    fireEvent.change(getDescTextarea(), { target: { value: '  Ma description  ' } });

    fireEvent.click(getSaveButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Mon Quiz',
      description: 'Ma description',
      status: QuizStatus.DRAFT,
      scoreMinimum: 70,
      duree: undefined,
      nombreTentatives: 3,
      questions: [],
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('status PUBLISHED without questions shows warning and blocks submit, then add question works', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    fireEvent.change(getTitleInput(), { target: { value: 'Quiz Publie' } });
    fireEvent.change(getDescTextarea(), { target: { value: 'Desc' } });

    fireEvent.click(screen.getByTestId(`select-item-${QuizStatus.PUBLISHED}`));
    expect(screen.getByText('Pour publier, ajoute au moins 1 question.')).toBeInTheDocument();

    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une question' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mock save question' }));

    expect(screen.queryByText('Pour publier, ajoute au moins 1 question.')).not.toBeInTheDocument();

    fireEvent.click(getSaveButton());
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('validates score, attempts, and duration', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    fireEvent.change(getTitleInput(), { target: { value: 'Quiz' } });
    fireEvent.change(getDescTextarea(), { target: { value: 'Desc' } });

    const [scoreInput, attemptsInput] = spinbuttons();

    fireEvent.change(scoreInput, { target: { value: '101' } });
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(scoreInput, { target: { value: '70' } });

    fireEvent.change(attemptsInput, { target: { value: '4' } });
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(attemptsInput, { target: { value: '3' } });

    fireEvent.change(getDureeInput(), { target: { value: '0' } });
    fireEvent.click(getSaveButton());
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(getDureeInput(), { target: { value: '15' } });
    fireEvent.click(getSaveButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].duree).toBe(15);
  });

  it('shows question list, deletes, and edits a question', () => {
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

    expect(screen.getByText('Quiz custom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();

    expect(screen.getByText(/Choix unique/)).toBeInTheDocument();
    expect(screen.getByText(/Choix multiple/)).toBeInTheDocument();

    expect(screen.getByText(/2 questions/)).toBeInTheDocument();
    expect(screen.getByText(/5 points/)).toBeInTheDocument();

    const deleteButtons = screen.getAllByLabelText('Supprimer la question');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/1 question/)).toBeInTheDocument();
    expect(screen.getByText(/3 points/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Modifier la question'));
    fireEvent.click(screen.getByRole('button', { name: 'Mock save question' }));

    expect(screen.getByText('Question edited')).toBeInTheDocument();
  });

  it('Annuler calls onOpenChange(false)', () => {
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuizFormDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    fireEvent.click(getCancelButton());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
