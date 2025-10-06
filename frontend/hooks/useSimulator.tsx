import { useEffect, useMemo } from 'react';

import {
  useSimulatorParams,
  useSimulatorEstimation,
  useSimulatorIsAnimating,
  useSimulatorInstitutions,
  useSimulatorActions,
} from '@/lib/simulator-store';
import type { InstitutionProduct } from '@/lib/simulator-types';
import { calculateEstimation, generateInstitutions } from '@/lib/simulator-utils';

/**
 * Hook personnalisé pour gérer l'état et la logique du simulateur
 * @returns Objet contenant l'état et les fonctions de gestion du simulateur
 */
export function useSimulator() {
  // Utilisation des sélecteurs Zustand pour optimiser les re-renders
  const params = useSimulatorParams();
  const estimation = useSimulatorEstimation();
  const isAnimating = useSimulatorIsAnimating();
  const institutions = useSimulatorInstitutions();
  const actions = useSimulatorActions();

  // Génération des institutions (mémorisée)
  const generatedInstitutions = useMemo(() => generateInstitutions(), []);

  // Initialiser les institutions dans le store si elles ne sont pas encore définies
  useEffect(() => {
    if (institutions.length === 0) {
      actions.setInstitutions(generatedInstitutions);
    }
  }, [institutions.length, generatedInstitutions, actions]);

  // Calculer l'estimation en temps réel
  useEffect(() => {
    if (params.product) {
      actions.setIsAnimating(true);
      const timer = setTimeout(() => {
        const newEstimation = calculateEstimation(params);
        actions.setEstimation(newEstimation);
        actions.setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [params, actions]);

  const getAvailableProducts = (): InstitutionProduct[] => {
    return params.institution?.products || [];
  };

  const getCurrentLimits = () => {
    return (
      params.product?.limits || { amount: { min: 0, max: 100000 }, duration: { min: 1, max: 10 } }
    );
  };

  return {
    // État
    params,
    estimation,
    isAnimating,
    institutions,

    // Fonctions
    updateParam: actions.updateParam,
    getAvailableProducts,
    getCurrentLimits,
    resetSimulation: actions.resetSimulation,
  };
}
