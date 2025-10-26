'use client';

import { BadgePercent, Info, MapPin, Network, Shield, X, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Service } from '@/types/Service';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service?: Service | null;
};

const ServiceDetailsModal: React.FC<Readonly<Props>> = ({ open, onOpenChange, service }) => {
  if (!service) return null;
  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat('fr-FR').format(n);
    } catch {
      return String(n);
    }
  };

  const amountRange = (s: Service) => {
    const { minimum, maximum } = s.frais || {};
    if (minimum && maximum) return `${fmt(minimum)} – ${fmt(maximum)} FCFA`;
    if (minimum) return `≥ ${fmt(minimum)} FCFA`;
    if (maximum) return `≤ ${fmt(maximum)} FCFA`;
    return '—';
  };

  const fraisText = (s: Service) => {
    const f = s.frais || {};
    const parts: string[] = [];
    if (f.montantFixe) parts.push(`${fmt(f.montantFixe)} FCFA fixe`);
    if (f.pourcentage) parts.push(`${f.pourcentage}%`);
    if (f.minimum) parts.push(`min: ${fmt(f.minimum)} FCFA`);
    if (f.maximum) parts.push(`max: ${fmt(f.maximum)} FCFA`);
    return parts.length ? parts.join(' · ') : 'Aucun frais';
  };

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span className='inline-flex items-center rounded-full bg-[#F8F9FA] px-3 py-1 text-xs font-medium text-gray-700'>
      {children}
    </span>
  );

  const ChipList = ({
    items,
    variant = 'outline',
    icon: Icon,
  }: {
    items?: string[];
    variant?: 'outline' | 'secondary';
    icon: typeof Shield | typeof MapPin | typeof Network;
  }) =>
    items && items.length ? (
      <div className='flex flex-wrap gap-1.5'>
        {items.map(txt => (
          <Badge
            key={txt}
            variant={variant}
            className={variant === 'secondary' ? 'text-xs bg-indigo-50 text-indigo-700' : 'text-xs'}
          >
            <Icon className='h-3.5 w-3.5 mr-1' />
            {txt}
          </Badge>
        ))}
      </div>
    ) : (
      <p className='text-sm text-gray-500'>—</p>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl rounded-2xl p-0 overflow-hidden'>
        {/* Header */}
        <div className='relative bg-gradient-to-r from-[#00BBA7]/10 to-teal-50'>
          <DialogHeader className='px-6 py-5'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <DialogTitle className='text-xl font-semibold text-gray-900'>
                  {service.name}
                </DialogTitle>
                {service.longName && (
                  <DialogDescription className='text-sm text-gray-600'>
                    {service.longName}
                  </DialogDescription>
                )}
                <div className='mt-3 flex flex-wrap items-center gap-2'>
                  <Pill>
                    <Wallet className='mr-1.5 h-3.5 w-3.5' />
                    {service.type}
                  </Pill>
                  <Pill>
                    <BadgePercent className='mr-1.5 h-3.5 w-3.5' />
                    {fraisText(service)}
                  </Pill>
                </div>
              </div>

              <DialogClose asChild>
                <button
                  aria-label='Fermer'
                  className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:text-gray-700'
                >
                  <X className='h-4 w-4' />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
          <Separator className='border-gray-100' />
        </div>

        <div className='px-6 py-6 space-y-6'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='rounded-xl border border-gray-200 bg-[#F8F9FA] p-4'>
              <p className='text-xs text-gray-500'>Type</p>
              <p className='mt-1 text-sm  text-gray-900'>{service.type}</p>
            </div>
            <div className='rounded-xl border border-gray-200 bg-[#F8F9FA] p-4'>
              <p className='text-xs text-gray-500'>Montants</p>
              <p className='mt-1 text-sm font-semibold text-gray-900'>{amountRange(service)}</p>
            </div>
            <div className='rounded-xl border border-gray-200 bg-[#F8F9FA] p-4'>
              <p className='text-xs text-gray-500'>Frais</p>
              <p className='mt-1 text-sm text-gray-900'>{fraisText(service)}</p>
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <Info className='h-4 w-4' />
                  <span className='text-sm font-medium'>Frais détaillés</span>
                </div>
                <p className='text-sm text-gray-900'>{fraisText(service)}</p>
              </div>

              <div className='space-y-1.5'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <BadgePercent className='h-4 w-4' />
                  <span className='text-sm font-medium'>Tranche de montants</span>
                </div>
                <p className='text-sm text-gray-900'>{amountRange(service)}</p>
              </div>
            </div>

            <div className='space-y-5'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Conditions d’accès</p>
                <ChipList items={service.conditionAccess} variant='outline' icon={Shield} />
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Plafonds</p>
                <ChipList items={service.plafonds} variant='secondary' icon={MapPin} />
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Infrastructure d’accès</p>
                <ChipList items={service.infrastructureAccess} variant='secondary' icon={Network} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsModal;
