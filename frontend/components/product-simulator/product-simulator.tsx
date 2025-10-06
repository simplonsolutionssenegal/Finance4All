'use client';

import { Building2, TrendingUp, Clock, Sparkles, Plus, Minus, RotateCcw, Hash } from 'lucide-react';
import React, { useState, useRef, useCallback, useMemo } from 'react';

import { CustomDropdown } from '@/components/custom-dropdown';
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

// Composant Slider moderne et stylé
interface ModernSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  icon: React.ReactNode;
  formatValue: (value: number) => string;
  className?: string;
}

function ModernSlider({
  value,
  onChange,
  min,
  max,
  step,
  label,
  icon,
  formatValue,
  className = '',
}: ModernSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const updateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = min + (percentage / 100) * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      onChange(clampedValue);
    },
    [min, max, step, onChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateValue(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updateValue(e.touches[0].clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Gestion des événements de souris et tactile
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
        <div className='flex items-center gap-2 text-gray-700 text-sm sm:text-base font-medium'>
          {icon}
          {label}
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
          <button
            onClick={decrement}
            disabled={value <= min}
            className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95'
          >
            <Minus className='w-4 h-4 sm:w-5 sm:h-5 text-gray-700' />
          </button>
          <div className='min-w-[80px] sm:min-w-[100px] text-center sm:text-right'>
            <div className='text-gray-900 font-bold text-lg sm:text-xl'>{formatValue(value)}</div>
          </div>
          <button
            onClick={increment}
            disabled={value >= max}
            className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95'
          >
            <Plus className='w-4 h-4 sm:w-5 sm:h-5 text-gray-700' />
          </button>
        </div>
      </div>

      <div className='relative'>
        <div
          ref={sliderRef}
          className='relative h-2 sm:h-3 bg-gray-200 rounded-full cursor-pointer touch-none'
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div
            className='absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-200'
            style={{ width: `${percentage}%` }}
          />
          <div
            className='absolute top-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-teal-500 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 active:scale-95'
            style={{ left: `${percentage}%` }}
          />
        </div>

        <div className='flex justify-between text-xs sm:text-sm text-gray-500 mt-2'>
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}

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
                <span className='hidden sm:inline'>Reset</span>
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
                  <ModernSlider
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
                  <ModernSlider
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

                <div className='text-xs text-gray-400 text-center'>
                  * Estimation basée sur des taux indicatifs. Les conditions réelles peuvent varier.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
