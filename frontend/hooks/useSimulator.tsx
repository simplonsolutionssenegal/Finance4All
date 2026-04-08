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

import { useGetInstitution } from './institution/useGetInstitution';
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

  // Récupérer les détails (avec services) de l'institution sélectionnée
  const selectedInstitutionId = params.institution?.id ?? '';
  const { institution: institutionDetail } = useGetInstitution(selectedInstitutionId);

  // Quand les détails de l'institution sont chargés, mettre à jour le store
  // pour que params.institution contienne les services
  useEffect(() => {
    if (
      institutionDetail &&
      institutionDetail.services &&
      params.institution &&
      institutionDetail.id === params.institution.id &&
      !params.institution.services?.length
    ) {
      actions.updateParam('institution', institutionDetail);
    }
  }, [institutionDetail, params.institution, actions]);

  // Initialiser les institutions dans le store quand elles sont chargées
  useEffect(() => {
    if (backendInstitutions && backendInstitutions.length > 0 && institutions.length === 0) {
      actions.setInstitutions(backendInstitutions);
    }
  }, [backendInstitutions, institutions.length, actions]);

  // Calculer l'estimation en temps réel
  useEffect(() => {
    if (params.service && params.amount > 0) {
      actions.setIsAnimating(true);
      const timer = setTimeout(() => {
        const newEstimation = calculateEstimation(params);
        actions.setEstimation(newEstimation);
        actions.setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      actions.setEstimation(null);
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
