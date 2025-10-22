'use client';

import { Building2, TrendingUp, Sparkles, RotateCcw, Hash } from 'lucide-react';
import React, { useMemo } from 'react';

import { CustomDropdown } from '@/components/custom-dropdown';
import { Slider } from '@/components/slider';
import { useSimulator } from '@/hooks/useSimulator';
import type { DropdownOption } from '@/lib/dropdown-types';
import { formatCurrency, validateValue, calculateStep } from '@/lib/format-utils';
import type { Institution, Service, Estimation } from '@/lib/simulator-types';

// Icônes par type de service
const SERVICE_ICONS: Record<string, string> = {
  crédit: '💳',
  credit: '💳',
  épargne: '💰',
  epargne: '💰',
  assurance: '🛡️',
  paiement: '💸',
  transfert: '🔄',
  default: '💼',
};

// Fonctions utilitaires pour convertir les données en options de dropdown
const createInstitutionOptions = (institutions: Institution[]): DropdownOption<Institution>[] => {
  return institutions.map(institution => ({
    id: institution.id,
    name: institution.name,
    value: institution,
    // Si logoUrl existe et est une URL, l'utiliser, sinon afficher emoji par défaut
    icon: institution.logoUrl || '🏦',
    description: `${institution.services?.length || 0} services disponibles`,
  }));
};

const createServiceOptions = (services: Service[]): DropdownOption<Service>[] => {
  return services.map(service => {
    const typeKey = service.type.toLowerCase();
    const matchingKey = Object.keys(SERVICE_ICONS).find(key => typeKey.includes(key));
    const emojiIcon = matchingKey ? SERVICE_ICONS[matchingKey] : SERVICE_ICONS.default;

    return {
      id: service.id,
      name: service.name,
      value: service,
      // Passer l'emoji comme ReactNode
      icon: <span className='text-2xl'>{emojiIcon}</span>,
      description: service.longName,
    };
  });
};

