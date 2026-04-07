'use client';

import { Separator } from '@radix-ui/react-dropdown-menu';
import { ArrowRight, DollarSign, Funnel, TrendingDown, ArrowLeft, ChartColumn } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useCompareServices } from '@/hooks/service/useCompareServices';
import { useGetServices } from '@/hooks/service/useGetServices';
import { TypeService } from '@/types/Service';

import { computeFee } from '../../lib/FeeCalculator';

import { ComparatorChartsView } from './ComparatorChartsView';
import { ComparatorTableView } from './ComparatorTableView';
import { ServiceList } from './ServiceList';

type ProductType = 'TRANSFERT' | 'CREDIT' | 'EPARGNE';

enum Country {
  SENEGAL = 'SENEGAL',
  CAMEROUN = 'CAMEROUN',
}

const COUNTRY_LABELS: Record<Country, string> = {
  [Country.SENEGAL]: 'Sénégal',
  [Country.CAMEROUN]: 'Cameroun',
};

const COUNTRY_FLAGS: Record<Country, string> = {
  [Country.SENEGAL]: '/senegal.png',
  [Country.CAMEROUN]: '/cameroon.png',
};

interface ComparatorIntelligentProps {
  mode?: 'public' | 'dashboard';
}

export default function ComparatorIntelligent({ mode = 'public' }: ComparatorIntelligentProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>(''); // 👈 Nouveau state
  const [amount, setAmount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productType, setProductType] = useState<ProductType>('TRANSFERT');
  const [isComparing, setIsComparing] = useState(false);
  const [isGraphView, setIsGraphView] = useState(false);

  const {
    services: allServices,
    isLoading,
    isError,
    error,
  } = useGetServices({
    page: 1,
    limit: 50,
    type: selectedType || undefined,
    pays: selectedCountry || undefined,
  });

  const {
    services: comparedServices,
    message: compareMessage,
    isLoading: isCompareLoading,
    isError: isCompareError,
    error: compareError,
  } = useCompareServices(isComparing ? selectedIds : []);

  const serviceTypes = useMemo(() => {
    return Object.values(TypeService) as string[];
  }, []);

  const countries = useMemo(() => {
    return Object.values(Country) as string[];
  }, []);

  const filteredServices = useMemo(() => allServices, [allServices]);

  function toggleSelected(id: string) {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setIsComparing(false);
    setIsGraphView(false);
  }

  const isCompareDisabled = selectedIds.length < 2;

  const compareButtonClasses = [
    'inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs shadow-sm transition',
    isCompareDisabled
      ? 'bg-primary-200 text-white/70 cursor-not-allowed'
      : 'bg-primary-200 text-white hover:bg-primary-500',
  ].join(' ');

  return (
    <div className={`min-h-screen ${mode === 'public' ? 'bg-white py-10' : 'bg-transparent py-0'}`}>
      <main
        className={`mx-auto flex max-w-6xl flex-col gap-6 ${mode === 'public' ? 'px-4' : 'px-0'}`}
      >
        {/* Header */}
        {mode === 'public' && (
          <section className='rounded-3xl py-4'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs text-primary-400'>
              <Funnel className='h-4 w-4' />
              Outil d&apos;aide à la décision
            </div>

            <div>
              <h1 className='text-3xl text-slate-900'>Comparateur Intelligent</h1>

              <p className='mt-2 max-w-xl text-sm text-slate-500'>
                Comparez les produits financiers par critères clés : coût, rapidité,
                <br />
                couverture.
              </p>
            </div>
          </section>
        )}

        {/* Choix type de produit */}
        <section className='rounded-xl bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-sm text-slate-800'>Type de produit</h2>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <button
              type='button'
              onClick={() => setProductType('TRANSFERT')}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                productType === 'TRANSFERT'
                  ? 'border border-sky-300 bg-primary-50 text-slate-800'
                  : 'border border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className='flex items-center gap-3'>
                <ArrowRight className='h-4 w-4' />
                <span>Transferts &amp; Mobile Money</span>
              </span>
            </button>

            <button
              type='button'
              onClick={() => setProductType('CREDIT')}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                productType === 'CREDIT'
                  ? 'border border-sky-300 bg-primary-50 text-slate-800'
                  : 'border border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className='flex items-center gap-3'>
                <DollarSign className='h-3 w-4' />
                <span>Crédit &amp; Prêts</span>
              </span>
            </button>

            <button
              type='button'
              disabled
              className='flex flex-col items-start gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-left text-sm text-slate-400'
            >
              <span className='flex items-center gap-3'>
                <TrendingDown className='h-3 w-3' />
                <span>Épargne</span>
              </span>
              <span className='rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px]'>
                Bientôt disponible
              </span>
            </button>
          </div>
        </section>

        {/* Filtres + montant */}
        <section className='space-y-6 rounded-xl bg-white p-6 shadow-sm'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500' htmlFor='serviceType'>
                Type de service
              </label>
              <Select
                value={selectedType === '' ? 'ALL' : selectedType}
                onValueChange={value => {
                  if (value === 'ALL') {
                    setSelectedType('');
                  } else {
                    setSelectedType(value);
                  }
                  setIsComparing(false);
                  setIsGraphView(false);
                }}
              >
                <SelectTrigger
                  id='serviceType'
                  size='default'
                  className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 text-sm text-slate-700 outline-none focus-visible:border-slate-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent data-[size=default]:h-11'
                >
                  <SelectValue placeholder='Tous les types' />
                </SelectTrigger>

                <SelectContent className='max-h-64 rounded-xl border border-cyan-200 bg-cyan-50'>
                  <SelectItem value='ALL'>Tous les types</SelectItem>

                  {serviceTypes.map(type => (
                    <SelectItem
                      key={type}
                      value={type}
                      className='group relative pl-3 pr-8 text-gray-900 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200'
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 🌍 SELECT PAYS */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500' htmlFor='country'>
                Pays
              </label>
              <Select
                value={selectedCountry === '' ? 'ALL' : selectedCountry}
                onValueChange={value => {
                  if (value === 'ALL') {
                    setSelectedCountry('');
                  } else {
                    setSelectedCountry(value);
                  }
                  setIsComparing(false);
                  setIsGraphView(false);
                }}
              >
                <SelectTrigger
                  id='country'
                  size='default'
                  className='h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 text-sm text-slate-700 outline-none focus-visible:border-slate-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent data-[size=default]:h-11'
                >
                  <SelectValue className='flex items-center gap-2'>
                    {selectedCountry ? (
                      <span className='flex items-center gap-2'>
                        <Image
                          src={COUNTRY_FLAGS[selectedCountry as Country]}
                          alt={COUNTRY_LABELS[selectedCountry as Country]}
                          width={25}
                          height={20}
                          className='rounded-sm border border-slate-200 object-cover'
                        />
                        <span>{COUNTRY_LABELS[selectedCountry as Country]}</span>
                      </span>
                    ) : (
                      <span className='text-slate-500'>Tous les pays</span>
                    )}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className='max-h-64 rounded-xl border border-cyan-200 bg-cyan-50'>
                  <SelectItem value='ALL'>Tous les pays</SelectItem>

                  {countries.map(country => (
                    <SelectItem
                      key={country}
                      value={country}
                      className='group relative pl-3 pr-8 text-gray-900 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200'
                    >
                      <div className='flex items-center gap-2'>
                        <Image
                          src={COUNTRY_FLAGS[country as Country]}
                          alt={COUNTRY_LABELS[country as Country] || country}
                          width={25}
                          height={20}
                          className='rounded-sm border border-slate-200 object-cover'
                        />
                        <span>{COUNTRY_LABELS[country as Country] || country}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500' htmlFor='transfer-amount'>
                Montant du transfert (F CFA)
              </label>
              <input
                id='transfer-amount'
                type='number'
                value={amount}
                onChange={e => setAmount(Number(e.target.value) || 0)}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none'
                placeholder='50000'
                min={0}
              />
            </div>
          </div>

          <Separator className='my-1 h-[0.5px] bg-gray-200' />

          <div className='mt-4 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs text-slate-400'>
              <Funnel className='h-4 w-4' />
              <span>
                {filteredServices.length} services disponibles • {selectedIds.length} sélectionné(s)
              </span>
            </div>
            <button
              type='button'
              disabled={isCompareDisabled}
              onClick={() => {
                setIsComparing(true);
                setIsGraphView(false);
              }}
              className={compareButtonClasses}
            >
              <span>
                Comparer{' '}
                {selectedIds.length > 0 ? `${selectedIds.length} services` : 'les services'}
              </span>
              <ArrowRight className='h-4 w-4' />
            </button>
          </div>
        </section>

        {/* Liste des services à comparer */}
        {!isComparing && (
          <section className='space-y-4'>
            <h2 className='text-lg text-slate-900'>Sélectionnez les services à comparer</h2>

            <ServiceList
              services={filteredServices}
              selectedIds={selectedIds}
              amount={amount}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onToggleService={toggleSelected}
              computeFee={computeFee}
            />
          </section>
        )}

        {/* Vue comparaison (tableau ou graphique) */}
        {isComparing && (
          <>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl text-slate-900'>Comparaison détaillée</h2>
                {compareMessage && <p className='mt-1 text-xs text-slate-500'>{compareMessage}</p>}
              </div>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setIsComparing(false);
                    setIsGraphView(false);
                  }}
                  className='inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 hover:bg-slate-50'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>Modifier</span>
                </button>
                <button
                  type='button'
                  onClick={() => setIsGraphView(prev => !prev)}
                  className='inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600'
                >
                  <ChartColumn className='h-4 w-4' />
                  <span>{isGraphView ? 'Vue tableau' : 'Vue graphique'}</span>
                </button>
              </div>
            </div>

            {/* Vue TABLEAU */}
            {!isGraphView && (
              <ComparatorTableView
                comparedServices={comparedServices}
                amount={amount}
                isLoading={isCompareLoading}
                isError={isCompareError}
                errorMessage={compareError?.message}
              />
            )}

            {/* Vue GRAPHIQUE */}
            {isGraphView && (
              <ComparatorChartsView
                comparedServices={comparedServices}
                amount={amount}
                isLoading={isCompareLoading}
                isError={isCompareError}
                errorMessage={compareError?.message}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
