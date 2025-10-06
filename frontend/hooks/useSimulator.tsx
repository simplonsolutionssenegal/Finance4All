import { useState, useEffect, useMemo } from 'react';

import { STORAGE_KEY } from '@/lib/simulator-constants';
import type {
  SimulationParams,
  Estimation,
  Institution,
  InstitutionProduct,
} from '@/lib/simulator-types';
import { calculateEstimation, generateInstitutions } from '@/lib/simulator-utils';

/**
 * Hook personnalisé pour gérer l'état et la logique du simulateur
 * @returns Objet contenant l'état et les fonctions de gestion du simulateur
 */
export function useSimulator() {
  const [params, setParams] = useState<SimulationParams>({
    institution: null,
    product: null,
    amount: 0,
    duration: 0,
  });
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Génération des institutions (mémorisée)
  const institutions = useMemo(() => generateInstitutions(), []);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedParams = localStorage.getItem(STORAGE_KEY);
    if (savedParams) {
      try {
        const parsed = JSON.parse(savedParams);
        const institution = institutions.find(inst => inst.id === parsed.institutionId);
        const product = institution?.products.find(
          (prod: InstitutionProduct) => prod.id === parsed.productId
        );
        setParams({
          institution: institution || null,
          product: product || null,
          amount: parsed.amount || 0,
          duration: parsed.duration || 0,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }, [institutions]);

  // Sauvegarder automatiquement
  useEffect(() => {
    if (params.institution && params.product) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          institutionId: params.institution.id,
          productId: params.product.id,
          amount: params.amount,
          duration: params.duration,
        })
      );
    }
  }, [params]);

  // Calculer l'estimation en temps réel
  useEffect(() => {
    if (params.product) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        const newEstimation = calculateEstimation(params);
        setEstimation(newEstimation);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const updateParam = (
    key: keyof SimulationParams,
    value: Institution | InstitutionProduct | number | null
  ) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const getAvailableProducts = (): InstitutionProduct[] => {
    return params.institution?.products || [];
  };

  const getCurrentLimits = () => {
    return (
      params.product?.limits || { amount: { min: 0, max: 100000 }, duration: { min: 1, max: 10 } }
    );
  };

  const resetSimulation = () => {
    setParams({
      institution: null,
      product: null,
      amount: 0,
      duration: 0,
    });
    setEstimation(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    // État
    params,
    estimation,
    isAnimating,
    institutions,

    // Fonctions
    updateParam,
    getAvailableProducts,
    getCurrentLimits,
    resetSimulation,
  };
}
