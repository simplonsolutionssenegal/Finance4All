import { renderHook, act } from '@testing-library/react';

import {
  RegisterFormProvider,
  useRegisterFormStep,
  useRegisterFormStepOptional,
} from '@/contexts/register-form-context';

describe('RegisterFormContext', () => {
  describe('RegisterFormProvider', () => {
    it('provides step with initial value of 1', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RegisterFormProvider>{children}</RegisterFormProvider>
      );

      const { result } = renderHook(() => useRegisterFormStep(), { wrapper });

      expect(result.current.step).toBe(1);
      expect(typeof result.current.setStep).toBe('function');
    });

    it('allows updating step value', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RegisterFormProvider>{children}</RegisterFormProvider>
      );

      const { result } = renderHook(() => useRegisterFormStep(), { wrapper });

      expect(result.current.step).toBe(1);

      act(() => {
        result.current.setStep(2);
      });

      expect(result.current.step).toBe(2);

      act(() => {
        result.current.setStep(1);
      });

      expect(result.current.step).toBe(1);
    });
  });

  describe('useRegisterFormStep', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useRegisterFormStep());
      }).toThrow(
        "Une erreur est survenue lors de la récupération de l'étape du formulaire de connexion"
      );

      consoleSpy.mockRestore();
    });

    it('returns context when used inside provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RegisterFormProvider>{children}</RegisterFormProvider>
      );

      const { result } = renderHook(() => useRegisterFormStep(), { wrapper });

      expect(result.current).toHaveProperty('step');
      expect(result.current).toHaveProperty('setStep');
    });
  });

  describe('useRegisterFormStepOptional', () => {
    it('returns null when used outside provider', () => {
      const { result } = renderHook(() => useRegisterFormStepOptional());

      expect(result.current).toBeNull();
    });

    it('returns context when used inside provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RegisterFormProvider>{children}</RegisterFormProvider>
      );

      const { result } = renderHook(() => useRegisterFormStepOptional(), { wrapper });

      expect(result.current).not.toBeNull();
      expect(result.current?.step).toBe(1);
      expect(typeof result.current?.setStep).toBe('function');
    });

    it('allows updating step value through optional hook', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <RegisterFormProvider>{children}</RegisterFormProvider>
      );

      const { result } = renderHook(() => useRegisterFormStepOptional(), { wrapper });

      expect(result.current?.step).toBe(1);

      act(() => {
        result.current?.setStep(2);
      });

      expect(result.current?.step).toBe(2);
    });
  });
});
