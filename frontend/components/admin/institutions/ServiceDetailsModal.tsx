'use client';

import {
  type LucideIcon,
  BadgePercent,
  Info,
  MapPin,
  Network,
  Shield,
  Wallet,
  TrendingUp,
} from 'lucide-react';

import Chip from '@/components/admin/institutions/Chip';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Service } from '@/types/Service';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service?: Service | null;
};

type ChipListProps = {
  items?: string[];
  variant?: 'outline' | 'secondary';
  icon: LucideIcon;
};

const ChipList = ({ items, variant = 'outline', icon: Icon }: ChipListProps) =>
  items?.length ? (
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

type FeeKind = 'GRATUIT' | 'FIXE' | 'POURCENTAGE';

const getFeeKind = (s: Service): FeeKind => {
  const f = s.frais || {};
  const hasPct = (f.pourcentage ?? 0) > 0;
  const hasFix = (f.montantFixe ?? 0) > 0 || (f.fraisChange ?? 0) > 0;
  if (hasPct) return 'POURCENTAGE';
  if (hasFix) return 'FIXE';
  return 'GRATUIT';
};

const feeKindLabel: Record<FeeKind, string> = {
  GRATUIT: 'Gratuit',
  FIXE: 'Frais fixe',
  POURCENTAGE: 'Pourcentage',
};

const feeKindBadgeClass: Record<FeeKind, string> = {
  GRATUIT: 'bg-green-50 text-green-700 border border-green-200',
  FIXE: 'bg-amber-50 text-amber-700 border border-amber-200',
  POURCENTAGE: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
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
    const { montantMin, montantMax } = s;
    if (montantMin != null && montantMax != null && montantMin > 0 && montantMax > 0) {
      return `${fmt(montantMin)} – ${fmt(montantMax)} FCFA`;
    }
    if (montantMin != null && montantMin > 0) return `≥ ${fmt(montantMin)} FCFA`;
    if (montantMax != null && montantMax > 0) return `≤ ${fmt(montantMax)} FCFA`;
    return 'Non spécifié';
  };

  const fraisText = (s: Service) => {
    const f = s.frais || {};
    const parts: string[] = [];
    if (f.montantFixe) parts.push(`${fmt(f.montantFixe)} FCFA fixe`);
    if (f.pourcentage) parts.push(`${f.pourcentage}%`);
    if (f.minimum) parts.push(`min: ${fmt(f.minimum)} FCFA`);
    if (f.maximum) parts.push(`max: ${fmt(f.maximum)} FCFA`);
    if (f.fraisChange) parts.push(`change: ${fmt(f.fraisChange)} ${f.devise || ''}`);
    return parts.length ? parts.join(' · ') : 'Aucun frais';
  };

  const feeKind = getFeeKind(service);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl rounded-2xl p-0 overflow-hidden'>
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
                  <Chip className='bg-[#F8F9FA] text-gray-700' variant='default'>
                    <Wallet className='mr-1.5 h-3.5 w-3.5' />
                    {service.type}
                  </Chip>

                  <Chip className='bg-[#F8F9FA] text-gray-700' variant='default'>
                    <BadgePercent className='mr-1.5 h-3.5 w-3.5' />
                    {feeKindLabel[feeKind]}
                  </Chip>
                </div>
              </div>
            </div>
          </DialogHeader>
          <Separator className='border-gray-100' />
        </div>

        <div className='px-6 py-6 space-y-6'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='rounded-xl border border-gray-200 bg-[#F8F9FA] p-4'>
              <p className='text-xs text-gray-500'>Type de frais</p>
              <div className='mt-1'>
                <Badge className={`${feeKindBadgeClass[feeKind]} rounded-xl`}>
                  {feeKindLabel[feeKind]}
                </Badge>
              </div>
            </div>

            <div className='rounded-xl border border-gray-200 bg-[#F8F9FA] p-4'>
              <p className='text-xs text-gray-500'>Montants autorisés</p>
              <p className='mt-1 text-xs font-semibold text-gray-900'>{amountRange(service)}</p>
            </div>

            <div className='rounded-xl border border-gray-200 bg-[#F8F9FA] p-4'>
              <p className='text-xs text-gray-500'>Frais appliqués</p>
              <p className='mt-1 text-xs text-gray-900'>{fraisText(service)}</p>
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <TrendingUp className='h-4 w-4' />
                  <span className='text-sm font-medium'>Limites de montant</span>
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Minimum :</span>
                    <span className='font-medium text-gray-900'>
                      {service.montantMin != null && service.montantMin > 0
                        ? `${fmt(service.montantMin)} FCFA`
                        : 'Non défini'}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Maximum :</span>
                    <span className='font-medium text-gray-900'>
                      {service.montantMax != null && service.montantMax > 0
                        ? `${fmt(service.montantMax)} FCFA`
                        : 'Non défini'}
                    </span>
                  </div>
                </div>
              </div>

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
                <p className='text-sm font-medium text-gray-700'>Conditions d&apos;accès</p>
                <ChipList items={service.conditionAccess} variant='outline' icon={Shield} />
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Plafonds</p>
                <ChipList items={service.plafonds} variant='secondary' icon={MapPin} />
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Infrastructure d&apos;accès</p>
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
