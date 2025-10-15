// __tests__/components/institutions/filters/FilterSection.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import FilterSection from '@/components/admin/institutions/filters/FilterSection';

describe('FilterSection', () => {
  it('rend un fieldset accessible avec le titre et les enfants', () => {
    const title = 'Types de services';
    render(
      <FilterSection title={title}>
        <span>contenu enfant</span>
      </FilterSection>
    );

    // Le fieldset est labellisé par le <legend>, donc accessible via role=group + name
    const fieldset = screen.getByRole('group', { name: title });
    expect(fieldset).toBeInTheDocument();

    // Le contenu enfant est rendu
    expect(screen.getByText('contenu enfant')).toBeInTheDocument();

    // Le <legend> est visible
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('affiche le séparateur (la ligne fine) entre le titre et le contenu', () => {
    const { container } = render(
      <FilterSection title='Filtres'>
        <div>child</div>
      </FilterSection>
    );

    // On cible l'élément ayant la classe de hauteur (h-px)
    const separator = container.querySelector('div.h-px');
    expect(separator).toBeTruthy();
    expect(separator).toHaveClass('bg-[#EAEAEA]', 'w-full');
  });

  it('affiche quand même le séparateur même si le titre est vide', () => {
    const { container } = render(
      <FilterSection title=''>
        <span>child</span>
      </FilterSection>
    );

    // Le séparateur est toujours rendu même sans titre
    const separator = container.querySelector('div.h-px');
    expect(separator).toBeTruthy();

    // Le fieldset existe
    expect(screen.getByRole('group')).toBeInTheDocument();

    // Mais pas de <legend> si title est vide
    const legends = container.querySelectorAll('legend');
    expect(legends).toHaveLength(0);
  });

  it('applique les bonnes classes CSS au fieldset', () => {
    const { container } = render(
      <FilterSection title='Test'>
        <div>content</div>
      </FilterSection>
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toHaveClass('mb-4');
  });

  it('applique les bonnes classes CSS au legend', () => {
    render(
      <FilterSection title='Mon titre'>
        <div>content</div>
      </FilterSection>
    );

    const legend = screen.getByText('Mon titre');
    expect(legend).toHaveClass('text-sm', 'font-bold', 'text-black', 'mt-2');
  });

  it('rend plusieurs enfants correctement', () => {
    render(
      <FilterSection title='Filtres multiples'>
        <div>Premier enfant</div>
        <div>Deuxième enfant</div>
        <button>Bouton</button>
      </FilterSection>
    );

    expect(screen.getByText('Premier enfant')).toBeInTheDocument();
    expect(screen.getByText('Deuxième enfant')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bouton' })).toBeInTheDocument();
  });

  it('le séparateur a les bonnes classes de style', () => {
    const { container } = render(
      <FilterSection title='Test'>
        <div>content</div>
      </FilterSection>
    );

    const separator = container.querySelector('div.h-px');
    expect(separator).toHaveClass('mt-2', 'mb-3', 'h-px', 'bg-[#EAEAEA]', 'w-full');
  });
});
