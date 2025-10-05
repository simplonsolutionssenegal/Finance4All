import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import FilterPopupAdapter from '@/components/institutions/filters/FilterPopupAdapter';
import {
  EMPTY_FILTERS,
  TYPE_OPTIONS,
  DATE_OPTIONS,
} from '@/components/institutions/filters/options';
import type { FilterOptions, DateFilter } from '@/types/FilterOptions';
import type { ServiceType } from '@/types/ServiceType';

// 🧪 Mock du composant enfant FilterPopup pour contrôler l'UI dans nos tests
jest.mock('@/components/institutions/FilterPopup', () => {
  // on renvoie un composant React qui affiche les props importantes
  return function MockFilterPopup(props: {
    isOpen: boolean;
    value: FilterOptions;
    onChange: (v: FilterOptions) => void;
    onClose: () => void;
    onApply: (f: FilterOptions) => void;
    onCancel?: () => void;
  }) {
    if (!props.isOpen) return null;
    return (
      <div role='dialog' aria-label='Filtres des produits financiers'>
        <div data-testid='fp-is-open'>{String(props.isOpen)}</div>
        <div data-testid='fp-value'>{JSON.stringify(props.value)}</div>
        {/* Boutons de test pour simuler l'action de l'enfant */}
        <button onClick={() => props.onApply(props.value)}>__apply__</button>
        <button onClick={() => props.onCancel && props.onCancel!()}>__cancel__</button>
      </div>
    );
  };
});

describe('FilterPopupAdapter', () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    onApplyFilters: jest.fn(),
    currentFilters: EMPTY_FILTERS,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ne rend rien quand isOpen=false', () => {
    const { container } = render(<FilterPopupAdapter {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('synchronise sa valeur interne avec currentFilters à l’ouverture', () => {
    const currentFilters: FilterOptions = {
      type: [TYPE_OPTIONS.find(o => o.value === 'CREDIT')!.value] as ServiceType[],
      zone: ['DAKAR'],
      date: DATE_OPTIONS.find(o => o.value === 'recent')!.value as DateFilter,
    };

    render(<FilterPopupAdapter {...baseProps} currentFilters={currentFilters} />);

    // le mock FilterPopup affiche la value qu’il reçoit
    const valueNode = screen.getByTestId('fp-value');
    expect(valueNode.textContent).toBe(JSON.stringify(currentFilters));
  });

  it('relaye onApply → onApplyFilters(value) et onClose()', () => {
    const onApplyFilters = jest.fn();
    const onClose = jest.fn();

    const currentFilters: FilterOptions = {
      type: ['CREDIT'] as ServiceType[],
      zone: ['DAKAR'],
      date: 'recent' as DateFilter,
    };

    render(
      <FilterPopupAdapter
        isOpen
        onClose={onClose}
        onApplyFilters={onApplyFilters}
        currentFilters={currentFilters}
      />
    );

    // clique sur le bouton __apply__ du mock enfant
    fireEvent.click(screen.getByText('__apply__'));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onApplyFilters).toHaveBeenCalledWith(currentFilters);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('relaye onCancel → reset liste (EMPTY_FILTERS) + onClose()', () => {
    const onApplyFilters = jest.fn();
    const onClose = jest.fn();

    render(
      <FilterPopupAdapter
        isOpen
        onClose={onClose}
        onApplyFilters={onApplyFilters}
        currentFilters={{
          type: ['CREDIT'] as ServiceType[],
          zone: ['DAKAR'],
          date: 'recent' as DateFilter,
        }}
      />
    );

    // clique sur le bouton __cancel__ du mock enfant
    fireEvent.click(screen.getByText('__cancel__'));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onApplyFilters).toHaveBeenCalledWith(EMPTY_FILTERS);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
