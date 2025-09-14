import { renderHook, act } from '@testing-library/react';
import React from 'react';

import { useLoader, LoaderProvider } from '@/contexts/LoaderContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LoaderProvider>{children}</LoaderProvider>
);

describe('LoaderContext', () => {
  it('should provide initial loading state as false', () => {
    const { result } = renderHook(() => useLoader(), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });

  it('should show loader when showLoader is called', () => {
    const { result } = renderHook(() => useLoader(), { wrapper });

    act(() => {
      result.current.showLoader();
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should hide loader when hideLoader is called', () => {
    const { result } = renderHook(() => useLoader(), { wrapper });

    act(() => {
      result.current.showLoader();
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.hideLoader();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should toggle loading state correctly', () => {
    const { result } = renderHook(() => useLoader(), { wrapper });

    // Initial state
    expect(result.current.isLoading).toBe(false);

    // Show loader
    act(() => {
      result.current.showLoader();
    });
    expect(result.current.isLoading).toBe(true);

    // Hide loader
    act(() => {
      result.current.hideLoader();
    });
    expect(result.current.isLoading).toBe(false);

    // Show again
    act(() => {
      result.current.showLoader();
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('should throw error when used outside provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useLoader());
    }).toThrow('useLoader must be used within a LoaderProvider');

    consoleErrorSpy.mockRestore();
  });
});