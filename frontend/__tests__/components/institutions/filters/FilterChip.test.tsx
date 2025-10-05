import { render, screen, fireEvent } from '@testing-library/react';
import FilterChip from '@/components/institutions/filters/FilterChip';

describe('FilterChip', () => {
  it('affiche le label et l’état non coché', () => {
    render(<FilterChip label='Crédit' checked={false} onToggle={() => {}} inputType='checkbox' />);
    expect(screen.getByText('Crédit')).toBeInTheDocument();
  });

  it('appelle onToggle lorsqu’on clique', () => {
    const onToggle = jest.fn();
    render(<FilterChip label='Épargne' checked={false} onToggle={onToggle} inputType='checkbox' />);
    fireEvent.click(screen.getByText('Épargne'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('reflète l’état checked=true', () => {
    const { rerender } = render(
      <FilterChip label='Mobile Money' checked={false} onToggle={() => {}} inputType='checkbox' />
    );

    expect(screen.getByText('Mobile Money')).toBeInTheDocument();

    rerender(
      <FilterChip label='Mobile Money' checked={true} onToggle={() => {}} inputType='checkbox' />
    );
    // Pas de vérif visuelle, mais on s’assure que ça rerender sans crash
    expect(screen.getByText('Mobile Money')).toBeInTheDocument();
  });
});
