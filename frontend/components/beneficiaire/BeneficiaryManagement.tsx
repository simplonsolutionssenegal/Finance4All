'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { Download, Filter, Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import AddBeneficiaryModal, {
  type CreateBeneficiaryPayload,
  type UpdateBeneficiaryPayload,
} from '@/components/beneficiaire/AddBeneficiaryModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';
import { useCreateBeneficiaryAdmin } from '@/hooks/beneficiary/useCreateBeneficiaryAdmin';
import type { Beneficiary } from '@/types/beneficiaire/beneficiary';
// eslint-disable-next-line no-duplicate-imports
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';

import BeneficiaryTable from './BeneficiaryTable';

export function uuidToInt(uuid: string): number {
  const hex = uuid.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) throw new Error('UUID invalide');

  const mod = BigInt(3000);
  const n = BigInt(`0x${hex}`) % mod;

  return Number(n) + 1;
}

function exportCSV(rows: Beneficiary[]) {
  const headers = [
    'id',
    'firstName',
    'lastName',
    'email',
    'phone',
    'status',
    'progressPercent',
    'createdAt',
  ];
  const lines = [
    headers.join(','),
    ...rows.map(r =>
      headers
        .map(h => {
          const val = (r as unknown as Record<string, unknown>)[h] ?? '';
          const s = String(val).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(',')
    ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'beneficiaires.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BeneficiaryManagement() {
  const router = useRouter();
  const { getToken } = useAuth();

  const { data = [], isLoading } = useBeneficiaries();
  const [rows, setRows] = useState<Beneficiary[]>([]);
  useEffect(() => setRows(data), [data]);

  const { organization } = useOrganization();
  const organizationId = organization?.id ?? '';

  const createBeneficiary = useCreateBeneficiaryAdmin();

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BeneficiaryStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter(beneficiaire => {
      const matchesQuery =
        !query ||
        `${beneficiaire.firstName} ${beneficiaire.lastName}`.toLowerCase().includes(query) ||
        beneficiaire.email.toLowerCase().includes(query) ||
        (beneficiaire.phone ?? '').toLowerCase().includes(query) ||
        String(beneficiaire.id).includes(query);

      const matchesStatus = statusFilter === 'ALL' ? true : beneficiaire.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, q, statusFilter]);

  const openCreate = () => {
    setMode('create');
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (beneficiaire: Beneficiary) => {
    setMode('edit');
    setEditing(beneficiaire);
    setIsModalOpen(true);
  };

  async function patchBeneficiary(payload: UpdateBeneficiaryPayload) {
    const token = await getToken();
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) throw new Error('NEXT_PUBLIC_API_URL non défini');
    const res = await fetch(`${base}/beneficiaries/${payload.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        organizationId: payload.organizationId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(txt || `Erreur PATCH (${res.status})`);
    }

    return res.json().catch(() => ({}));
  }

  const onSubmit = async (payload: CreateBeneficiaryPayload | UpdateBeneficiaryPayload) => {
    try {
      if (mode === 'create') {
        await createBeneficiary.mutateAsync(payload as CreateBeneficiaryPayload);
        toast.success('Bénéficiaire ajouté avec succès ✅');
        setIsModalOpen(false);
        router.refresh();
        return;
      }

      setIsUpdating(true);
      const p = payload as UpdateBeneficiaryPayload;
      await patchBeneficiary(p);
      setRows(curr =>
        curr.map(beneficiaire =>
          String(beneficiaire.id) === String(p.id)
            ? {
                ...beneficiaire,
                firstName: p.firstName,
                lastName: p.lastName,
                phone: p.phone ?? undefined,
              }
            : beneficiaire
        )
      );
      toast.success('Bénéficiaire mis à jour avec succès ✅');
      setIsModalOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);

      const msg =
        e instanceof Error && e.message?.trim()
          ? e.message
          : "Une erreur s'est produite. Réessaie.";

      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Gestion des bénéficiaires</h1>
          <p className='mt-1 text-sm text-slate-500'>
            {organization?.name ?? 'Aucune organisation'} - {rows.length} bénéficiaires
          </p>
        </div>

        <Button
          className='rounded-xl bg-primary-300 text-white hover:bg-primary-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          onClick={openCreate}
          disabled={!organizationId}
          title={!organizationId ? "Sélectionne une organisation d'abord" : undefined}
        >
          <User className='mr-2 h-4 w-4' />
          Ajouter un bénéficiaire
        </Button>
      </div>

      <Card className='rounded-2xl border border-gray-100'>
        <CardContent className='p-0'>
          <div className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='rounded-2xl border border-slate-100 bg-white px-4 py-3'>
              <div className='flex items-center gap-3'>
                {/* Search */}
                <div className='relative w-[260px]'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400  cursor-pointer' />
                  <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder='Rechercher...'
                    className={[
                      'h-9 w-full rounded-xl bg-white pl-9 pr-3 text-[13px] text-slate-700',
                      'border border-slate-200 outline-none',
                      'placeholder:text-slate-400',
                      'focus:border-slate-300 focus:ring-0',
                    ].join(' ')}
                  />
                </div>

                {/* Filter */}
                <button
                  type='button'
                  onClick={() =>
                    setStatusFilter(s =>
                      s === 'ALL'
                        ? BeneficiaryStatus.ACTIVE
                        : s === BeneficiaryStatus.ACTIVE
                          ? BeneficiaryStatus.INACTIVE
                          : 'ALL'
                    )
                  }
                  className={[
                    'h-9 rounded-xl px-3 text-[13px] font-medium text-slate-700',
                    'border border-slate-200 bg-white',
                    'hover:bg-slate-50',
                    'inline-flex items-center gap-2',
                    'cursor-pointer',
                  ].join(' ')}
                  title='Filtrer (ALL -> Actif -> Inactif)'
                >
                  <Filter className='h-4 w-4 text-slate-500' />
                  Filtrer
                </button>

                {/* Export */}
                <button
                  type='button'
                  onClick={() => exportCSV(filtered)}
                  className={[
                    'h-9 rounded-xl px-3 text-[13px] font-medium text-slate-700',
                    'border border-slate-200 bg-white',
                    'hover:bg-slate-50',
                    'inline-flex items-center gap-2',
                    'cursor-pointer',
                  ].join(' ')}
                >
                  <Download className='h-4 w-4 text-slate-500' />
                  Exporter
                </button>
              </div>
            </div>
          </div>
          <div className='overflow-x-auto overflow-y-hidden'>
            <BeneficiaryTable
              rows={filtered}
              isLoading={isLoading}
              uuidToInt={uuidToInt}
              onEdit={openEdit}
            />
          </div>
        </CardContent>
      </Card>

      <AddBeneficiaryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        organizationId={organizationId}
        mode={mode}
        beneficiaryId={editing?.id ? String(editing.id) : undefined}
        initialValues={
          editing
            ? {
                firstName: editing.firstName,
                lastName: editing.lastName,
                email: editing.email,
                phone: editing.phone ?? '',
              }
            : undefined
        }
        isCreating={mode === 'create' && createBeneficiary.isPending}
        isUpdating={mode === 'edit' && isUpdating}
        onSubmit={onSubmit}
      />
    </div>
  );
}
