import { render, screen, fireEvent } from '@testing-library/react';
import ChipCheckboxGroup from '@/components/institutions/filters/BadgeCheckboxGroup';

type T = 'CREDIT' | 'EPARGNE';

const options = [
  { value: 'CREDIT' as T, label: 'Crédit' },
  { value: 'EPARGNE' as T, label: 'Épargne' },
] as const;

describe('ChipCheckboxGroup', () => {
  it('affiche toutes les options', () => {
    render(<ChipCheckboxGroup options={options} values={[]} onChange={() => {}} />);
    expect(screen.getByText('Crédit')).toBeInTheDocument();
    expect(screen.getByText('Épargne')).toBeInTheDocument();
  });

  it('toggle une valeur', () => {
    const onChange = jest.fn();
    render(<ChipCheckboxGroup options={options} values={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText('Crédit'));
    expect(onChange).toHaveBeenCalledWith(['CREDIT']);
  });

  it('retire une valeur cochée', () => {
    const onChange = jest.fn();
    render(<ChipCheckboxGroup options={options} values={['CREDIT']} onChange={onChange} />);

    fireEvent.click(screen.getByText('Crédit'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
