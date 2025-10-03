'use client';

import {
  Building2,
  TrendingUp,
  Euro,
  Clock,
  Sparkles,
  ChevronDown,
  Check,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import { Input } from '@/components/ui/input';

interface Institution {
  id: string;
  name: string;
  logo: string;
  color: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'loan' | 'investment' | 'savings';
  rates: {
    min: number;
    max: number;
  };
  limits: {
    amount: { min: number; max: number };
    duration: { min: number; max: number };
  };
}

interface SimulationParams {
  institution: Institution | null;
  service: Service | null;
  amount: number;
  duration: number;
}

interface Estimation {
  monthlyPayment?: number;
  totalInterest?: number;
  finalAmount?: number;
  annualRate: number;
  totalCost?: number;
}

const STORAGE_KEY = 'product-simulator-params';

// Génération dynamique d'institutions avec couleurs cohérentes
const generateInstitutions = (): Institution[] => {
  const institutionNames = [
    'BNP Paribas',
    'Société Générale',
    'Crédit Agricole',
    'LCL',
    'Banque Populaire',
    "Caisse d'Épargne",
    'Crédit Mutuel',
    'La Banque Postale',
    'HSBC France',
    'ING',
    'Crédit du Nord',
    'Banque Palatine',
    'Boursorama',
    'Hello Bank',
    'Fortuneo',
    'Monabanq',
    'Orange Bank',
    'N26',
    'Revolut',
    'Qonto',
    'Lydia',
    'PayPal',
    'Stripe',
    'Adyen',
    'Square',
    'Payoneer',
    'Wise',
    'Remitly',
    'Western Union',
    'MoneyGram',
  ];

  const serviceTypes = [
    {
      name: 'Prêt Immobilier',
      icon: '🏠',
      type: 'loan' as const,
      rates: { min: 2.5, max: 4.0 },
      limits: { amount: { min: 50000, max: 800000 }, duration: { min: 5, max: 25 } },
    },
    {
      name: 'Prêt Personnel',
      icon: '💳',
      type: 'loan' as const,
      rates: { min: 3.0, max: 5.5 },
      limits: { amount: { min: 1000, max: 75000 }, duration: { min: 1, max: 7 } },
    },
    {
      name: 'Prêt Auto',
      icon: '🚗',
      type: 'loan' as const,
      rates: { min: 2.8, max: 4.5 },
      limits: { amount: { min: 5000, max: 100000 }, duration: { min: 1, max: 7 } },
    },
    {
      name: 'Prêt Professionnel',
      icon: '🏢',
      type: 'loan' as const,
      rates: { min: 2.0, max: 4.0 },
      limits: { amount: { min: 10000, max: 1000000 }, duration: { min: 2, max: 20 } },
    },
    {
      name: 'Assurance Vie',
      icon: '💎',
      type: 'investment' as const,
      rates: { min: 3.5, max: 6.0 },
      limits: { amount: { min: 1000, max: 500000 }, duration: { min: 2, max: 15 } },
    },
    {
      name: 'PERP',
      icon: '🎯',
      type: 'investment' as const,
      rates: { min: 3.0, max: 5.5 },
      limits: { amount: { min: 500, max: 300000 }, duration: { min: 5, max: 25 } },
    },
    {
      name: 'Livret A',
      icon: '💰',
      type: 'savings' as const,
      rates: { min: 2.0, max: 3.0 },
      limits: { amount: { min: 100, max: 100000 }, duration: { min: 1, max: 10 } },
    },
    {
      name: 'Compte Épargne',
      icon: '🏦',
      type: 'savings' as const,
      rates: { min: 1.5, max: 2.8 },
      limits: { amount: { min: 100, max: 200000 }, duration: { min: 1, max: 8 } },
    },
  ];

  const colors = [
    'from-teal-500 to-teal-600',
    'from-blue-500 to-blue-600',
    'from-cyan-500 to-cyan-600',
    'from-teal-600 to-teal-700',
    'from-blue-600 to-blue-700',
    'from-cyan-600 to-cyan-700',
    'from-teal-400 to-teal-500',
    'from-blue-400 to-blue-500',
    'from-cyan-400 to-cyan-500',
  ];

  return institutionNames.map((name, index) => {
    const numServices = Math.floor(Math.random() * 4) + 2; // 2-5 services par institution
    const selectedServices = serviceTypes
      .sort(() => 0.5 - Math.random())
      .slice(0, numServices)
      .map(service => ({
        id: `${name.toLowerCase().replace(/\s+/g, '-')}-${service.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: service.name,
        description: `Service ${service.name.toLowerCase()} de ${name}`,
        icon: service.icon,
        type: service.type,
        rates: {
          min: service.rates.min + (Math.random() - 0.5) * 0.5,
          max: service.rates.max + (Math.random() - 0.5) * 0.5,
        },
        limits: service.limits,
      }));

    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      logo: ['🏦', '🏛️', '🏪', '🏢', '💳', '💰', '🎯', '💎', '🚀', '⭐'][index % 10],
      color: colors[index % colors.length],
      services: selectedServices,
    };
  });
};

const institutions: Institution[] = generateInstitutions();

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

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  useEffect(() => {
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

// Composant Dropdown personnalisé
interface DropdownProps {
  options: Institution[] | Service[];
  selected: Institution | Service | null;
  onSelect: (item: Institution | Service) => void;
  placeholder: string;
  icon: React.ReactNode;
  searchable?: boolean;
}

function CustomDropdown({
  options,
  selected,
  onSelect,
  placeholder,
  icon,
  searchable = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    return options.filter(option => option.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 hover:bg-gray-100 hover:border-teal-500 transition-all duration-300 shadow-lg'
      >
        <div className='flex items-center gap-3'>
          {icon}
          <span className={`font-medium ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[99999] max-h-80 overflow-hidden'>
          {searchable && (
            <div className='p-3 border-b border-gray-100'>
              <Input
                type='text'
                placeholder='Rechercher...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500'
              />
            </div>
          )}
          <div className='max-h-64 overflow-y-auto'>
            {filteredOptions.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className='w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-200 text-left'
              >
                <span className='text-lg'>
                  {(option as Institution).logo || (option as Service).icon}
                </span>
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>{option.name}</div>
                  {(option as Service).description && (
                    <div className='text-sm text-gray-600'>{(option as Service).description}</div>
                  )}
                </div>
                {selected?.id === option.id && <Check className='w-5 h-5 text-teal-600' />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductSimulator() {
  const [params, setParams] = useState<SimulationParams>({
    institution: null,
    service: null,
    amount: 0,
    duration: 0,
  });
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedParams = localStorage.getItem(STORAGE_KEY);
    if (savedParams) {
      try {
        const parsed = JSON.parse(savedParams);
        const institution = institutions.find(inst => inst.id === parsed.institutionId);
        const service = institution?.services.find(svc => svc.id === parsed.serviceId);
        setParams({
          institution: institution || null,
          service: service || null,
          amount: parsed.amount || 0,
          duration: parsed.duration || 0,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    if (params.institution && params.service) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          institutionId: params.institution.id,
          serviceId: params.service.id,
          amount: params.amount,
          duration: params.duration,
        })
      );
    }
  }, [params]);

  // Calculer l'estimation en temps réel
  useEffect(() => {
    if (params.service) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        const newEstimation = calculateEstimation(params);
        setEstimation(newEstimation);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const calculateEstimation = (params: SimulationParams): Estimation => {
    if (!params.service) return { annualRate: 0 };

    const { amount, duration, service } = params;
    const rate = (service.rates.min + service.rates.max) / 2;

    switch (service.type) {
      case 'loan': {
        const monthlyRate = rate / 100 / 12;
        const monthlyPayment =
          (amount * (monthlyRate * Math.pow(1 + monthlyRate, duration * 12))) /
          (Math.pow(1 + monthlyRate, duration * 12) - 1);
        const totalCost = monthlyPayment * duration * 12;
        const totalInterest = totalCost - amount;

        return {
          monthlyPayment: Math.round(monthlyPayment),
          totalInterest: Math.round(totalInterest),
          totalCost: Math.round(totalCost),
          annualRate: rate,
        };
      }
      case 'investment': {
        const finalAmount = amount * Math.pow(1 + rate / 100, duration);
        const totalGain = finalAmount - amount;

        return {
          finalAmount: Math.round(finalAmount),
          totalInterest: Math.round(totalGain),
          annualRate: rate,
        };
      }
      case 'savings': {
        const finalAmount = amount * Math.pow(1 + rate / 100, duration);
        const totalGain = finalAmount - amount;

        return {
          finalAmount: Math.round(finalAmount),
          totalInterest: Math.round(totalGain),
          annualRate: rate,
        };
      }
      default:
        return { annualRate: 0 };
    }
  };

  const updateParam = (
    key: keyof SimulationParams,
    value: Institution | Service | number | null
  ) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getAvailableServices = () => {
    return params.institution?.services || [];
  };

  const getCurrentLimits = () => {
    return (
      params.service?.limits || { amount: { min: 0, max: 100000 }, duration: { min: 1, max: 10 } }
    );
  };

  const resetSimulation = () => {
    setParams({
      institution: null,
      service: null,
      amount: 0,
      duration: 0,
    });
    setEstimation(null);
    // Nettoyer le localStorage
    localStorage.removeItem(STORAGE_KEY);
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

        {/* Interface minimaliste avec dropdowns */}
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
                options={institutions}
                selected={params.institution}
                onSelect={institution => {
                  updateParam('institution', institution as Institution);
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
                  options={getAvailableServices()}
                  selected={params.service}
                  onSelect={service => updateParam('service', service as Service)}
                  placeholder='Choisissez un service...'
                  icon={<TrendingUp className='w-5 h-5' />}
                  searchable={false}
                />
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
                  <ModernSlider
                    value={params.amount || getCurrentLimits().amount.min}
                    onChange={value => {
                      const validatedValue = Math.max(
                        getCurrentLimits().amount.min,
                        Math.min(getCurrentLimits().amount.max, value)
                      );
                      updateParam('amount', validatedValue);
                    }}
                    min={getCurrentLimits().amount.min}
                    max={getCurrentLimits().amount.max}
                    step={getCurrentLimits().amount.min < 10000 ? 100 : 1000}
                    label='Montant'
                    icon={<Euro className='w-4 h-4' />}
                    formatValue={formatCurrency}
                  />

                  {/* Durée */}
                  <ModernSlider
                    value={params.duration || getCurrentLimits().duration.min}
                    onChange={value => {
                      const validatedValue = Math.max(
                        getCurrentLimits().duration.min,
                        Math.min(getCurrentLimits().duration.max, value)
                      );
                      updateParam('duration', validatedValue);
                    }}
                    min={getCurrentLimits().duration.min}
                    max={getCurrentLimits().duration.max}
                    step={1}
                    label='Durée'
                    icon={<Clock className='w-4 h-4' />}
                    formatValue={value => `${value} an${value > 1 ? 's' : ''}`}
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
                    className={`text-4xl font-bold text-white mb-2 transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}
                  >
                    {params.service.type === 'loan' &&
                      estimation.monthlyPayment &&
                      formatCurrency(estimation.monthlyPayment)}
                    {params.service.type === 'investment' &&
                      estimation.finalAmount &&
                      formatCurrency(estimation.finalAmount)}
                    {params.service.type === 'savings' &&
                      estimation.finalAmount &&
                      formatCurrency(estimation.finalAmount)}
                  </div>
                  <div className='text-white/90 mb-4'>
                    {params.service.type === 'loan' && 'Mensualité estimée'}
                    {params.service.type === 'investment' && 'Montant final estimé'}
                    {params.service.type === 'savings' && 'Montant final estimé'}
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
                        {params.service.type === 'loan' && 'Intérêts totaux'}
                        {params.service.type === 'investment' && 'Gain estimé'}
                        {params.service.type === 'savings' && 'Gain estimé'}
                      </div>
                      <div className='text-white font-semibold'>
                        {estimation.totalInterest
                          ? formatCurrency(estimation.totalInterest)
                          : '0 €'}
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
