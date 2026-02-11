/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import QuestionDialog from '@/components/admin/modules/question-dialog'; // 🔁 adapte le chemin
import { TypeQuestion } from '@/types/modules/Question';

// ------------------
// Mocks UI components
// ------------------
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

// Select mock: simple <select>
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid='select'>
      <select aria-label='select-type' value={value} onChange={e => onValueChange(e.target.value)}>
        {/* on ignore children SelectItem et on hardcode les options via TypeQuestion */}
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

  const Ctx = React.createContext({
    value: '',
    onValueChange: (_v: string) => {},
  });

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

// Checkbox mock: input checkbox (Radix passes boolean | "indeterminate", we accept any)
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

  it('should reset form when open=true and prevent submit when invalid', () => {
    const onAdd = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onAdd={onAdd} />);

    // bouton disabled car question vide + options vides
    const addBtn = screen.getByText('Ajouter la question') as HTMLButtonElement;
    expect(addBtn).toBeDisabled();

    // clique n'appelle rien
    fireEvent.click(addBtn);
    expect(onAdd).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('should submit CHOIX_UNIQUE when 1 correct answer, options filled, valid points', () => {
    const onAdd = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onAdd={onAdd} />);

    // remplir la question
    fireEvent.change(screen.getByPlaceholderText('Quelle est votre question ?'), {
      target: { value: 'Quelle est la capitale ?' },
    });

    // remplir les 4 options
    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'Dakar' } });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByPlaceholderText('Option 3'), { target: { value: 'Rome' } });
    fireEvent.change(screen.getByPlaceholderText('Option 4'), { target: { value: 'Madrid' } });

    // sélectionner une réponse correcte (radio 1)
    const radios = screen.getAllByLabelText('Réponse correcte');
    fireEvent.click(radios[0]);

    // ajouter une explication
    fireEvent.change(
      screen.getByPlaceholderText('Expliquez pourquoi cette réponse est correcte...'),
      { target: { value: 'Parce que...' } }
    );

    // bouton activé
    const addBtn = screen.getByText('Ajouter la question') as HTMLButtonElement;
    expect(addBtn).not.toBeDisabled();

    fireEvent.click(addBtn);

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
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

  it('should not submit CHOIX_UNIQUE if correctCount != 1', () => {
    const onAdd = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onAdd={onAdd} />);

    fireEvent.change(screen.getByPlaceholderText('Quelle est votre question ?'), {
      target: { value: 'Q ?' },
    });

    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'B' } });
    fireEvent.change(screen.getByPlaceholderText('Option 3'), { target: { value: 'C' } });
    fireEvent.change(screen.getByPlaceholderText('Option 4'), { target: { value: 'D' } });

    // ne coche aucune bonne réponse => disabled
    const addBtn = screen.getByText('Ajouter la question') as HTMLButtonElement;
    expect(addBtn).toBeDisabled();
  });

  it('should submit CHOIX_MULTIPLE when >=2 correct answers and points valid; also covers add/remove option', () => {
    const onAdd = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onAdd={onAdd} />);

    // switch type to CHOIX_MULTIPLE
    fireEvent.change(screen.getByLabelText('select-type'), {
      target: { value: TypeQuestion.CHOIX_MULTIPLE },
    });

    // points invalid -> disable
    const pointsInput = screen.getByDisplayValue('1') as HTMLInputElement;
    fireEvent.change(pointsInput, { target: { value: '' } });

    // remplir question + options
    fireEvent.change(screen.getByPlaceholderText('Quelle est votre question ?'), {
      target: { value: 'Q multiple' },
    });

    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'B' } });
    fireEvent.change(screen.getByPlaceholderText('Option 3'), { target: { value: 'C' } });
    fireEvent.change(screen.getByPlaceholderText('Option 4'), { target: { value: 'D' } });

    // points invalid -> toujours disabled
    expect(screen.getByText('Ajouter la question')).toBeDisabled();

    // set points valid
    fireEvent.change(pointsInput, { target: { value: '5' } });

    // ajouter une option + la remplir
    fireEvent.click(screen.getByText('Ajouter une option'));
    fireEvent.change(screen.getByPlaceholderText('Option 5'), { target: { value: 'E' } });

    // cocher 2 bonnes réponses (checkbox)
    const checks = screen.getAllByLabelText('Réponse correcte');
    fireEvent.click(checks[0]);
    fireEvent.click(checks[1]);

    const addBtn = screen.getByText('Ajouter la question') as HTMLButtonElement;
    expect(addBtn).not.toBeDisabled();

    // supprimer l'option 5 (trash du dernier item) -> pour couvrir removeOption
    const trashButtons = screen.getAllByLabelText("Supprimer l'option");
    fireEvent.click(trashButtons[trashButtons.length - 1]); // supprime option 5

    // toujours submit ok (>=2 correct) + options remplies (4 restent)
    expect(screen.getByText('Ajouter la question')).not.toBeDisabled();

    fireEvent.click(screen.getByText('Ajouter la question'));

    expect(onAdd).toHaveBeenCalledTimes(1);
    const payload = onAdd.mock.calls[0][0];

    expect(payload.type).toBe(TypeQuestion.CHOIX_MULTIPLE);
    expect(payload.points).toBe(5);
    expect(payload.options.length).toBe(4);
    expect(payload.options.filter((o: any) => o.isCorrect).length).toBe(2);

    // explication vide => undefined (branche)
    expect(payload.explication).toBeUndefined();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close dialog on "Annuler"', () => {
    const onAdd = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onAdd={onAdd} />);

    fireEvent.click(screen.getByText('Annuler'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should not submit CHOIX_MULTIPLE if less than 2 correct answers', () => {
    const onAdd = jest.fn();
    const onOpenChange = jest.fn();

    render(<QuestionDialog open={true} onOpenChange={onOpenChange} onAdd={onAdd} />);

    // switch type
    fireEvent.change(screen.getByLabelText('select-type'), {
      target: { value: TypeQuestion.CHOIX_MULTIPLE },
    });

    fireEvent.change(screen.getByPlaceholderText('Quelle est votre question ?'), {
      target: { value: 'Q ?' },
    });

    fireEvent.change(screen.getByPlaceholderText('Option 1'), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), { target: { value: 'B' } });
    fireEvent.change(screen.getByPlaceholderText('Option 3'), { target: { value: 'C' } });
    fireEvent.change(screen.getByPlaceholderText('Option 4'), { target: { value: 'D' } });

    // cocher une seule option => disabled
    const checks = screen.getAllByLabelText('Réponse correcte');
    fireEvent.click(checks[0]);

    expect(screen.getByText('Ajouter la question')).toBeDisabled();
    fireEvent.click(screen.getByText('Ajouter la question'));

    expect(onAdd).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
