import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  useSimulatorParams,
  useSimulatorEstimation,
  useSimulatorIsAnimating,
  useSimulatorInstitutions,
  useSimulatorActions,
} from '@/lib/simulator-store';
import type { Service } from '@/lib/simulator-types';
import { calculateEstimation } from '@/lib/simulator-utils';

import { useGetInstitutions } from './institution/useGetInstitutions';

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
  const queryClient = useQueryClient();

  // Récupérer les institutions réelles du backend
  const { institutions: backendInstitutions, isLoading } = useGetInstitutions({
    page: 1,
    limit: 20,
  });

  // Initialiser les institutions dans le store quand elles sont chargées
  useEffect(() => {
    if (backendInstitutions && backendInstitutions.length > 0 && institutions.length === 0) {
      actions.setInstitutions(backendInstitutions);
    }
  }, [backendInstitutions, institutions.length, actions]);

  // Calculer l'estimation en temps réel
  useEffect(() => {
    if (params.service) {
      actions.setIsAnimating(true);
      const timer = setTimeout(() => {
        const newEstimation = calculateEstimation(params);
        actions.setEstimation(newEstimation);
        actions.setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [params, actions]);

  const getAvailableServices = (): Service[] => {
    return params.institution?.services || [];
  };

  const resetSimulation = () => {
    // Réinitialiser l'état de la simulation
    actions.resetSimulation();

    // Invalider le cache des institutions pour forcer un rechargement
    queryClient.invalidateQueries({ queryKey: ['institutions'] });

    // Réinitialiser aussi les institutions dans le store
    actions.setInstitutions([]);
  };

  return {
    // État
    params,
    estimation,
    isAnimating,
    institutions,
    isLoading,

    // Fonctions
    updateParam: actions.updateParam,
    getAvailableServices,
    resetSimulation,
  };
}
