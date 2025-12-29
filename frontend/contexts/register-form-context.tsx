'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface RegisterFormContextType {
  step: number;
  setStep: (step: number) => void;
}

const RegisterFormContext = createContext<RegisterFormContextType | undefined>(undefined);

export function RegisterFormProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);

  return (
    <RegisterFormContext.Provider value={{ step, setStep }}>
      {children}
    </RegisterFormContext.Provider>
  );
}

export function useRegisterFormStep() {
  const context = useContext(RegisterFormContext);
  if (context === undefined) {
    throw new Error(
      "Une erreur est survenue lors de la récupération de l'étape du formulaire de connexion"
    );
  }
  return context;
}

export function useRegisterFormStepOptional() {
  const context = useContext(RegisterFormContext);
  return context ?? null;
}
