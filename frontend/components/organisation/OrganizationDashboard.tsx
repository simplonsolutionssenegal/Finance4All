'use client';

import { BookOpen, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ------------------ Types ------------------
type Stat = {
  label: string;
  value: string | number;
  hint: string; // ex: "+2 ce mois"
  icon: React.ReactNode;
  accent: 'slate' | 'blue' | 'green';
};

type TopPerformer = { name: string; percent: number };
type ModuleAssigned = { name: string; value: number };

type Props = {
  orgName?: string;
  subtitle?: string;

  stats?: Stat[];
  engagementData?: Array<{ month: string; actifs: number; completes: number }>;
  performanceBuckets?: Array<{ label: string; value: number }>;
  mostAssigned?: ModuleAssigned[];
  topPerformers?: TopPerformer[];

  onManageBeneficiaries?: () => void;
  onAssignModules?: () => void;
  onViewCertificates?: () => void;
};

// ------------------ Defaults (identiques visuellement) ------------------
const defaultStats: Stat[] = [
  {
    label: 'Bénéficiaires actifs',
    value: 13,
    hint: '+2 ce mois',
    icon: <Users className='h-5 w-5' />,
    accent: 'slate',
  },
  {
    label: 'Modules assignés',
    value: 3,
    hint: '+12 cette semaine',
    icon: <BookOpen className='h-5 w-5' />,
    accent: 'blue',
  },
  {
    label: 'Taux de complétion',
    value: '33%',
    hint: '+5% ce mois',
    icon: <CheckCircle2 className='h-5 w-5' />,
    accent: 'green',
  },
  {
    label: 'Progression moyenne',
    value: '3%',
    hint: 'Très bien !',
    icon: <TrendingUp className='h-5 w-5' />,
    accent: 'slate',
  },
];

const defaultEngagement = [
  { month: 'Jan', actifs: 18, completes: 4 },
  { month: 'Fév', actifs: 24, completes: 6 },
  { month: 'Mar', actifs: 29, completes: 7 },
  { month: 'Avr', actifs: 35, completes: 8 },
  { month: 'Mai', actifs: 41, completes: 9 },
  { month: 'Juin', actifs: 49, completes: 10 },
];

const defaultBuckets = [
  { label: '0-20%', value: 2 },
  { label: '21-40%', value: 3 },
  { label: '41-60%', value: 4 },
  { label: '61-80%', value: 3 },
  { label: '81-100%', value: 2 },
];

const defaultMostAssigned: ModuleAssigned[] = [
  { name: 'Finance Perso', value: 14 },
  { name: 'Épargne', value: 13 },
  { name: 'Mobile Money', value: 12 },
  { name: 'Crédit', value: 8 },
  { name: 'Investissements', value: 6 },
];

const defaultTopPerformers: TopPerformer[] = [
  { name: 'Awa Sarr', percent: 33 },
  { name: 'Ousmane Diallo', percent: 0 },
  { name: 'Aminata Fall', percent: 0 },
  { name: 'Moussa Ndiaye', percent: 0 },
  { name: 'Khady Sow', percent: 0 },
];

// ------------------ Design helpers (look comme image) ------------------
const cardBase =
  'bg-white border border-slate-100 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]';

function IconPill({ accent, children }: { accent: Stat['accent']; children: React.ReactNode }) {
  const styles =
    accent === 'blue'
      ? 'bg-sky-50 text-sky-600'
      : accent === 'green'
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-slate-50 text-slate-600';

  return (
    <div className={`h-10 w-10 rounded-2xl grid place-items-center ${styles}`}>{children}</div>
  );
}

function MiniLine() {
  return (
    <div className='mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden'>
      <div className='h-full w-2/3 bg-sky-400' />
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <Card className={cardBase}>
      <CardContent className='p-6'>
        <div className='space-y-3'>
          <IconPill accent={stat.accent}>{stat.icon}</IconPill>
          <div className='text-[28px] leading-none font-semibold text-slate-900'>{stat.value}</div>
          <div className='text-sm text-slate-500'>{stat.label}</div>
          <div className='text-xs text-sky-500'>{stat.hint}</div>
        </div>
        <MiniLine />
      </CardContent>
    </Card>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className='h-2 rounded-full bg-slate-100 overflow-hidden'>
      <div className='h-full bg-sky-400' style={{ width: `${v}%` }} />
    </div>
  );
}

export default function OrganizationDashboard({
  orgName = 'Microcrédit Sénégal',
  subtitle = 'Suivi de vos bénéficiaires',
  stats = defaultStats,
  engagementData = defaultEngagement,
  performanceBuckets = defaultBuckets,
  mostAssigned = defaultMostAssigned,
  topPerformers = defaultTopPerformers,
  onManageBeneficiaries,
  onAssignModules,
  onViewCertificates,
}: Props) {
  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-6 space-y-6'>
        {/* Header (même style que l’image) */}
        <div className='space-y-1'>
          <h1 className='text-[22px] font-semibold text-slate-900'>Dashboard Organisation</h1>
          <p className='text-sm text-slate-500'>
            {orgName} - {subtitle}
          </p>
        </div>

        {/* 4 stats cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {stats.map((s, idx) => (
            <StatCard key={idx} stat={s} />
          ))}
        </div>

        {/* Charts row */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Engagement mensuel */}
          <Card className={cardBase}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base text-slate-900'>Engagement mensuel</CardTitle>
              <p className='text-xs text-slate-500'>Évolution de l’activité</p>
            </CardHeader>

            <CardContent className='h-[270px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={engagementData}
                  margin={{ top: 12, right: 12, left: -12, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />

                  {/* Ligne verte (actifs) */}
                  <Area
                    type='monotone'
                    dataKey='actifs'
                    strokeWidth={2}
                    stroke='currentColor'
                    className='text-emerald-500'
                    fill='currentColor'
                    fillOpacity={0.14}
                  />
                  {/* Ligne bleue (complétés) */}
                  <Area
                    type='monotone'
                    dataKey='completes'
                    strokeWidth={2}
                    stroke='currentColor'
                    className='text-sky-500'
                    fill='currentColor'
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className='mt-3 flex items-center gap-6 text-xs text-slate-500'>
                <div className='flex items-center gap-2'>
                  <span className='h-2 w-2 rounded-full bg-sky-500' />
                  Bénéficiaires actifs
                </div>
                <div className='flex items-center gap-2'>
                  <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  Modules complétés
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Répartition des performances */}
          <Card className={cardBase}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base text-slate-900'>
                Répartition des performances
              </CardTitle>
              <p className='text-xs text-slate-500'>Distribution par taux de progression</p>
            </CardHeader>

            <CardContent className='h-[270px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={performanceBuckets}
                  margin={{ top: 12, right: 12, left: -12, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='label' tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey='value' radius={[10, 10, 0, 0]} fill='rgb(125 211 252)' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: modules + top performers */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Modules les plus assignés */}
          <Card className={cardBase}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base text-slate-900'>Modules les plus assignés</CardTitle>
              <p className='text-xs text-slate-500'>Top 5 des formations</p>
            </CardHeader>

            <CardContent className='space-y-4'>
              {mostAssigned.map(m => {
                const max = Math.max(...mostAssigned.map(x => x.value), 1);
                const pct = (m.value / max) * 100;

                return (
                  <div key={m.name} className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-slate-700'>{m.name}</span>
                      <span className='text-slate-500'>{m.value}</span>
                    </div>
                    <div className='h-3 rounded-full bg-slate-100 overflow-hidden'>
                      <div
                        className='h-full bg-emerald-500 rounded-full'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top performers */}
          <Card className={cardBase}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base text-slate-900'>Top performers</CardTitle>
              <p className='text-xs text-slate-500'>Meilleurs taux de complétion</p>
            </CardHeader>

            <CardContent className='space-y-4'>
              {topPerformers.map((p, idx) => (
                <div key={p.name} className='flex items-center gap-3'>
                  <div className='h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center text-xs font-semibold'>
                    #{idx + 1}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-slate-700'>{p.name}</div>
                      <div className='text-xs font-medium text-emerald-700'>{p.percent}%</div>
                    </div>
                    <div className='mt-2'>
                      <ProgressBar value={p.percent} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides (3 grandes cartes) */}
        <Card className={cardBase}>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base text-slate-900'>Actions rapides</CardTitle>
          </CardHeader>

          <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button
              type='button'
              onClick={onManageBeneficiaries}
              className='rounded-2xl p-5 text-left border border-slate-100 bg-sky-200/70 hover:bg-sky-200 transition shadow-sm'
            >
              <div className='text-sm font-semibold text-slate-900'>Gérer les bénéficiaires</div>
              <div className='mt-1 text-xs text-slate-600'>13 bénéficiaires</div>
            </button>

            <button
              type='button'
              onClick={onAssignModules}
              className='rounded-2xl p-5 text-left bg-emerald-600 hover:bg-emerald-700 transition shadow-sm'
            >
              <div className='text-sm font-semibold text-white'>Assigner des modules</div>
              <div className='mt-1 text-xs text-emerald-50'>20 modules disponibles</div>
            </button>

            <button
              type='button'
              onClick={onViewCertificates}
              className='rounded-2xl p-5 text-left border border-slate-100 bg-white hover:bg-slate-50 transition shadow-sm'
            >
              <div className='text-sm font-semibold text-slate-900'>Voir les certificats</div>
              <div className='mt-1 text-xs text-slate-600'>0 obtenus</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
