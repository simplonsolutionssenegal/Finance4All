import { Star, Zap } from 'lucide-react';
import Image from 'next/image';
import type { JSX } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import type { ServiceDTO } from '@/types/Service';

interface ServiceListProps {
  readonly services: ReadonlyArray<ServiceDTO>;
  readonly selectedIds: ReadonlyArray<string>;
  readonly amount: number;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error?: Error | null;
  readonly onToggleService: (id: string) => void;
  readonly computeFee: (service: ServiceDTO, amount: number) => { label: string; value: number };
}

function formatCurrency(amount: number): JSX.Element {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <>
      <span className='text-sm  text-bold'>{formatted}</span>
      <span className='text-[8px]  text-slate-500 ml-1'>F CFA</span>
    </>
  );
}

export function ServiceList(props: Readonly<ServiceListProps>) {
  const { services, selectedIds, amount, isLoading, isError, error, onToggleService, computeFee } =
    props;

  if (isLoading) {
    return <p className='text-sm text-slate-500'>Chargement des services...</p>;
  }

  if (isError) {
    return (
      <p className='text-sm text-red-500'>
        {error?.message ?? 'Impossible de charger les services.'}
      </p>
    );
  }

  if (services.length === 0) {
    return (
      <section className='space-y-6 rounded-xl bg-white p-6 shadow-sm'>
        <div className='flex flex-col items-center justify-center py-10 px-2'>
          <div className='mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-400'>
            <svg
              className='h-8 w-8 text-secondary-50'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
              />
            </svg>
          </div>
          <p className='mb-1 text-sm font-medium text-slate-900'>Aucun service disponible</p>
          <p className='max-w-xs text-center text-xs text-slate-500'>
            Aucun service n&apos;est disponible pour le moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {services.map(service => {
        const fee = computeFee(service, amount);
        const isSelected = selectedIds.includes(service.id);

        const cardClasses = `
          relative flex flex-col gap-3 rounded-xl border p-4 
          cursor-pointer transition-colors
          ${isSelected ? 'border-primary-200 bg-primary-50' : 'border-tertiary-200'}
        `;

        return (
          <article
            key={service.id}
            className={cardClasses}
            onClick={() => onToggleService(service.id)}
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggleService(service.id);
              }
            }}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-slate-100'>
                  <Image
                    src={service.institution.logoUrl}
                    alt={service.institution.name}
                    width={32}
                    height={32}
                    className='h-full w-full object-contain'
                  />
                </div>
                <div>
                  <p className='text-sm text-slate-900'>{service.name}</p>
                  <div className='mt-1 flex items-center gap-1 text-[11px] text-slate-500'>
                    <Star className='h-3 w-3 fill-current text-yellow-400' />
                    <span>4.6</span>
                    <span className='inline-flex items-center rounded-full border border-slate-200 px-2 text-[10px]'>
                      {service.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1 text-xs text-slate-500'>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleService(service.id)}
                  onClick={event => event.stopPropagation()}
                  className='size-4 border-slate-200 data-[state=checked]:bg-primary-200 data-[state=checked]:border-primary data-[state=checked]:text-white'
                />
              </div>
            </div>

            <div className='mt-2 flex items-baseline justify-between'>
              <div className='pl-3 text-xs text-slate-500'>
                Frais de service
                <div className='text-[11px] text-primary-400'>{fee.label}</div>
              </div>
              <div className='text-right'>
                <div className='text-right flex items-baseline'>
                  {formatCurrency(Math.round(fee.value))}
                </div>
              </div>
            </div>

            <div className='mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500'>
              <span className='inline-flex items-center gap-1 rounded-full'>
                <Zap className='h-3 w-3 text-primary-200' />
                <span>Instantané</span>
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
