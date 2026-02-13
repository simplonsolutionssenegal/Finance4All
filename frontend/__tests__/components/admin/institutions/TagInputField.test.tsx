import { TagInputField } from '@/components/admin/institutions/TagInputField';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock des composants UI
jest.mock('@/components/admin/institutions/Chip', () => ({
  __esModule: true,
  default: ({ children, onClick, className, ariaLabel }: any) => (
    <button onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/form', () => ({
  FormLabel: ({ children, className }: any) => <label className={className}>{children}</label>,
  FormMessage: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, className, disabled, onKeyDown }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      onKeyDown={onKeyDown}
    />
  ),
}));

describe('TagInputField', () => {
  const defaultProps = {
    label: 'Tags',
    placeholder: 'Ajouter un tag',
    value: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le label et le placeholder', () => {
    render(<TagInputField {...defaultProps} />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ajouter un tag')).toBeInTheDocument();
  });

  it('ajoute un tag avec le bouton Plus', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TagInputField {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Ajouter un tag');
    await user.type(input, 'nouveau tag');

    const addButton = screen.getByRole('button', { name: '' });
    await user.click(addButton);

    expect(onChange).toHaveBeenCalledWith(['nouveau tag']);
  });

  it('ajoute un tag en appuyant sur Enter', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TagInputField {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Ajouter un tag');
    await user.type(input, 'tag enter{Enter}');

    expect(onChange).toHaveBeenCalledWith(['tag enter']);
  });

  it('vide le champ input après ajout', async () => {
    const user = userEvent.setup();
    render(<TagInputField {...defaultProps} />);

    const input = screen.getByPlaceholderText('Ajouter un tag') as HTMLInputElement;
    await user.type(input, 'test{Enter}');

    expect(input.value).toBe('');
  });

  it('ignore les espaces avant et après', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TagInputField {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Ajouter un tag');
    await user.type(input, '  tag avec espaces  {Enter}');

    expect(onChange).toHaveBeenCalledWith(['tag avec espaces']);
  });

  it("n'ajoute pas de tag vide", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TagInputField {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Ajouter un tag');
    await user.type(input, '   {Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it("n'ajoute pas de doublon", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TagInputField {...defaultProps} value={['tag existant']} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Ajouter un tag');
    await user.type(input, 'tag existant{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('affiche les tags existants', () => {
    render(<TagInputField {...defaultProps} value={['tag1', 'tag2', 'tag3']} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
  });

  it('supprime un tag quand on clique dessus', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TagInputField {...defaultProps} value={['tag1', 'tag2']} onChange={onChange} />);

    const chip = screen.getByLabelText('Supprimer tag1');
    await user.click(chip);

    expect(onChange).toHaveBeenCalledWith(['tag2']);
  });

  it('désactive le bouton Plus quand input est vide', () => {
    render(<TagInputField {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: '' });
    expect(addButton).toBeDisabled();
  });

  it('désactive tous les contrôles quand disabled=true', () => {
    render(<TagInputField {...defaultProps} disabled={true} value={['tag1']} />);

    const input = screen.getByPlaceholderText('Ajouter un tag');
    const addButton = screen.getByRole('button', { name: '' });

    expect(input).toBeDisabled();
    expect(addButton).toBeDisabled();
  });

  it('ne supprime pas les tags quand disabled=true', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <TagInputField {...defaultProps} disabled={true} value={['tag1']} onChange={onChange} />
    );

    const chip = screen.getByLabelText('Supprimer tag1');
    await user.click(chip);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("applique les styles d'erreur quand error=true", () => {
    render(<TagInputField {...defaultProps} error={true} />);

    const input = screen.getByPlaceholderText('Ajouter un tag');
    expect(input.className).toContain('border-red-500');
  });

  it("n'affiche pas la liste de tags si value est vide", () => {
    const { container } = render(<TagInputField {...defaultProps} value={[]} />);

    const chipContainer = container.querySelector('.flex.flex-wrap.gap-2.mt-2');
    expect(chipContainer).not.toBeInTheDocument();
  });
});
