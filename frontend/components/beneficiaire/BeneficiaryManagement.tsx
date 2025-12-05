'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { Download, Eye, Filter, Pencil, Search, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import AddBeneficiaryModal, {
  type CreateBeneficiaryPayload,
  type UpdateBeneficiaryPayload,
} from '@/components/beneficiaire/AddBeneficiaryModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';
import { useCreateBeneficiaryAdmin } from '@/hooks/beneficiary/useCreateBeneficiaryAdmin';
import type { Beneficiary } from '@/types/beneficiaire/beneficiary';
// eslint-disable-next-line no-duplicate-imports
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';

function initialsOf(b: Beneficiary) {
  const a = (b.firstName?.[0] ?? '').toUpperCase();
  const c = (b.lastName?.[0] ?? '').toUpperCase();
  const d = (b.phone?.[0] ?? '').toUpperCase();
  return `${a}${c}${d}` || 'B';
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

function StatusPill({ status }: { status: BeneficiaryStatus | 'PENDING' }) {
  if (status === 'PENDING') {
    return (
      <span className='inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700'>
        En attente
      </span>
    );
  }
  const isActive = status === BeneficiaryStatus.ACTIVE;
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      ].join(' ')}
    >
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  );
}

function MiniProgress({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className='flex items-center gap-3'>
      <div className='h-2 w-28 overflow-hidden rounded-full bg-gray-200'>
        <div className='h-full rounded-full bg-sky-500' style={{ width: `${v}%` }} />
      </div>
      <span className='text-xs tabular-nums text-gray-600'>{v}%</span>
    </div>
  );
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

  // modal state (create/edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Beneficiary | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter(b => {
      const matchesQuery =
        !query ||
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        (b.phone ?? '').toLowerCase().includes(query) ||
        String(b.id).includes(query);

      const matchesStatus = statusFilter === 'ALL' ? true : b.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, q, statusFilter]);

  const openCreate = () => {
    setMode('create');
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (b: Beneficiary) => {
    setMode('edit');
    setEditing(b);
    setIsModalOpen(true);
  };

  async function patchBeneficiary(payload: UpdateBeneficiaryPayload) {
    const token = await getToken();
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) throw new Error('NEXT_PUBLIC_API_URL manquant');

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
        setIsModalOpen(false);
        router.refresh();
      } else {
        const p = payload as UpdateBeneficiaryPayload;
        await patchBeneficiary(p);
        setRows(curr =>
          curr.map(b =>
            b.id === p.id
              ? { ...b, firstName: p.firstName, lastName: p.lastName, phone: p.phone ?? undefined }
              : b
          )
        );

        setIsModalOpen(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  };

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Gestion des bénéficiaires</h1>
          <p className='mt-1 text-sm text-slate-500'>
            {organization?.name ?? '—'} - {rows.length} bénéficiaires
          </p>
        </div>

        <Button
          className='rounded-xl bg-sky-500 text-white hover:bg-sky-600'
          onClick={openCreate}
          disabled={!organizationId}
          title={!organizationId ? "Sélectionne une organisation (Clerk) d'abord" : undefined}
        >
          <User className='mr-2 h-4 w-4' />
          Ajouter un bénéficiaire
        </Button>
      </div>

      <Card className='rounded-2xl border border-gray-100 shadow-sm'>
        <CardContent className='p-0'>
          <div className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <Input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder='Rechercher...'
                  className='w-[260px] rounded-xl pl-9'
                />
              </div>

              <Button
                type='button'
                variant='secondary'
                className='rounded-xl'
                onClick={() =>
                  setStatusFilter(s =>
                    s === 'ALL'
                      ? BeneficiaryStatus.ACTIVE
                      : s === BeneficiaryStatus.ACTIVE
                        ? BeneficiaryStatus.INACTIVE
                        : 'ALL'
                  )
                }
                title='Filtrer (ALL -> Actif -> Inactif)'
              >
                <Filter className='mr-2 h-4 w-4' />
                Filtrer
              </Button>

              <Button
                type='button'
                variant='secondary'
                className='rounded-xl'
                onClick={() => exportCSV(filtered)}
              >
                <Download className='mr-2 h-4 w-4' />
                Exporter
              </Button>
            </div>

            <div className='text-xs text-slate-500'>
              Filtre: <span className='font-medium text-slate-800'>{statusFilter}</span>
            </div>
          </div>

          <div className='h-px bg-gray-100' />

          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-white'>
                  <TableHead className='w-[320px]'>Bénéficiaire</TableHead>
                  <TableHead className='w-[320px]'>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-10 text-center text-sm text-slate-500'>
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-10 text-center text-sm text-slate-500'>
                      Aucun bénéficiaire trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(b => (
                    <TableRow key={b.id} className='border-gray-100'>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700'>
                            {initialsOf(b)}
                          </div>
                          <div className='leading-tight'>
                            <div className='font-semibold text-slate-900'>
                              {b.firstName} {b.lastName}
                            </div>
                            <div className='text-xs text-slate-500'>ID: {b.id}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className='text-sm text-slate-700'>{b.email}</div>
                        <div className='text-xs text-slate-500'>{b.phone ?? '—'}</div>
                      </TableCell>

                      <TableCell>
                        <StatusPill status={b.status} />
                      </TableCell>

                      <TableCell>
                        <MiniProgress value={b.progressPercent} />
                      </TableCell>

                      <TableCell className='text-sm text-slate-600'>
                        {formatDateFR(b.createdAt)}
                      </TableCell>

                      <TableCell>
                        <div className='flex items-center justify-end gap-2'>
                          <Button variant='ghost' size='icon' className='h-8 w-8' title='Voir'>
                            <Eye className='h-4 w-4' />
                          </Button>

                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            title='Modifier'
                            onClick={() => openEdit(b)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>

                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-red-600 hover:text-red-700'
                            title='Supprimer'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
        isCreating={mode === 'create' ? createBeneficiary.isPending : false}
        isUpdating={mode === 'edit' ? false : false}
        onSubmit={onSubmit}
      />
    </div>
  );
}
