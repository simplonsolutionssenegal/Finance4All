'use client';

import {
  Mail,
  Phone,
  CalendarDays,
  BookOpen,
  Award,
  Folder,
  CircleDollarSign,
  Clock,
  Loader2,
} from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import type { BeneficiaireDashboardData } from '@/hooks/beneficiary/useBeneficiaireDashboardData';
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
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-tertiary-200'>
        <div className='h-full rounded-full bg-sky-500' style={{ width: `${v}%` }} />
      </div>
      <span className='text-[11px] tabular-nums text-tertiary-500'>{v}%</span>
    </div>
  );
}

function initialsOf(b: Beneficiary) {
  const a = (b.firstName?.[0] ?? '').toUpperCase();
  const c = (b.lastName?.[0] ?? '').toUpperCase();
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

type BeneficiaryDetailProps = {
  beneficiary: Beneficiary;
  onBack: () => void;
  dashboardData?: BeneficiaireDashboardData | null;
  isDashboardLoading?: boolean;
};

export function BeneficiaryDetail({
  beneficiary,
  onBack,
  dashboardData,
  isDashboardLoading,
}: BeneficiaryDetailProps) {
  const fullName = `${beneficiary.firstName} ${beneficiary.lastName}`.trim();
  const initials = initialsOf(beneficiary);

  const stats = dashboardData?.stats;
  const moduleStats = dashboardData?.moduleStats;
  const timeByModule = dashboardData?.timeByModule ?? [];
  const progress = stats?.globalProgress ?? beneficiary.progressPercent ?? 0;

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <div className='space-y-5'>
      {/* Retour */}
      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={onBack}
          className='inline-flex items-center gap-2 text-sm text-black hover:text-black focus:outline-none cursor-pointer'
        >
          <span className='inline-flex h-5 w-5 items-center justify-center rounded-full text-black text-[18px]'>
            ←
          </span>
          Retour à la liste
        </button>
      </div>

      {/* Header beneficiary */}
      <Card className='rounded-2xl border border-slate-100 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1)]'>
        <CardContent className='flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sm font-semibold text-sky-700'>
              {initials}
            </div>

            <div className='space-y-1'>
              <div className='text-sm font-semibold text-tertiary-900'>{fullName}</div>

              <div className='flex flex-wrap items-center gap-4 text-[12px] text-tertiary-500'>
                <span className='inline-flex items-center gap-1'>
                  <Mail className='h-3.5 w-3.5' />
                  {beneficiary.email}
                </span>

                {beneficiary.phone ? (
                  <span className='inline-flex items-center gap-1'>
                    <Phone className='h-3.5 w-3.5' />
                    {beneficiary.phone}
                  </span>
                ) : null}

                <span className='inline-flex items-center'>
                  <StatusPill status={beneficiary.status} />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille principale */}
      <div className='grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]'>
        {/* Colonne gauche */}
        <div className='space-y-6'>
          {/* Infos perso */}
          <Card className='rounded-2xl border border-slate-100 shadow-sm'>
            <CardContent className='px-6 py-4 space-y-4'>
              <div className='flex items-center gap-2 text-sm font-semibold text-tertiary-900'>
                <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-600 text-xs'>
                  i
                </span>
                Informations personnelles
              </div>

              <div className='space-y-2 text-[12px] text-tertiary-600'>
                <div>
                  <div className='font-medium text-tertiary-500'>Adresse</div>
                  <div>Non renseignée</div>
                </div>
                <div>
                  <div className='font-medium text-tertiary-500'>Ville</div>
                  <div>Non renseignée</div>
                </div>
                <div>
                  <div className='font-medium text-tertiary-500'>Pays</div>
                  <div>Non renseigné</div>
                </div>

                <div className='flex items-center gap-2'>
                  <CalendarDays className='h-3.5 w-3.5 text-tertiary-400' />
                  <div>
                    <div className='font-medium text-tertiary-500'>Date d’inscription</div>
                    <div>{formatDateFR(beneficiary.createdAt)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className='rounded-2xl border border-slate-100 shadow-sm'>
            <CardContent className='px-6 py-4 space-y-4'>
              <div className='flex items-center gap-2 text-sm font-semibold text-tertiary-900'>
                <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-600 text-xs'>
                  %
                </span>
                Statistiques
              </div>

              <div className='space-y-2'>
                <div className='text-[12px] text-tertiary-500'>Progression globale</div>
                <MiniProgress value={progress} />
              </div>

              <div className='mt-3 flex gap-3'>
                <div className='flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2'>
                  <div className='flex items-center gap-2 text-[11px] text-tertiary-500'>
                    <BookOpen className='h-3.5 w-3.5 text-tertiary-400' />
                    Modules
                  </div>
                  <div className='mt-1 text-lg font-semibold text-tertiary-900'>
                    {moduleStats ? `${moduleStats.completed}/${moduleStats.total}` : '—'}
                  </div>
                </div>

                <div className='flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2'>
                  <div className='flex items-center gap-2 text-[11px] text-tertiary-500'>
                    <Clock className='h-3.5 w-3.5 text-tertiary-400' />
                    Temps
                  </div>
                  <div className='mt-1 text-sm font-semibold text-tertiary-900'>
                    {stats?.learningTime ?? '—'}
                  </div>
                </div>
              </div>

              <div className='mt-3 flex gap-3'>
                <div className='flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2'>
                  <div className='flex items-center gap-2 text-[11px] text-tertiary-500'>
                    <Award className='h-3.5 w-3.5 text-tertiary-400' />
                    Quizzes
                  </div>
                  <div className='mt-1 text-lg font-semibold text-tertiary-900'>
                    {stats ? `${stats.quizzesPassed.current}/${stats.quizzesPassed.total}` : '—'}
                  </div>
                </div>

                <div className='flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2'>
                  <div className='flex items-center gap-2 text-[11px] text-tertiary-500'>
                    <BookOpen className='h-3.5 w-3.5 text-tertiary-400' />
                    En cours
                  </div>
                  <div className='mt-1 text-lg font-semibold text-tertiary-900'>
                    {moduleStats?.inProgress ?? '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className='space-y-6'>
          {/* Modules de formation */}
          <Card className='rounded-2xl border border-slate-100 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)]'>
            <CardContent className='p-6'>
              <div className='grid grid-cols-[40px_1fr] items-center gap-3'>
                <div className='grid h-9 w-9 place-items-center rounded-xl bg-sky-50'>
                  <Folder className='h-4 w-4 text-sky-600' />
                </div>
                <div className='text-sm font-semibold text-tertiary-900'>Modules de formation</div>
              </div>

              {isDashboardLoading ? (
                <div className='mt-6 flex items-center justify-center gap-2 text-sm text-tertiary-500'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Chargement...
                </div>
              ) : timeByModule.length === 0 ? (
                <div className='mt-4 grid grid-cols-[40px_1fr] gap-3'>
                  <div />
                  <p className='text-[12px] text-tertiary-400'>
                    Aucun module suivi pour le moment.
                  </p>
                </div>
              ) : (
                timeByModule.map((mod, i) => {
                  const pct = clamp(mod.completionPercent);
                  const statusLabel =
                    pct >= 100 ? 'Terminé' : pct > 0 ? 'En cours' : 'Non commencé';
                  const statusColor =
                    pct >= 100
                      ? 'bg-emerald-50 text-emerald-600'
                      : pct > 0
                        ? 'bg-sky-50 text-sky-600'
                        : 'bg-slate-100 text-tertiary-400';

                  return (
                    <React.Fragment key={mod.moduleId}>
                      <div className='mt-4 grid grid-cols-[40px_1fr_auto] items-start gap-3'>
                        <div />
                        <div className='flex items-start gap-3'>
                          <div className='mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-amber-50'>
                            <CircleDollarSign className='h-4 w-4 text-amber-500' />
                          </div>
                          <div>
                            <div className='text-[13px] font-semibold text-tertiary-900'>
                              {mod.moduleTitle}
                            </div>
                            <div className='text-[11px] text-tertiary-500'>
                              {mod.totalSeconds > 0
                                ? `${Math.round(mod.totalSeconds / 60)} min de formation`
                                : 'Pas encore commencé'}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <div className='mt-3 grid grid-cols-[40px_1fr_auto] items-center gap-3'>
                        <div />
                        <div className='h-2 overflow-hidden rounded-full bg-slate-100'>
                          <div
                            className='h-full rounded-full bg-sky-500'
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className='w-10 text-right text-[11px] font-medium text-tertiary-500'>
                          {Math.round(pct)}%
                        </div>
                      </div>

                      {i < timeByModule.length - 1 && (
                        <div className='mt-4 grid grid-cols-[40px_1fr] gap-3'>
                          <div />
                          <div className='h-px w-full bg-slate-200' />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Activité récente */}
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
            <Card className='rounded-2xl border border-slate-100 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)]'>
              <CardContent className='p-6'>
                <div className='grid grid-cols-[40px_1fr] items-center gap-3'>
                  <div className='grid h-9 w-9 place-items-center rounded-xl bg-sky-50'>
                    <Award className='h-4 w-4 text-sky-600' />
                  </div>
                  <div className='text-sm font-semibold text-tertiary-900'>Activité récente</div>
                </div>

                {dashboardData.recentActivity.map((activity, i) => (
                  <React.Fragment key={activity.chapterId}>
                    <div className='mt-4 grid grid-cols-[40px_1fr_auto] items-start gap-3'>
                      <div />
                      <div className='flex items-start gap-3'>
                        <div className='mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-sky-50'>
                          <BookOpen className='h-4 w-4 text-sky-600' />
                        </div>
                        <div>
                          <div className='text-[13px] font-semibold text-tertiary-900'>
                            {activity.chapterTitle}
                          </div>
                          <div className='text-[11px] text-tertiary-500'>
                            {activity.lessonTitle} — {activity.moduleTitle}
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col items-end'>
                        <div className='text-[11px] font-medium text-tertiary-500'>
                          {Math.round(clamp(activity.progress))}%
                        </div>
                        {activity.remainingTime && (
                          <div className='text-[10px] text-tertiary-400'>
                            {activity.remainingTime} restant
                          </div>
                        )}
                      </div>
                    </div>

                    {i < dashboardData.recentActivity.length - 1 && (
                      <div className='mt-4 grid grid-cols-[40px_1fr] gap-3'>
                        <div />
                        <div className='h-px w-full bg-slate-200' />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
