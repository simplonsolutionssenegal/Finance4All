'use client';

import { Separator } from '@radix-ui/react-dropdown-menu';
import {
  ArrowRight,
  DollarSign,
  Funnel,
  TrendingDown,
  Zap,
  ArrowLeft,
  ChartColumn,
} from 'lucide-react';
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
import { formatCurrency } from '@/lib/format-utils';
import { type ServiceDTO, TypeService } from '@/types/Service';

import { computeFee } from '../ui/FeeCalculator';

import { ServiceList } from './ServiceList';

type ProductType = 'TRANSFERT' | 'CREDIT' | 'EPARGNE';

export default function ComparatorIntelligent() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productType, setProductType] = useState<ProductType>('TRANSFERT');
  const [isComparing, setIsComparing] = useState(false);

  const {
    services: allServices,
    isLoading,
    isError,
    error,
  } = useGetServices({
    page: 1,
    limit: 50,
    type: selectedType || undefined,
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

  const filteredServices = useMemo(() => allServices, [allServices]);

  function toggleSelected(id: string) {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setIsComparing(false);
  }

  const isCompareDisabled = selectedIds.length < 2;

  const compareButtonClasses = [
    'inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs shadow-sm transition',
    isCompareDisabled
      ? 'bg-primary-200 text-white/70 cursor-not-allowed'
      : 'bg-primary-200 text-white hover:bg-primary-500',
  ].join(' ');

  const criteriaRows = [
    {
      key: 'fees',
      label: 'Frais de service',
      icon: <DollarSign className='h-3 w-3 text-primary-400' />,
      render: (s: ServiceDTO) => {
        const fee = computeFee(s, amount);
        const hasFees = fee.label !== 'Non défini';

        return (
          <div className='flex flex-col items-center text-center'>
            {hasFees && amount > 0 && (
              <span className='text-sm text-slate-900'>
                {formatCurrency(Math.round(fee.value))}
              </span>
            )}

            {!hasFees && <span className='text-sm text-slate-900'>—</span>}

            {hasFees && <span className='mt-0.5 text-[11px] text-emerald-600'>{fee.label}</span>}
          </div>
        );
      },
    },
    {
      key: 'delay',
      label: 'Délai',
      icon: <Zap className='h-3 w-3 text-primary-400' />,
      render: (_s: ServiceDTO) => <span className='text-sm text-slate-800'>Instantané</span>,
    },
    {
      key: 'limit',
      label: 'Limite de solde',
      icon: <span className='text-base'>💳</span>,
      render: (s: ServiceDTO) => {
        const max = s.montantMax;

        return (
          <span className='text-sm text-slate-800'>
            {typeof max === 'number' ? `${formatCurrency(max)}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'cashback',
      label: 'Cashback',
      icon: <TrendingDown className='h-3 w-3 text-primary-400' />,
      render: (_s: ServiceDTO) => <span className='text-sm text-slate-800'>—</span>,
    },
    {
      key: 'rating',
      label: 'Note',
      icon: <span className='text-base'>⭐</span>,
      render: (_s: ServiceDTO) => (
        <span className='flex items-center justify-center gap-1 text-sm text-slate-800'>
          4.7 / 5
        </span>
      ),
    },
  ];

  return (
    <div className='min-h-screen bg-slate-50 py-10'>
      <main className='mx-auto flex max-w-6xl flex-col gap-6 px-4'>
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
                }}
              >
                <SelectTrigger
                  id='serviceType'
                  size='default'
                  className='h-11 data-[size=default]:h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 text-sm text-slate-700 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-slate-200'
                >
                  <SelectValue placeholder='Tous les types' />
                </SelectTrigger>

                <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200 rounded-xl'>
                  <SelectItem value='ALL'>Tous les types</SelectItem>

                  {serviceTypes.map(type => (
                    <SelectItem
                      key={type}
                      value={type}
                      className='group relative pl-3 pr-8 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200 text-gray-900'
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500' htmlFor='country'>
                Pays
              </label>
              <Select>
                <SelectTrigger
                  id='country'
                  size='default'
                  className='h-11 data-[size=default]:h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 text-sm text-slate-400 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-slate-200'
                >
                  <SelectValue placeholder='Tous les pays' />
                </SelectTrigger>
              </Select>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500'>Montant du transfert (F CFA)</label>
              <input
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
              onClick={() => setIsComparing(true)}
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

        {!isComparing && (
          <section className='space-y-4'>
            <h2 className='text-lg  text-slate-900'>Sélectionnez les services à comparer</h2>

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

        {isComparing && (
          <>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl  text-slate-900'>Comparaison détaillée</h2>
                {compareMessage && <p className='mt-1 text-xs text-slate-500'>{compareMessage}</p>}
              </div>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setIsComparing(false)}
                  className='inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 hover:bg-slate-50'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>Modifier</span>
                </button>
                <button
                  type='button'
                  className='inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600'
                >
                  <ChartColumn className='h-4 w-4' />
                  Vue graphique
                </button>
              </div>
            </div>
            <section className='space-y-4 rounded-3xl bg-white p-2 shadow-sm'>
              {isCompareLoading && (
                <p className='text-sm text-slate-500'>Chargement de la comparaison...</p>
              )}

              {isCompareError && (
                <p className='text-sm text-red-500'>
                  {compareError?.message ?? 'Impossible de charger la comparaison.'}
                </p>
              )}

              {!isCompareLoading && !isCompareError && comparedServices.length >= 2 && (
                <div className='overflow-x-auto'>
                  <div className='min-w-[720px] '>
                    <div className='grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))]'>
                      <div className='rounded-tl-3xl px-4 py-4 font-bold '>Critères</div>

                      {comparedServices.map(s => (
                        <div
                          key={s.id}
                          className='flex flex-col items-center justify-center border-slate-100 bg-white px-2 py-2 text-center'
                        >
                          <div className='mb-1 flex h-6 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-50'>
                            {s.institution.logoUrl ? (
                              <Image
                                src={s.institution.logoUrl}
                                alt={s.institution.name}
                                width={40}
                                height={24}
                                className='h-6 w-10 object-contain'
                              />
                            ) : (
                              <span className='text-xs  text-slate-700'>
                                {s.institution.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <p className='text-[11px] font-bold '>{s.institution.name}</p>
                        </div>
                      ))}
                    </div>

                    {criteriaRows.map((row, rowIndex) => (
                      <div
                        key={row.key}
                        className={[
                          'grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] border-t border-slate-100',
                          rowIndex === criteriaRows.length - 1 ? 'rounded-b-3xl' : '',
                        ].join(' ')}
                      >
                        <div className='flex items-center gap-3  px-2 py-1 text-xs text-slate-700'>
                          <span className='flex h-7 w-7 items-center justify-center rounded-full bg-white'>
                            {row.icon}
                          </span>
                          <span>{row.label}</span>
                        </div>

                        {comparedServices.map(s => (
                          <div
                            key={`${row.key}-${s.id}`}
                            className='flex items-center justify-center bg-white px-2 py-4 text-sm text-slate-800'
                          >
                            {row.render(s)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
