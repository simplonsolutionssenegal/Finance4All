import { DollarSign, TrendingDown, Zap } from 'lucide-react';
import Image from 'next/image';

import { computeFee } from '../../lib/FeeCalculator';

import { formatCurrency } from '@/lib/format-utils';
import { type ServiceDTO } from '@/types/Service';

interface ComparaisonTableViewProps {
  comparedServices: ServiceDTO[];
  amount: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

export function ComparatorTableView({
  comparedServices,
  amount,
  isLoading,
  isError,
  errorMessage,
}: ComparaisonTableViewProps) {
  const criteriaRows = [
    {
      key: 'fees',
      label: 'Frais de service',
      icon: <DollarSign className='h-3 w-3 text-primary-400' />,
      render: (s: ServiceDTO) => {
        const fee = computeFee(s, amount);
        const hasFees = fee.label !== 'Non défini';
        const shouldShowAmount = hasFees && (amount > 0 || fee.value > 0);
        return (
          <div className='flex flex-col items-center text-center'>
            {shouldShowAmount && (
              <span className='text-sm text-primary-300'>
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

  if (isLoading) {
    return (
      <section className='space-y-4 rounded-3xl bg-white p-2 shadow-sm'>
        <p className='text-sm text-slate-500'>Chargement de la comparaison...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className='space-y-4 rounded-3xl bg-white p-2 shadow-sm'>
        <p className='text-sm text-red-500'>
          {errorMessage ?? 'Impossible de charger la comparaison.'}
        </p>
      </section>
    );
  }

  if (comparedServices.length < 2) {
    return null;
  }

  return (
    <section className='space-y-4 rounded-3xl bg-white p-2 shadow-sm'>
      <div className='overflow-x-auto'>
        <div className='min-w-[720px]'>
          <div className='grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))]'>
            <div className='rounded-tl-3xl px-4 py-4 font-bold'>Critères</div>

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
                    <span className='text-xs text-slate-700'>{s.institution.name.charAt(0)}</span>
                  )}
                </div>
                <p className='text-[11px] font-bold'>{s.institution.name}</p>
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
              <div className='flex items-center gap-3 px-2 py-1 text-xs text-slate-700'>
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
    </section>
  );
}
