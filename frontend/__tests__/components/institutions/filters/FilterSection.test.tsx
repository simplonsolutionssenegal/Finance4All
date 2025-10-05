import { render, screen } from '@testing-library/react';
import FilterSection from '@/components/institutions/filters/FilterSection';

describe('FilterSection', () => {
  it('affiche le titre et les enfants', () => {
    render(
      <FilterSection title='Type de produit'>
        <div>Contenu interne</div>
      </FilterSection>
    );

    expect(screen.getByText('Type de produit')).toBeInTheDocument();
    expect(screen.getByText('Contenu interne')).toBeInTheDocument();
  });
});
