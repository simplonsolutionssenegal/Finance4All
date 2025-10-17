import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SimulationParams, Estimation, Institution, Service } from './simulator-types';

// Interface pour l'état du store
interface SimulatorState {
  // État
  params: SimulationParams;
  estimation: Estimation | null;
  isAnimating: boolean;
  institutions: Institution[];

  // Actions
  updateParam: (key: keyof SimulationParams, value: Institution | Service | number | null) => void;
  setEstimation: (estimation: Estimation | null) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setInstitutions: (institutions: Institution[]) => void;
  resetSimulation: () => void;
}

// État initial
const initialState = {
  institution: null,
  service: null,
  amount: 0,
  selectedPlafondIndex: 0,
};

// Création du store Zustand avec middleware persist
export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, _get) => ({
      // État initial
      params: initialState,
      estimation: null,
      isAnimating: false,
      institutions: [],

      // Actions
      updateParam: (key, value) => {
        set(state => ({
          params: { ...state.params, [key]: value },
        }));
      },

      setEstimation: estimation => {
        set({ estimation });
      },

      setIsAnimating: isAnimating => {
        set({ isAnimating });
      },

      setInstitutions: institutions => {
        set({ institutions });
      },

      resetSimulation: () => {
        set({
          params: initialState,
          estimation: null,
          isAnimating: false,
        });
      },
    }),
    {
      name: 'service-simulator-storage', // Clé
      partialize: state => ({
        // On ne persiste que les paramètres, pas l'estimation ni l'animation
        params: state.params,
      }),
    }
  )
);

// Sélecteurs pour optimiser les re-renders
export const useSimulatorParams = () => useSimulatorStore(state => state.params);
export const useSimulatorEstimation = () => useSimulatorStore(state => state.estimation);
export const useSimulatorIsAnimating = () => useSimulatorStore(state => state.isAnimating);
export const useSimulatorInstitutions = () => useSimulatorStore(state => state.institutions);

// Actions exportées pour faciliter l'utilisation
export const useSimulatorActions = () => {
  const updateParam = useSimulatorStore(state => state.updateParam);
  const setEstimation = useSimulatorStore(state => state.setEstimation);
  const setIsAnimating = useSimulatorStore(state => state.setIsAnimating);
  const setInstitutions = useSimulatorStore(state => state.setInstitutions);
  const resetSimulation = useSimulatorStore(state => state.resetSimulation);

  return {
    updateParam,
    setEstimation,
    setIsAnimating,
    setInstitutions,
    resetSimulation,
  };
};
