'use client';

import { Building2, TrendingUp, Clock, Sparkles, RotateCcw, Hash } from 'lucide-react';
import React, { useMemo } from 'react';

import { CustomDropdown } from '@/components/custom-dropdown';
import { Slider } from '@/components/slider';
import { useSimulator } from '@/hooks/useSimulator';
import type { DropdownOption } from '@/lib/dropdown-types';
import { createEntityOptions } from '@/lib/dropdown-utils';
import type { Institution, InstitutionProduct } from '@/lib/simulator-types';
import {
  formatCurrency,
  formatDuration,
  validateValue,
  calculateStep,
} from '@/lib/simulator-utils';

// Fonctions utilitaires pour convertir les données en options de dropdown
const createInstitutionOptions = (institutions: Institution[]): DropdownOption<Institution>[] => {
  return createEntityOptions(institutions, 'logo').map(option => ({
    ...option,
    description: `${institutions.find(inst => inst.id === option.id)?.products.length || 0} produits disponibles`,
  }));
};

const createProductOptions = (
  products: InstitutionProduct[]
): DropdownOption<InstitutionProduct>[] => {
  return createEntityOptions(products, 'icon', 'description');
};

export function ProductSimulator() {
  const {
    params,
    estimation,
    isAnimating,
    institutions,
    updateParam,
    getAvailableProducts,
    getCurrentLimits,
    resetSimulation,
  } = useSimulator();

  const institutionOptions = useMemo(() => createInstitutionOptions(institutions), [institutions]);
  const availableProducts = getAvailableProducts();
  const productOptions = useMemo(
    () => createProductOptions(availableProducts),
    [availableProducts]
  );

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
            Choisissez votre institution, sélectionnez un produit et obtenez une estimation
            personnalisée instantanément
          </p>
        </div>

        {/* Interface minimaliste avec dropdowns */}
        <div className='max-w-4xl mx-auto'>
          <div className='bg-white border border-gray-200 rounded-2xl p-8 space-y-8 relative overflow-visible shadow-xl'>
            {/* Bouton Reset */}
            {(params.institution || params.product) && (
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
                    ? {
                        id: params.institution.id,
                        name: params.institution.name,
                        value: params.institution,
                        icon: params.institution.logo,
                        description: `${params.institution.products.length} produits disponibles`,
                      }
                    : null
                }
                onSelect={option => {
                  updateParam('institution', option.value);
                  updateParam('product', null);
                }}
                placeholder='Sélectionnez une institution...'
                icon={<Building2 className='w-5 h-5' />}
                searchable={true}
              />
            </div>

            {/* Étape 2: Sélection Produit */}
            {params.institution && (
              <div className='space-y-4 animate-in slide-in-from-bottom-4 duration-500'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                    2
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900'>Sélectionnez un produit</h3>
                </div>
                <CustomDropdown
                  options={productOptions}
                  selected={
                    params.product
                      ? {
                          id: params.product.id,
                          name: params.product.name,
                          value: params.product,
                          icon: params.product.icon,
                          description: params.product.description,
                        }
                      : null
                  }
                  onSelect={option => updateParam('product', option.value)}
                  placeholder='Choisissez un produit...'
                  icon={<TrendingUp className='w-5 h-5' />}
                  searchable={false}
                />
              </div>
            )}

            {/* Étape 3: Paramètres */}
            {params.product && (
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
                    value={params.amount || getCurrentLimits().amount.min}
                    onChange={value => {
                      const validatedValue = validateValue(
                        value,
                        getCurrentLimits().amount.min,
                        getCurrentLimits().amount.max
                      );
                      updateParam('amount', validatedValue);
                    }}
                    min={getCurrentLimits().amount.min}
                    max={getCurrentLimits().amount.max}
                    step={calculateStep(getCurrentLimits().amount.min)}
                    label='Montant'
                    icon={<Hash className='w-4 h-4' />}
                    formatValue={formatCurrency}
                  />

                  {/* Durée */}
                  <Slider
                    value={params.duration || getCurrentLimits().duration.min}
                    onChange={value => {
                      const validatedValue = validateValue(
                        value,
                        getCurrentLimits().duration.min,
                        getCurrentLimits().duration.max
                      );
                      updateParam('duration', validatedValue);
                    }}
                    min={getCurrentLimits().duration.min}
                    max={getCurrentLimits().duration.max}
                    step={1}
                    label='Durée'
                    icon={<Clock className='w-4 h-4' />}
                    formatValue={formatDuration}
                  />
                </div>
              </div>
            )}

            {/* Résultats */}
            {estimation && params.product && (
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
                    {params.product.type === 'CREDIT' &&
                      estimation.monthlyPayment &&
                      formatCurrency(estimation.monthlyPayment)}
                    {params.product.type === 'INVESTISSEMENT' &&
                      estimation.finalAmount &&
                      formatCurrency(estimation.finalAmount)}
                    {params.product.type === 'EPARGNE' &&
                      estimation.finalAmount &&
                      formatCurrency(estimation.finalAmount)}
                    {params.product.type === 'ASSURANCE' &&
                      estimation.monthlyPayment &&
                      formatCurrency(estimation.monthlyPayment)}
                  </div>
                  <div className='text-white/90 mb-4'>
                    {params.product.type === 'CREDIT' && 'Mensualité estimée'}
                    {params.product.type === 'INVESTISSEMENT' && 'Montant final estimé'}
                    {params.product.type === 'EPARGNE' && 'Montant final estimé'}
                    {params.product.type === 'ASSURANCE' && 'Prime mensuelle estimée'}
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                    <div className='bg-white/20 rounded-lg p-3'>
                      <div className='text-white/80'>Taux annuel</div>
                      <div className='text-white font-semibold'>
                        {estimation.annualRate.toFixed(2)}%
                      </div>
                    </div>
                    <div className='bg-white/20 rounded-lg p-3'>
                      <div className='text-white/80'>
                        {params.product.type === 'CREDIT' && 'Intérêts totaux'}
                        {params.product.type === 'INVESTISSEMENT' && 'Gain estimé'}
                        {params.product.type === 'EPARGNE' && 'Gain estimé'}
                        {params.product.type === 'ASSURANCE' && 'Prime totale'}
                      </div>
                      <div className='text-white font-semibold'>
                        {estimation.totalInterest
                          ? formatCurrency(estimation.totalInterest)
                          : '0 F CFA'}
                      </div>
                    </div>
                  </div>

                  <div className='mt-6 flex justify-center'>
                    <button
                      onClick={resetSimulation}
                      className='px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2'
                      title='Recommencer une nouvelle simulation'
                    >
                      <RotateCcw className='w-4 h-4' />
                      Nouvelle simulation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
