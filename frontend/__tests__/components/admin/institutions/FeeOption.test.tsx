import { render, screen } from '@testing-library/react';
import { RadioGroup } from '@/components/ui/radio-group';
import { FeeTypeUI } from '@/types/serviceForm.shared';
import { FeeOption } from '@/components/admin/institutions/FeeOption';

describe('FeeOption', () => {
  const defaultProps = {
    id: 'fee-option-1',
    value: 'FIXE' as FeeTypeUI,
    title: 'Frais fixes',
  };

  it('affiche le titre correctement', () => {
    render(
      <RadioGroup>
        <FeeOption {...defaultProps} />
      </RadioGroup>
    );

    expect(screen.getByText('Frais fixes')).toBeInTheDocument();
  });

  it('affiche la description quand elle est fournie', () => {
    render(
      <RadioGroup>
        <FeeOption {...defaultProps} description='Montant unique' />
      </RadioGroup>
    );

    expect(screen.getByText('Montant unique')).toBeInTheDocument();
  });

  it("n'affiche pas l'icône MoveRight quand il n'y a pas de description", () => {
    const { container } = render(
      <RadioGroup>
        <FeeOption {...defaultProps} />
      </RadioGroup>
    );

    const icon = container.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it("affiche l'icône MoveRight quand il y a une description", () => {
    const { container } = render(
      <RadioGroup>
        <FeeOption {...defaultProps} description='Montant unique' />
      </RadioGroup>
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('associe le label au RadioGroupItem via htmlFor/id', () => {
    render(
      <RadioGroup>
        <FeeOption {...defaultProps} />
      </RadioGroup>
    );

    const label = screen.getByText('Frais fixes').closest('label');
    expect(label).toHaveAttribute('for', 'fee-option-1');
  });

  it('applique la valeur au RadioGroupItem', () => {
    render(
      <RadioGroup>
        <FeeOption {...defaultProps} value='POURCENTAGE' />
      </RadioGroup>
    );

    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('value', 'POURCENTAGE');
  });

  it('applique les classes CSS pour le hover et le cursor', () => {
    const { container } = render(
      <RadioGroup>
        <FeeOption {...defaultProps} />
      </RadioGroup>
    );

    const wrapper = container.querySelector('.hover\\:bg-gray-50');
    expect(wrapper).toHaveClass('cursor-pointer');
  });

  it('rend le label cliquable avec cursor-pointer', () => {
    render(
      <RadioGroup>
        <FeeOption {...defaultProps} />
      </RadioGroup>
    );

    const label = screen.getByText('Frais fixes').closest('label');
    expect(label).toHaveClass('cursor-pointer');
  });
});