export function ServiceSimulator() {
  const {
    params,
    estimation,
    isAnimating,
    institutions,
    isLoading,
    updateParam,
    getAvailableServices,
    resetSimulation,
  } = useSimulator();

  // Réinitialiser le plafond sélectionné quand le service change
  React.useEffect(() => {
    if (params.service?.id) {
      updateParam('selectedPlafondIndex', 0);
    }
  }, [params.service?.id, updateParam]);

  const institutionOptions = useMemo(() => createInstitutionOptions(institutions), [institutions]);
  const availableServices = getAvailableServices();
  const serviceOptions = useMemo(
    () => createServiceOptions(availableServices),
    [availableServices]
  );

  // Parser les plafonds pour obtenir les limites
  const parsePlafond = (plafond: string): { min: number; max: number } | null => {
    if (!plafond || plafond.trim() === '') return null;
    if (plafond.includes('-')) {
      const [min, max] = plafond.split('-').map(v => Number.parseFloat(v.trim()));
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        return { min, max };
      }
    }
    const value = Number.parseFloat(plafond.trim());
    if (!Number.isNaN(value)) {
      return { min: 0, max: value };
    }
    return null;
  };

  const getLimits = () => {
    if (!params.service?.plafonds?.length) {
      return {
        amount: { min: 1000, max: 1000000 },
      };
    }

    // Utiliser le plafond sélectionné (ou le premier par défaut)
    const plafondToUse =
      params.service.plafonds[params.selectedPlafondIndex] || params.service.plafonds[0];
    const amountPlafond = parsePlafond(plafondToUse);

    return {
      amount: amountPlafond || { min: 1000, max: 1000000 },
    };
  };

  const currentLimits = getLimits();
  const hasMultiplePlafonds =
    params.service?.plafonds?.length && params.service.plafonds.length > 1;

  // Helper function pour formater le montant principal
  const formatMainAmount = (estimation: Estimation): string => {
    if (estimation.monthlyPayment) {
      return formatCurrency(estimation.monthlyPayment);
    }
    if (estimation.finalAmount) {
      return formatCurrency(estimation.finalAmount);
    }
    if (estimation.netAmount) {
      return formatCurrency(estimation.netAmount);
    }
    if (estimation.annualPremium) {
      return formatCurrency(estimation.annualPremium);
    }
    return '0 F CFA';
  };

  // Helper function pour obtenir le titre du montant principal
  const getMainAmountTitle = (estimation: Estimation): string => {
    if (estimation.monthlyPayment) {
      return 'Mensualité estimée';
    }
    if (estimation.finalAmount) {
      return 'Montant final estimé';
    }
    if (estimation.netAmount) {
      return 'Montant net après frais';
    }
    if (estimation.annualPremium) {
      return 'Prime annuelle';
    }
    return 'Montant estimé';
  };

  return (
    <section className='py-20 bg-white relative overflow-visible'>
      {/* Background Effects */}
      <div className='absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-50 opacity-30' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-2 bg-teal-100 rounded-full px-6 py-3 mb-6'>
            <Sparkles className='w-5 h-5 text-teal-600' />
            <span className='text-teal-800 font-medium'>Simulateur de Produits Financiers</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            Simulez votre projet financier
            <br />
            <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent'>
              en temps réel
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Choisissez votre institution, sélectionnez un service et obtenez une estimation
            personnalisée instantanément
          </p>
        </div>

        {/* Loading state */}
        {isLoading && institutions.length === 0 && (
          <div className='max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4' />
            <p className='text-gray-600'>Chargement des institutions...</p>
          </div>
        )}

        {/* Interface minimaliste avec dropdowns */}
        {!isLoading && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-white border border-gray-200 rounded-2xl p-8 space-y-8 relative overflow-visible shadow-xl'>
              {/* Bouton Reset */}
              {(params.institution || params.service) && (
                <button
                  onClick={resetSimulation}
                  className='absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium'
                  title='Réinitialiser la simulation'
                >
                  <RotateCcw className='w-4 h-4' />
                  <span className='hidden sm:inline'>Réinitialiser</span>
                </button>
              )}

              {/* Étape 1: Sélection Institution */}
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                    1
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Choisissez votre institution
                  </h3>
                </div>
                <CustomDropdown
                  options={institutionOptions}
                  selected={
                    params.institution
                      ? institutionOptions.find(opt => opt.id === params.institution?.id) || {
                          id: params.institution.id,
                          name: params.institution.name,
                          value: params.institution,
                          icon: params.institution.logoUrl || '🏦',
                          description: `${params.institution.services?.length || 0} services disponibles`,
                        }
                      : null
                  }
                  onSelect={option => {
                    updateParam('institution', option.value);
                    updateParam('service', null);
                  }}
                  placeholder='Sélectionnez une institution...'
                  icon={<Building2 className='w-5 h-5' />}
                  searchable={true}
                />
              </div>

              {/* Étape 2: Sélection Service */}
              {params.institution && (
                <div className='space-y-4 animate-in slide-in-from-bottom-4 duration-500'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                      2
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900'>Sélectionnez un service</h3>
                  </div>
                  <CustomDropdown
                    options={serviceOptions}
                    selected={
                      params.service
                        ? serviceOptions.find(opt => opt.id === params.service?.id) || {
                            id: params.service.id,
                            name: params.service.name,
                            value: params.service,
                            icon: <span className='text-2xl'>💼</span>,
                            description: params.service.longName,
                          }
                        : null
                    }
                    onSelect={option => updateParam('service', option.value)}
                    placeholder='Choisissez un service...'
                    icon={<TrendingUp className='w-5 h-5' />}
                    searchable={false}
                  />

                  {/* Sélecteur de plafond (si plusieurs plafonds disponibles) */}
                  {hasMultiplePlafonds && params.service && (
                    <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                      <fieldset>
                        <legend className='block text-sm font-medium text-amber-900 mb-2'>
                          Sélectionnez le plafond à simuler :
                        </legend>
                        <div className='flex flex-wrap gap-2'>
                          {params.service.plafonds.map((plafond, index) => (
                            <button
                              key={`plafond-${params.service?.id}-${plafond}`}
                              onClick={() => updateParam('selectedPlafondIndex', index)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                params.selectedPlafondIndex === index
                                  ? 'bg-teal-500 text-white shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-400'
                              }`}
                            >
                              Plafond {index + 1}: {plafond}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  )}
                </div>
              )}

              {/* Étape 3: Paramètres */}
              {params.service && (
                <div className='space-y-6 animate-in slide-in-from-bottom-4 duration-500'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                      3
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900'>Ajustez vos paramètres</h3>
                  </div>

                  <div className='space-y-8'>
                    {/* Montant */}
                    <Slider
                      value={params.amount || currentLimits.amount.min}
                      onChange={value => {
                        const validatedValue = validateValue(
                          value,
                          currentLimits.amount.min,
                          currentLimits.amount.max
                        );
                        updateParam('amount', validatedValue);
                      }}
                      min={currentLimits.amount.min}
                      max={currentLimits.amount.max}
                      step={calculateStep(currentLimits.amount.min)}
                      label='Montant'
                      icon={<Hash className='w-4 h-4' />}
                      formatValue={formatCurrency}
                      enableInput={true}
                      inputSuffix='F CFA'
                    />
                  </div>
                </div>
              )}

              {/* Résultats */}
              {estimation && params.service && (
                <div className='space-y-6 animate-in slide-in-from-bottom-4 duration-500'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                      4
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900'>Votre estimation</h3>
                  </div>

                  <div className='bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-6 text-center'>
                    <div
                      className={`text-4xl font-bold text-white mb-2 transition-all duration-500 ${
                        isAnimating ? 'scale-105' : 'scale-100'
                      }`}
                    >
                      {formatMainAmount(estimation)}
                    </div>
                    <div className='text-white/90 mb-4'>{getMainAmountTitle(estimation)}</div>

                    {/* Affichage des frais et montant brut sur la même ligne */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                      {/* Frais appliqués */}
                      <div className='bg-white/20 rounded-lg p-3'>
                        <div className='text-white/80 text-sm'>Frais appliqués</div>
                        <div className='text-white font-semibold'>
                          {estimation.totalFees ? formatCurrency(estimation.totalFees) : 'Gratuit'}
                        </div>
                        <div className='text-white/70 text-xs mt-1'>
                          {estimation.feeDescription}
                        </div>
                      </div>

                      {/* Montant brut (pour les paiements/transferts) */}
                      {estimation.netAmount && (
                        <div className='bg-white/20 rounded-lg p-3'>
                          <div className='text-white/80 text-sm'>Montant brut</div>
                          <div className='text-white font-semibold'>
                            {formatCurrency(params.amount)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Autres informations selon le type de service */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                      {/* Taux annuel (si applicable) */}
                      {estimation.annualRate && (
                        <div className='bg-white/20 rounded-lg p-3'>
                          <div className='text-white/80'>Taux annuel</div>
                          <div className='text-white font-semibold'>
                            {estimation.annualRate.toFixed(2)}%
                          </div>
                        </div>
                      )}

                      {/* Gain/Intérêts totaux (si applicable) */}
                      {(estimation.totalGain || estimation.totalInterest) && (
                        <div className='bg-white/20 rounded-lg p-3'>
                          <div className='text-white/80'>
                            {estimation.totalGain ? 'Gain estimé' : 'Intérêts totaux'}
                          </div>
                          <div className='text-white font-semibold'>
                            {formatCurrency(estimation.totalGain || estimation.totalInterest || 0)}
                          </div>
                        </div>
                      )}

                      {/* Coût total (pour les crédits) */}
                      {estimation.totalCost && (
                        <div className='bg-white/20 rounded-lg p-3'>
                          <div className='text-white/80'>Coût total</div>
                          <div className='text-white font-semibold'>
                            {formatCurrency(estimation.totalCost)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
