'use client';

import { Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import React from 'react';

import type { Beneficiary } from '@/types/beneficiaire/beneficiary';
// eslint-disable-next-line no-duplicate-imports
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';

function StatusPill({ status }: { status: BeneficiaryStatus | 'PENDING' }) {
  if (status === 'PENDING') {
    return (
      <span className='inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700'>
        En attente
      </span>
    );
  }
  const isActive = status === BeneficiaryStatus.ACTIVE;
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-amber-200 bg-amber-50 text-amber-700',
      ].join(' ')}
    >
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  );
}

function MiniProgress({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className='flex items-center gap-2'>
      <div className='h-1.5 w-20 overflow-hidden rounded-full bg-tertiary-200'>
        <div className='h-full rounded-full bg-sky-500' style={{ width: `${v}%` }} />
      </div>
      <span className='text-[11px] tabular-nums text-tertiary-500'>{v}%</span>
    </div>
  );
}

function initialsOf(beneficiaire: Beneficiary) {
  const a = (beneficiaire.firstName?.[0] ?? '').toUpperCase();
  const c = (beneficiaire.lastName?.[0] ?? '').toUpperCase();
  return `${a}${c}` || 'B';
}

function formatDateFR(iso: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  rows: Beneficiary[];
  isLoading?: boolean;
  uuidToInt: (uuid: string) => number;
  onView?: (beneficiaire: Beneficiary) => void;
  onEdit?: (beneficiaire: Beneficiary) => void;
  onDelete?: (beneficiaire: Beneficiary) => void;
};

export default function BeneficiaryTable({
  rows,
  isLoading = false,
  uuidToInt,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className='overflow-x-auto overflow-y-hidden'>
      <div className='min-w-[900px] rounded-2xl border border-slate-100 bg-white'>
        <table className='w-full border-collapse border-slate-100'>
          <thead>
            <tr className='bg-slate-50 text-left'>
              <th className='px-5 py-3 text-[12px] font-medium text-tertiary-500'>Bénéficiaire</th>
              <th className='px-5 py-3 text-[12px] font-medium text-tertiary-500'>Contact</th>
              <th className='px-5 py-3 text-[12px] font-medium text-tertiary-500'>Statut</th>
              <th className='px-5 py-3 text-[12px] font-medium text-tertiary-500'>Progression</th>
              <th className='px-5 py-3 text-[12px] font-medium text-tertiary-500'>Créé le</th>
              <th className='px-5 py-3 text-right text-[12px] font-medium text-tertiary-500'>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className='px-5 py-10 text-center text-sm text-tertiary-500'>
                  Chargement...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-5 py-10 text-center text-sm text-tertiary-500'>
                  Aucun bénéficiaire trouvé.
                </td>
              </tr>
            ) : (
              rows.map(beneficiaire => (
                <tr
                  key={String(beneficiaire.id)}
                  className='border-t border-gray-100 hover:bg-gray-50/50'
                >
                  {/* Beneficiaire */}
                  <td className='px-5 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-[12px] font-semibold text-sky-700'>
                        {initialsOf(beneficiaire)}
                      </div>
                      <div className='leading-tight'>
                        <div className='text-[13px] font-semibold text-tertiary-900'>
                          {beneficiaire.firstName} {beneficiaire.lastName}
                        </div>
                        <div className='text-[11px] text-tertiary-500'>
                          ID: {String(uuidToInt(String(beneficiaire.id))).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className='px-5 py-4'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-[12px] text-tertiary-700'>
                        <Mail className='h-3.5 w-3.5 text-tertiary-400' />
                        <span className='truncate'>{beneficiaire.email}</span>
                      </div>
                      <div className='flex items-center gap-2 text-[11px] text-tertiary-500'>
                        <Phone className='h-3.5 w-3.5 text-tertiary-400' />
                        <span>{beneficiaire.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className='px-5 py-4'>
                    <StatusPill status={beneficiaire.status} />
                  </td>

                  {/* Progression */}
                  <td className='px-5 py-4'>
                    <MiniProgress value={beneficiaire.progressPercent} />
                  </td>

                  {/* Créé le */}
                  <td className='px-5 py-4 text-[12px] text-tertiary-500'>
                    {formatDateFR(beneficiaire.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className='px-5 py-4'>
                    <div className='flex items-center justify-end gap-1'>
                      <button
                        type='button'
                        onClick={() => onView?.(beneficiaire)}
                        className='grid h-8 w-8 place-items-center rounded-md text-tertiary-600 hover:bg-tertiary-100 cursor-pointer'
                        aria-label='Voir'
                        title='Voir'
                      >
                        <Eye className='h-4 w-4' />
                      </button>

                      <button
                        type='button'
                        onClick={() => onEdit?.(beneficiaire)}
                        className='grid h-8 w-8 place-items-center rounded-md text-tertiary-600 hover:bg-tertiary-100 cursor-pointer'
                        aria-label='Modifier'
                        title='Modifier'
                      >
                        <Edit className='h-4 w-4' />
                      </button>

                      <button
                        type='button'
                        onClick={() => onDelete?.(beneficiaire)}
                        className='grid h-8 w-8 place-items-center rounded-md text-red-500 hover:bg-red-50 cursor-pointer'
                        aria-label='Supprimer'
                        title='Supprimer'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
