import { render, screen, fireEvent } from '@testing-library/react';
import ChipRadioGroup from '@/components/institutions/filters/BadgeRadioGroup';

type D = 'recent' | '3mois';
const options = [
  { value: 'recent' as D, label: 'Récente' },
  { value: '3mois' as D, label: 'Il y a 3 mois' },
] as const;

describe('ChipRadioGroup', () => {
  it('affiche les options et la sélection', () => {
    render(<ChipRadioGroup name='date' options={options} value='recent' onChange={() => {}} />);
    expect(screen.getByText('Récente')).toBeInTheDocument();
    expect(screen.getByText('Il y a 3 mois')).toBeInTheDocument();
  });

  it('sélectionne une autre option', () => {
    const onChange = jest.fn();
    render(<ChipRadioGroup name='date' options={options} value='' onChange={onChange} />);
    fireEvent.click(screen.getByText('Il y a 3 mois'));
    expect(onChange).toHaveBeenCalledWith('3mois');
  });
});
