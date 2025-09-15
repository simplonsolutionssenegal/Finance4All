import { renderHook, act } from '@testing-library/react';

import { useFormState } from '@/hooks/useFormState';

interface TestFormValues extends Record<string, unknown> {
  email: string;
  password: string;
  age: number;
}

describe('useFormState', () => {
  const initialValues: TestFormValues = {
    email: '',
    password: '',
    age: 0,
  };

  it('should initialize with provided values and empty errors', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    expect(result.current.formState.values).toEqual(initialValues);
    expect(result.current.formState.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('should update field value and clear its error', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    act(() => {
      result.current.updateField('email', 'test@example.com');
    });

    expect(result.current.formState.values.email).toBe('test@example.com');
    expect(result.current.formState.errors.email).toBe('');
  });

  it('should set field error', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    act(() => {
      result.current.setFieldError('email', 'Email is required');
    });

    expect(result.current.formState.errors.email).toBe('Email is required');
    expect(result.current.hasError('email')).toBe(true);
    expect(result.current.getError('email')).toBe('Email is required');
  });

  it('should set multiple errors', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    act(() => {
      result.current.setErrors({
        email: 'Email is required',
        password: 'Password is required',
      });
    });

    expect(result.current.formState.errors.email).toBe('Email is required');
    expect(result.current.formState.errors.password).toBe('Password is required');
    expect(result.current.isValid).toBe(false);
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    // First set some errors
    act(() => {
      result.current.setErrors({
        email: 'Email is required',
        password: 'Password is required',
      });
    });

    expect(result.current.isValid).toBe(false);

    // Then clear them
    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.formState.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('should reset form to initial values', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    // Update values and set errors
    act(() => {
      result.current.updateField('email', 'test@example.com');
      result.current.updateField('password', 'password123');
      result.current.setFieldError('email', 'Some error');
    });

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formState.values).toEqual(initialValues);
    expect(result.current.formState.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('should correctly identify valid state', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    // Initially valid
    expect(result.current.isValid).toBe(true);

    // Set an error
    act(() => {
      result.current.setFieldError('email', 'Error');
    });

    expect(result.current.isValid).toBe(false);

    // Clear the error
    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.isValid).toBe(true);
  });

  it('should handle different data types', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    act(() => {
      result.current.updateField('age', 25);
    });

    expect(result.current.formState.values.age).toBe(25);
    expect(typeof result.current.formState.values.age).toBe('number');
  });

  it('should preserve other fields when updating one field', () => {
    const { result } = renderHook(() => useFormState(initialValues));

    // Set initial values
    act(() => {
      result.current.updateField('email', 'test@example.com');
      result.current.updateField('password', 'password123');
    });

    // Update only email
    act(() => {
      result.current.updateField('email', 'new@example.com');
    });

    expect(result.current.formState.values.email).toBe('new@example.com');
    expect(result.current.formState.values.password).toBe('password123');
  });
});
