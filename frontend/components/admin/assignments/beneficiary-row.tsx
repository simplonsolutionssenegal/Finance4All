'use client';

import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useAssignModules } from '@/hooks/assignments/useAssignModules';
import { useBeneficiaryModules } from '@/hooks/assignments/useBeneficiaryModules';
import { useRemoveModules } from '@/hooks/assignments/useRemoveModules';
import type {
  BeneficiaryAssignmentSummary,
  ModuleWithAssignment,
} from '@/types/modules/assignments';

import ModuleChip from './module-chip';

function initials(firstName: string, lastName: string) {
  const a = (firstName?.[0] ?? '').toUpperCase();
  const b = (lastName?.[0] ?? '').toUpperCase();
  return `${a}${b}` || 'U';
}

export default function BeneficiaryRow({
  beneficiary,
  onAssigned,
}: {
  beneficiary: BeneficiaryAssignmentSummary;
  onAssigned: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: modules, loading, refetch } = useBeneficiaryModules(beneficiary.id, open);

  const { assign, loading: assigning } = useAssignModules();
  const { remove, loading: removing } = useRemoveModules();

  // mode actuel: assign ou remove
  const [mode, setMode] = useState<'assign' | 'remove'>('assign');

  // sélection
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected]
  );

  const canSubmit = selectedIds.length > 0 && !(assigning || removing);

  async function handleAssignSelected() {
    if (selectedIds.length === 0) return;
    await assign(beneficiary.id, selectedIds);
    await refetch();
    onAssigned();
    setSelected({});
  }

  async function handleRemoveSelected() {
    if (selectedIds.length === 0) return;
    await remove(beneficiary.id, selectedIds);
    await refetch();
    onAssigned();
    setSelected({});
  }

  function toggleModule(m: ModuleWithAssignment) {
    const nextMode: 'assign' | 'remove' = m.assigned ? 'remove' : 'assign';

    setMode(nextMode);

    setSelected(prev => {
      // si on change de mode, on reset la sélection (plus clair)
      const reset = nextMode !== mode ? {} : { ...prev };

      return {
        ...reset,
        [m.id]: !reset[m.id],
      };
    });
  }

  const assignable = useMemo(() => modules.filter(m => !m.assigned), [modules]);
  const removable = useMemo(() => modules.filter(m => m.assigned), [modules]);

  return (
    <div className='bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>
      <button
        type='button'
        className='w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50'
        onClick={() => setOpen(v => !v)}
      >
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center text-xs font-semibold'>
            {initials(beneficiary.firstName, beneficiary.lastName)}
          </div>

          <div className='text-left'>
            <p className='text-sm font-medium text-gray-900'>
              {beneficiary.firstName} {beneficiary.lastName}
            </p>
            <p className='text-xs text-gray-500'>
              {beneficiary.assignmentsCount} modules · {beneficiary.avgProgressPercent}% complété
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='h-2 w-32 bg-gray-100 rounded-full overflow-hidden'>
            <div
              className='h-full bg-sky-400'
              style={{ width: `${beneficiary.avgProgressPercent}%` }}
            />
          </div>
          <span className='text-xs text-gray-600 w-10 text-right'>
            {beneficiary.avgProgressPercent}%
          </span>

          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className='px-4 pb-4 pt-2 border-t border-gray-100'>
          <div className='flex flex-wrap items-center gap-2 mb-3'>
            {/* Assigner tous (uniquement non assignés) */}
            <button
              type='button'
              onClick={() => {
                setMode('assign');
                const all: Record<string, boolean> = {};
                assignable.forEach(m => (all[m.id] = true));
                setSelected(all);
              }}
              className='inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50'
            >
              <Plus size={14} /> Assigner tous
            </button>

            {/* Retirer tous (uniquement assignés) */}
            <button
              type='button'
              onClick={() => {
                setMode('remove');
                const all: Record<string, boolean> = {};
                removable.forEach(m => (all[m.id] = true));
                setSelected(all);
              }}
              className='inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50'
            >
              <Trash2 size={14} /> Retirer tous
            </button>

            {/* Action principale selon mode */}
            {mode === 'assign' ? (
              <button
                type='button'
                disabled={!canSubmit}
                onClick={handleAssignSelected}
                className='text-xs px-3 py-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50'
              >
                {assigning ? 'Assignation…' : `Assigner (${selectedIds.length})`}
              </button>
            ) : (
              <button
                type='button'
                disabled={!canSubmit}
                onClick={handleRemoveSelected}
                className='text-xs px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
              >
                {removing ? 'Retrait…' : `Retirer (${selectedIds.length})`}
              </button>
            )}

            {/* petit indicateur de mode */}
            <span className='text-xs text-gray-500 ml-auto'>
              Mode:{' '}
              <span className='font-medium'>{mode === 'assign' ? 'Assignation' : 'Retrait'}</span>
            </span>
          </div>

          {loading ? (
            <p className='text-sm text-gray-500'>Chargement des modules…</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
              {modules.map(m => (
                <ModuleChip
                  key={m.id}
                  module={m}
                  selected={!!selected[m.id]}
                  mode={mode}
                  onToggle={() => toggleModule(m)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
