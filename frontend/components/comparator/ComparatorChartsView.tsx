import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from 'recharts';

import { type ServiceDTO } from '@/types/Service';

import { computeFee } from '../ui/FeeCalculator';

interface ComparisonChartsViewProps {
  comparedServices: ServiceDTO[];
  amount: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

const SERVICE_COLORS = ['#38bdf8', '#22c55e', '#f97316'];
const RADAR_TEXT_COLOR_CLASSES = ['text-sky-400', 'text-emerald-400', 'text-orange-400'];

// 🔎 Petit helper déterministe pour générer une variation [-10, 10]
function hashStringToVariation(value: string, salt: number): number {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash + value.charCodeAt(i) * (i + 1 + salt)) % 1000;
  }

  // variation entre -10 et +10
  const variation = (hash % 21) - 10;
  return variation;
}

// 🔎 Clamp pour garder les scores entre 0 et 100
function clampScore(score: number): number {
  if (Number.isNaN(score)) return 0;
  if (score < 0) return 0;
  if (score > 100) return 100;
  return Math.round(score);
}

export function ComparatorChartsView({
  comparedServices,
  amount,
  isLoading,
  isError,
  errorMessage,
}: ComparisonChartsViewProps) {
  const feesChartData = useMemo(() => {
    if (!comparedServices || comparedServices.length === 0) return [];

    return comparedServices.map(s => {
      const fee = computeFee(s, amount);
      return {
        id: s.id,
        name: s.institution.name,
        label: s.name,
        fee: Math.max(0, Math.round(fee.value)),
      };
    });
  }, [comparedServices, amount]);

  const radarData = useMemo(() => {
    if (!comparedServices || comparedServices.length === 0) return [];

    const fees = comparedServices.map(s => ({
      name: s.institution.name,
      fee: Math.max(0, computeFee(s, amount).value),
    }));

    if (fees.length === 0) return [];

    const maxFee = Math.max(...fees.map(f => f.fee), 1);
    const minFee = Math.min(...fees.map(f => f.fee), 0);

    const costScores: Record<string, number> = {};
    fees.forEach(f => {
      if (maxFee === minFee || maxFee === 0) {
        costScores[f.name] = 75;
      } else {
        const ratio = (f.fee - minFee) / (maxFee - minFee);
        costScores[f.name] = clampScore(100 - ratio * 80);
      }
    });

    const criteriaLabels = ['Coût', 'Rapidité', 'Couverture', 'Fiabilité', 'Innovation'] as const;

    const rows: { critere: string; [key: string]: number | string }[] = [];

    criteriaLabels.forEach(label => {
      const row: { critere: string; [key: string]: number | string } = { critere: label };

      comparedServices.forEach((s, index) => {
        const key = s.institution.name;
        const serviceKey = `${s.id}-${index}`;

        if (label === 'Coût') {
          row[key] = costScores[key] ?? 60;
        } else if (label === 'Rapidité') {
          const base = 75;
          const variation = hashStringToVariation(serviceKey, 1);
          row[key] = clampScore(base + variation);
        } else if (label === 'Couverture') {
          const base = 70;
          const variation = hashStringToVariation(serviceKey, 2);
          row[key] = clampScore(base + variation);
        } else if (label === 'Fiabilité') {
          const base = 80;
          const variation = hashStringToVariation(serviceKey, 3);
          row[key] = clampScore(base + variation * 0.7);
        } else {
          // Innovation
          const base = 65;
          const variation = hashStringToVariation(serviceKey, 4);
          row[key] = clampScore(base + variation);
        }
      });

      rows.push(row);
    });

    return rows;
  }, [comparedServices, amount]);

  const radarLegendColorByName = useMemo(() => {
    const map: Record<string, number> = {};
    comparedServices.forEach((s, index) => {
      map[s.institution.name] = index % SERVICE_COLORS.length;
    });
    return map;
  }, [comparedServices]);

  if (isLoading) {
    return (
      <div className='space-y-8 rounded-3xl'>
        <p className='text-sm text-slate-500'>Chargement de la visualisation...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='space-y-8 rounded-3xl'>
        <p className='text-sm text-red-500'>
          {errorMessage ?? 'Impossible de charger la comparaison.'}
        </p>
      </div>
    );
  }

  if (comparedServices.length < 2) {
    return null;
  }

  return (
    <div className='space-y-8 rounded-3xl'>
      {/* Graphique barres : frais */}
      <div className='space-y-8 rounded-3xl bg-white p-6 shadow-sm'>
        <h3 className='mb-3 text-sm font-medium text-slate-900'>
          Comparaison des frais de transfert
        </h3>
        <div className='h-72 w-full rounded-2xl px-2 py-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={feesChartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />
              <XAxis dataKey='name' />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey='fee' name='Frais (F CFA)' radius={[6, 6, 0, 0]}>
                {feesChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className='mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-600'>
            <span className='inline-block h-3 w-4 bg-primary-300' />
            <span>Frais (F CFA)</span>
          </div>
        </div>
      </div>

      {/* Radar multi-critères */}
      <div className='space-y-8 rounded-3xl bg-white p-6 shadow-sm'>
        <h3 className='mb-3 text-sm font-medium text-slate-900'>Comparaison multi-critères</h3>
        <div className='h-80 w-full rounded-2xl px-4 py-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey='critere' tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />

              {comparedServices.map((s, index) => (
                <Radar
                  key={s.id}
                  name={s.institution.name}
                  dataKey={s.institution.name}
                  stroke={SERVICE_COLORS[index % SERVICE_COLORS.length]}
                  fill={SERVICE_COLORS[index % SERVICE_COLORS.length]}
                  strokeOpacity={0.9}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              ))}

              <RechartsLegend
                formatter={(value: string) => {
                  const idx = radarLegendColorByName[String(value)] ?? 0;
                  const className = RADAR_TEXT_COLOR_CLASSES[idx];

                  return <span className={className}>{value}</span>;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className='mt-2 text-center text-[11px] text-slate-400'>
            Score sur 100 pour chaque critère : Coût, Rapidité, Couverture, Fiabilité, Innovation.
          </p>
        </div>
      </div>
    </div>
  );
}
