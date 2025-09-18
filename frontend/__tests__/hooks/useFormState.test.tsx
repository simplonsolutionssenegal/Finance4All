import { renderHook, act } from '@testing-library/react';
import { useFormState } from '@/hooks/useFormState';

describe.skip('useFormState', () => {
  it('should initialize with default state', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useFormState(initialValues));
    expect(result.current.formState.values).toEqual(initialValues);
    expect(result.current.formState.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });
  it('should update field and error', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useFormState(initialValues));
    act(() => {
      result.current.updateField('name', 'John');
    });
    expect(result.current.formState.values.name).toBe('John');
    act(() => {
      result.current.setFieldError('name', 'Erreur');
    });
    expect(result.current.formState.errors.name).toBe('Erreur');
    act(() => {
      result.current.clearErrors();
    });
    expect(result.current.formState.errors).toEqual({});
  });
  it('should reset form', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useFormState(initialValues));
    act(() => {
      result.current.updateField('name', 'John');
      result.current.resetForm();
    });
    expect(result.current.formState.values).toEqual(initialValues);
  });
});
