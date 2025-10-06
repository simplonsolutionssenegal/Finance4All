import { renderHook, act } from '@testing-library/react';

import { useDropdownData, useDropdownState } from '@/hooks/useDropdownData';
import type { DropdownOption } from '@/lib/dropdown-types';

// Mock de la fonction createEntityOptions
jest.mock('@/lib/dropdown-utils', () => ({
  createEntityOptions: jest.fn((data: any[], iconField?: string, descriptionField?: string) => {
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      value: item,
      icon: iconField ? item[iconField] : undefined,
      description: descriptionField ? item[descriptionField] : undefined,
    }));
  }),
}));

describe('useDropdownData', () => {
  const mockData = [
    { id: '1', name: 'Option 1', icon: '🏦', description: 'Description 1' },
    { id: '2', name: 'Option 2', icon: '💰', description: 'Description 2' },
    { id: '3', name: 'Option 3', icon: '📊', description: 'Description 3' },
  ];

  it('should create options from data without icon and description fields', () => {
    const { result } = renderHook(() => useDropdownData(mockData));

    expect(result.current.options).toHaveLength(3);
    expect(result.current.options[0]).toEqual({
      id: '1',
      name: 'Option 1',
      value: mockData[0],
      icon: undefined,
      description: undefined,
    });
  });

  it('should create options from data with icon field', () => {
    const { result } = renderHook(() => useDropdownData(mockData, 'icon'));

    expect(result.current.options).toHaveLength(3);
    expect(result.current.options[0]).toEqual({
      id: '1',
      name: 'Option 1',
      value: mockData[0],
      icon: '🏦',
      description: undefined,
    });
  });

  it('should create options from data with description field', () => {
    const { result } = renderHook(() => useDropdownData(mockData, undefined, 'description'));

    expect(result.current.options).toHaveLength(3);
    expect(result.current.options[0]).toEqual({
      id: '1',
      name: 'Option 1',
      value: mockData[0],
      icon: undefined,
      description: 'Description 1',
    });
  });

  it('should create options from data with both icon and description fields', () => {
    const { result } = renderHook(() => useDropdownData(mockData, 'icon', 'description'));

    expect(result.current.options).toHaveLength(3);
    expect(result.current.options[0]).toEqual({
      id: '1',
      name: 'Option 1',
      value: mockData[0],
      icon: '🏦',
      description: 'Description 1',
    });
  });

  it('should handle empty data array', () => {
    const { result } = renderHook(() => useDropdownData([]));

    expect(result.current.options).toHaveLength(0);
  });

  it('should memoize options when dependencies do not change', () => {
    const { result, rerender } = renderHook(() => useDropdownData(mockData, 'icon'));

    const firstOptions = result.current.options;
    rerender();
    const secondOptions = result.current.options;

    expect(firstOptions).toBe(secondOptions);
  });

  it('should recreate options when data changes', () => {
    const { result, rerender } = renderHook(({ data }) => useDropdownData(data, 'icon'), {
      initialProps: { data: mockData },
    });

    const firstOptions = result.current.options;
    const newData = [
      ...mockData,
      { id: '4', name: 'Option 4', icon: '🔒', description: 'Description 4' },
    ];

    rerender({ data: newData });
    const secondOptions = result.current.options;

    expect(firstOptions).not.toBe(secondOptions);
    expect(secondOptions).toHaveLength(4);
  });
});

describe('useDropdownState', () => {
  const mockOptions: DropdownOption<string>[] = [
    { id: '1', name: 'Option 1', value: 'value1', description: 'Description 1' },
    { id: '2', name: 'Option 2', value: 'value2', description: 'Description 2' },
    { id: '3', name: 'Option 3', value: 'value3', description: 'Description 3' },
  ];

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selected).toBe(null);
    expect(result.current.filteredOptions).toEqual(mockOptions);
  });

  it('should initialize with searchable enabled', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selected).toBe(null);
    expect(result.current.filteredOptions).toEqual(mockOptions);
  });

  it('should toggle dropdown open state', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions));

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.handleToggle();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.handleToggle();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should close dropdown', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions));

    act(() => {
      result.current.handleToggle();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should handle option selection', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions));

    act(() => {
      result.current.handleSelect(mockOptions[0]);
    });

    expect(result.current.selected).toBe(mockOptions[0]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
  });

  it('should not select disabled options', () => {
    const disabledOption = { ...mockOptions[0], disabled: true };
    const { result } = renderHook(() =>
      useDropdownState([disabledOption, ...mockOptions.slice(1)])
    );

    act(() => {
      result.current.handleSelect(disabledOption);
    });

    expect(result.current.selected).toBe(null);
  });

  it('should filter options when searching (searchable enabled)', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('Option 1');
    });

    expect(result.current.filteredOptions).toHaveLength(1);
    expect(result.current.filteredOptions[0]).toBe(mockOptions[0]);
  });

  it('should filter options by description when searching', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('Description 2');
    });

    expect(result.current.filteredOptions).toHaveLength(1);
    expect(result.current.filteredOptions[0]).toBe(mockOptions[1]);
  });

  it('should perform case-insensitive search', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('option 1');
    });

    expect(result.current.filteredOptions).toHaveLength(1);
    expect(result.current.filteredOptions[0]).toBe(mockOptions[0]);
  });

  it('should return all options when search term is empty', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('Option 1');
    });

    expect(result.current.filteredOptions).toHaveLength(1);

    act(() => {
      result.current.setSearchTerm('');
    });

    expect(result.current.filteredOptions).toEqual(mockOptions);
  });

  it('should not filter when searchable is disabled', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, false));

    act(() => {
      result.current.setSearchTerm('Option 1');
    });

    expect(result.current.filteredOptions).toEqual(mockOptions);
  });

  it('should clear search term', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('test');
    });

    expect(result.current.searchTerm).toBe('test');

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchTerm).toBe('');
  });

  it('should set selected option directly', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions));

    act(() => {
      result.current.setSelected(mockOptions[1]);
    });

    expect(result.current.selected).toBe(mockOptions[1]);
  });

  it('should set search term directly', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('custom search');
    });

    expect(result.current.searchTerm).toBe('custom search');
  });

  it('should set isOpen state directly', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions));

    act(() => {
      result.current.setIsOpen(true);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should handle multiple search terms', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('Option');
    });

    expect(result.current.filteredOptions).toHaveLength(3);

    act(() => {
      result.current.setSearchTerm('1');
    });

    expect(result.current.filteredOptions).toHaveLength(1);
  });

  it('should handle partial matches', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('tion');
    });

    expect(result.current.filteredOptions).toHaveLength(3);
  });

  it('should handle no matches', () => {
    const { result } = renderHook(() => useDropdownState(mockOptions, true));

    act(() => {
      result.current.setSearchTerm('nonexistent');
    });

    expect(result.current.filteredOptions).toHaveLength(0);
  });
});
