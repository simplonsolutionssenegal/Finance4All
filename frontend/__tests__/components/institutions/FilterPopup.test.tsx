import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FilterPopup from '@/components/institutions/FilterPopup';
import {
  EMPTY_FILTERS,
  TYPE_OPTIONS,
  DATE_OPTIONS,
} from '@/components/institutions/filters/options';
import type { FilterOptions, DateFilter } from '@/types/FilterOptions';
import type { ServiceType } from '@/types/ServiceType';

describe('FilterPopup', () => {
  const baseProps = {
    isOpen: true,
    value: EMPTY_FILTERS,
    onChange: jest.fn(),
    onClose: jest.fn(),
    onApply: jest.fn(),
    onCancel: undefined as (() => void) | undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ne rend rien si isOpen=false', () => {
    const { container } = render(<FilterPopup {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('rend le dialog et les boutons quand isOpen=true', () => {
    render(<FilterPopup {...baseProps} />);
    expect(
      screen.getByRole('dialog', { name: /filtres des produits financiers/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
  });

  it('désactive "Confirmer" quand aucun filtre sélectionné', () => {
    render(<FilterPopup {...baseProps} value={EMPTY_FILTERS} />);
    expect(screen.getByText('Confirmer')).toHaveAttribute('disabled');
  });

  it('active "Confirmer" quand des filtres existent', () => {
    const withFilters: FilterOptions = {
      // on utilise les options typées pour éviter les erreurs TS
      type: [TYPE_OPTIONS.find(o => o.value === 'CREDIT')!.value] as ServiceType[],
      zone: ['DAKAR'],
      date: DATE_OPTIONS.find(o => o.value === 'recent')!.value as DateFilter,
    };

    render(<FilterPopup {...baseProps} value={withFilters} />);
    expect(screen.getByText('Confirmer')).not.toHaveAttribute('disabled');
  });

  it('clic "Réinitialiser" appelle onChange(EMPTY_FILTERS)', () => {
    const onChange = jest.fn();
    render(<FilterPopup {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('Réinitialiser'));
    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it('clic "Annuler" reset l’UI et appelle onCancel si fourni', () => {
    const onChange = jest.fn();
    const onCancel = jest.fn();
    render(<FilterPopup {...baseProps} onChange={onChange} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Annuler'));
    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTERS); // reset UI
    expect(onCancel).toHaveBeenCalledTimes(1); // laisse l’adaptateur décider pour la liste
  });

  it('clic "Confirmer" appelle onApply(value) puis onClose()', () => {
    const withFilters: FilterOptions = {
      type: ['CREDIT'] as ServiceType[],
      zone: ['DAKAR'],
      date: 'recent' as DateFilter,
    };
    const onApply = jest.fn();
    const onClose = jest.fn();

    render(<FilterPopup {...baseProps} value={withFilters} onApply={onApply} onClose={onClose} />);

    fireEvent.click(screen.getByText('Confirmer'));
    expect(onApply).toHaveBeenCalledWith(withFilters);
    expect(onClose).toHaveBeenCalled();
  });
});
