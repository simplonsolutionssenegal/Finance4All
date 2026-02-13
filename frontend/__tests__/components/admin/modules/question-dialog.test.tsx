/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import QuestionDialog from '@/components/admin/modules/question-dialog';
import { TypeQuestion } from '@/types/modules/Question';

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type = 'text', ...rest }: any) => (
    <input
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      {...rest}
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, ...rest }: any) => (
    <textarea value={value ?? ''} onChange={onChange} placeholder={placeholder} {...rest} />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid='select'>
      <select aria-label='select-type' value={value} onChange={e => onValueChange(e.target.value)}>
        <option value={TypeQuestion.CHOIX_UNIQUE}>Choix unique</option>
        <option value={TypeQuestion.CHOIX_MULTIPLE}>Choix multiple</option>
      </select>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/radio-group', () => {
  const React = require('react');

  const Ctx = React.createContext({ value: '', onValueChange: (_v: string) => {} });

  const RadioGroup = ({ value, onValueChange, children }: any) => (
    <Ctx.Provider value={{ value: value ?? '', onValueChange: onValueChange ?? (() => {}) }}>
      <div data-testid='radio-group'>{children}</div>
    </Ctx.Provider>
  );

  const RadioGroupItem = ({ value, 'aria-label': ariaLabel }: any) => {
    const ctx = React.useContext(Ctx);
    return (
      <input
        type='radio'
        aria-label={ariaLabel ?? 'radio'}
        checked={ctx.value === value}
        onChange={() => ctx.onValueChange(value)}
      />
    );
  };

  return { RadioGroup, RadioGroupItem };
});

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, 'aria-label': ariaLabel }: any) => (
    <input
      type='checkbox'
      aria-label={ariaLabel ?? 'checkbox'}
      checked={Boolean(checked)}
      onChange={e => onCheckedChange(e.target.checked)}
    />
  ),
}));

describe('QuestionDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents submit when invalid', () => {
    const onSave = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onSave={onSave} />);

    const addBtn = screen.getByText('Ajouter la question') as HTMLButtonElement;
    expect(addBtn).toBeDisabled();

    fireEvent.click(addBtn);
    expect(onSave).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('submits CHOIX_UNIQUE when exactly 1 correct answer', () => {
    const onSave = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onSave={onSave} />);

    fireEvent.change(screen.getByPlaceholderText('Quelle est votre question ?'), {
      target: { value: 'Quelle est la capitale ?' },
    });

    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'Dakar' } });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByPlaceholderText('Option 3'), { target: { value: 'Rome' } });
    fireEvent.change(screen.getByPlaceholderText('Option 4'), { target: { value: 'Madrid' } });

    const radios = screen.getAllByLabelText(/ponse correcte/i);
    fireEvent.click(radios[0]);

    fireEvent.change(screen.getByPlaceholderText(/Expliquez pourquoi/), {
      target: { value: 'Parce que...' },
    });

    const addBtn = screen.getByText('Ajouter la question') as HTMLButtonElement;
    expect(addBtn).not.toBeDisabled();

    fireEvent.click(addBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      question: 'Quelle est la capitale ?',
      type: TypeQuestion.CHOIX_UNIQUE,
      points: 1,
      options: [
        { text: 'Dakar', isCorrect: true },
        { text: 'Paris', isCorrect: false },
        { text: 'Rome', isCorrect: false },
        { text: 'Madrid', isCorrect: false },
      ],
      explication: 'Parce que...',
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('submits CHOIX_MULTIPLE when >=2 correct answers and points valid', () => {
    const onSave = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('select-type'), {
      target: { value: TypeQuestion.CHOIX_MULTIPLE },
    });

    const pointsInput = screen.getByDisplayValue('1') as HTMLInputElement;
    fireEvent.change(pointsInput, { target: { value: '5' } });

    fireEvent.change(screen.getByPlaceholderText('Quelle est votre question ?'), {
      target: { value: 'Q multiple' },
    });

    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'B' } });
    fireEvent.change(screen.getByPlaceholderText('Option 3'), { target: { value: 'C' } });
    fireEvent.change(screen.getByPlaceholderText('Option 4'), { target: { value: 'D' } });

    const checks = screen.getAllByLabelText(/ponse correcte/i);
    fireEvent.click(checks[0]);
    fireEvent.click(checks[1]);

    const addBtn = screen.getByText('Ajouter la question') as HTMLButtonElement;
    expect(addBtn).not.toBeDisabled();

    fireEvent.click(addBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0];
    expect(payload.type).toBe(TypeQuestion.CHOIX_MULTIPLE);
    expect(payload.points).toBe(5);
    expect(payload.options.filter((o: any) => o.isCorrect).length).toBe(2);
  });

  it('loads initial values and uses Enregistrer label in edit mode', () => {
    const onSave = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <QuestionDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        initial={{
          question: 'Q init',
          type: TypeQuestion.CHOIX_UNIQUE,
          points: 2,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        }}
      />
    );

    expect(screen.getByDisplayValue('Q init')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeInTheDocument();
  });
});
