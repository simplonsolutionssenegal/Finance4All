'use client';

import { Separator } from '@radix-ui/react-separator';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Check,
  Calculator,
  History,
  Info,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { computeFee } from '@/components/ui/FeeCalculator';
import { useSimulator } from '@/hooks/useSimulator';
import type { DropdownOption } from '@/lib/dropdown-types';
import { formatCurrency, validateValue } from '@/lib/format-utils';
import type { Institution, Service } from '@/lib/simulator-types';
import type { RecentSim, ServiceDTO } from '@/types/Service';

import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

const DEFAULT_MAX_AMOUNT = 20_000_000;

const RECENT_SIM_KEY = 'services_recent_simulations';
const MAX_SERVICE_RECENT = 5;

/**
 * Intl.NumberFormat(fr-FR) utilise souvent des espaces insécables.
 * Les tests getByText("5 000 FCFA") échouent si le DOM contient "5\u202F000\u00A0FCFA".
 * => On normalise les espaces pour avoir un rendu + test stable.
 */
function normalizeSpaces(s: string) {
  return s.replace(/[\u00A0\u202F]/g, ' ');
}

function formatCurrencyUI(n: number) {
  return normalizeSpaces(formatCurrency(n));
}

function safeReadRecent(): RecentSim[] {
  try {
    const raw = localStorage.getItem(RECENT_SIM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as RecentSim[]).slice(0, MAX_SERVICE_RECENT);
  } catch {
    return [];
  }
}

function safeWriteRecent(items: RecentSim[]) {
  try {
    localStorage.setItem(RECENT_SIM_KEY, JSON.stringify(items.slice(0, MAX_SERVICE_RECENT)));
  } catch {
    // ignore
  }
}

function safeClearRecent() {
  try {
    localStorage.removeItem(RECENT_SIM_KEY);
  } catch {
    // ignore
  }
}

const createInstitutionOptions = (institutions: Institution[]): DropdownOption<Institution>[] => {
  return institutions.map(institution => ({
    id: institution.id,
    name: institution.name,
    value: institution,
    icon: institution.logoUrl || '🏦',
    description: `${institution.services?.length || 0} service(s) disponible(s)`,
  }));
};

const createServiceOptions = (services: Service[]): DropdownOption<Service>[] => {
  return services.map(service => ({
    id: service.id,
    name: service.name,
    value: service,
    description: service.longName,
  }));
};

const isHttpUrl = (v: unknown): v is string => typeof v === 'string' && /^https?:\/\//.test(v);

export function ServiceSimulator() {
  const router = useRouter();

  const { params, institutions, isLoading, updateParam, getAvailableServices, resetSimulation } =
    useSimulator();

  const [recent, setRecent] = useState<RecentSim[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Charger l'historique au montage
  useEffect(() => {
    setRecent(safeReadRecent());
  }, []);

  // Sauvegarder l'historique à chaque changement
  useEffect(() => {
    safeWriteRecent(recent);
  }, [recent]);

  const clearRecent = () => {
    setRecent([]);
    safeClearRecent();
  };

  // Si l'utilisateur change quelque chose, il doit recliquer sur "Calculer"
  useEffect(() => {
    setHasCalculated(false);
  }, [params.institution?.id, params.service?.id, params.amount, params.selectedPlafondIndex]);

  // Reset plafond sélectionné quand le service change
  useEffect(() => {
    if (params.service?.id) {
      updateParam('selectedPlafondIndex', 0);
    }
  }, [params.service?.id, updateParam]);

  const institutionOptions = useMemo(() => createInstitutionOptions(institutions), [institutions]);

  const availableServices = getAvailableServices();
  const serviceOptions = useMemo(
    () => createServiceOptions(availableServices),
    [availableServices]
  );

  // Plafonds / limites
  const parsePlafond = (plafond: string): { min: number; max: number } | null => {
    if (!plafond || plafond.trim() === '') return null;

    if (plafond.includes('-')) {
      const [min, max] = plafond.split('-').map(v => Number.parseFloat(v.trim()));
      if (!Number.isNaN(min) && !Number.isNaN(max)) return { min, max };
    }

    const value = Number.parseFloat(plafond.trim());
    if (!Number.isNaN(value)) return { min: 0, max: value };

    return null;
  };

  const currentLimits = useMemo(() => {
    const service = params.service;
    const fallback = { min: 0, max: DEFAULT_MAX_AMOUNT };

    if (!service) return { amount: fallback };

    const min =
      typeof service.montantMin === 'number' && service.montantMin > 0 ? service.montantMin : 0;

    let max =
      typeof service.montantMax === 'number' && service.montantMax > 0
        ? service.montantMax
        : fallback.max;

    if ((!service.montantMax || service.montantMax === 0) && service.plafonds?.length) {
      const plafondToUse = service.plafonds[params.selectedPlafondIndex] || service.plafonds[0];
      const parsed = parsePlafond(plafondToUse);
      if (parsed?.max) max = parsed.max;
    }

    return { amount: { min, max } };
  }, [params.service, params.selectedPlafondIndex]);

  // Calcul frais (pour usage UI), mais on n'affiche le résultat qu'après clic
  const feeResult = useMemo(() => {
    if (!params.service || !params.amount) return { label: '—', value: 0 };
    return computeFee(params.service as unknown as ServiceDTO, params.amount);
  }, [params.service, params.amount]);

  const fees = Math.round(feeResult.value ?? 0);
  const total = Math.round((params.amount ?? 0) + fees);

  const canShowResult = !!params.institution && !!params.service && params.amount > 0;

  const showResult = canShowResult && hasCalculated;

  const addToHistory = () => {
    if (!canShowResult) return;

    const inst = params.institution;
    const srv = params.service;

    if (!inst || !srv) return;

    const amount = params.amount ?? 0;
    const key = `${inst.id}-${srv.id}-${amount}-${fees}-${total}`;

    const time = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: RecentSim = {
      key,
      institution: inst.name,
      service: srv.name,
      amount,
      fees,
      total,
      time,
    };

    setRecent(prev => {
      const withoutDup = prev.filter(x => x.key !== newItem.key);
      return [newItem, ...withoutDup].slice(0, MAX_SERVICE_RECENT);
    });
  };

  const onCompare = () => {};

  const handleCalculate = () => {
    if (!canShowResult) return;

    // (optionnel) recadre l'amount dans les limites
    const validated = validateValue(
      params.amount,
      currentLimits.amount.min,
      currentLimits.amount.max
    );
    if (validated !== params.amount) updateParam('amount', validated);

    setHasCalculated(true);
    addToHistory();

    const el = document.getElementById('sim-result');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className='min-h-screen bg-slate-50 mt-30'>
      <header className='bg-white border-b border-slate-200'>
        <div className='mx-auto max-w-7xl px-4 pt-3 pb-3'>
          <button
            type='button'
            onClick={() => router.back()}
            className='inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900'
          >
            <ArrowLeft className='h-4 w-4' />
            Retour
          </button>

          <div className='mt-3 flex items-center gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400 text-white'>
              <Calculator className='h-5 w-5' />
            </div>

            <div className='min-w-0'>
              <div className='text-xl tracking-tight text-slate-900'>Simulateur de services</div>
              <p className='text-grey-700 text-sm'>Calculez vos frais instantanément</p>
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-4 py-6 bg-[#F8F9FA]'>
        <div className='grid items-start gap-6 lg:grid-cols-[420px_1fr]'>
          {/* Colonne gauche */}
          <div className='rounded-xl border border-slate-200 bg-white p-4 px-6 shadow-sm'>
            {isLoading && institutions.length === 0 ? (
              <div className='text-center'>
                <div className='mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-sky-500' />
                <p className='text-sm text-slate-600'>Chargement des institutions...</p>
              </div>
            ) : (
              (() => {
                const institutionsCount = institutions.length;
                const servicesCount = params.institution ? availableServices.length : 0;

                const canCalculate = !!params.institution && !!params.service && params.amount > 0;

                const onAmountChange = (raw: string) => {
                  const n = Number(raw.replace(/\s/g, ''));
                  if (Number.isNaN(n)) {
                    updateParam('amount', 0);
                    return;
                  }
                  const validated = validateValue(
                    n,
                    currentLimits.amount.min,
                    currentLimits.amount.max
                  );
                  updateParam('amount', validated);
                };

                return (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Building2 className='text-primary-400 h-4 w-4' />
                      <span className='text-lg text-grey-900'>Configuration</span>
                    </div>

                    {/* 1. Institution */}
                    <div className='space-y-3'>
                      <div className='text-sm text-grey-900'>1. Institution financière</div>

                      <Select
                        value={params.institution?.id ?? ''}
                        onValueChange={id => {
                          const opt = institutionOptions.find(o => o.id === id);
                          if (!opt) return;

                          updateParam('institution', opt.value);
                          updateParam('service', null);
                        }}
                      >
                        <SelectTrigger className='h-14 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:!border-primary-400 focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!ring-offset-0 data-[state=open]:!border-primary-400 data-[state=open]:!ring-0'>
                          <div className='flex w-full min-w-0 items-center gap-3'>
                            <div className='shrink-0 text-primary-400'>
                              <Smartphone className='h-5 w-5' />
                            </div>

                            {params.institution ? (
                              <span className='min-w-0 flex-1 truncate text-left'>
                                {params.institution.name}
                              </span>
                            ) : (
                              <span className='min-w-0 flex-1 truncate text-left text-slate-500'>
                                Sélectionner une institution
                              </span>
                            )}
                          </div>
                        </SelectTrigger>

                        <SelectContent className='max-h-72 rounded-lg border border-slate-200 bg-tertiary-50'>
                          {institutionOptions.map(opt => (
                            <SelectItem
                              key={opt.id}
                              value={opt.id}
                              textValue={opt.name}
                              className='group relative pl-3 pr-8 focus:bg-primary-100 text-gray-900'
                            >
                              <div className='flex items-center gap-3'>
                                <div className='flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden'>
                                  {isHttpUrl(opt.icon) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={opt.icon}
                                      alt={opt.name}
                                      className='h-full w-full object-contain p-1'
                                    />
                                  ) : (
                                    <span className='text-lg'>{opt.icon ?? '🏦'}</span>
                                  )}
                                </div>

                                <div className='min-w-0'>
                                  <div className='truncate font-medium text-slate-900'>
                                    {opt.name}
                                  </div>
                                  <div className='truncate text-xs text-slate-500'>
                                    {opt.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className='text-xs text-slate-500'>
                        {institutionsCount} institution{institutionsCount > 1 ? 's' : ''} disponible
                        {institutionsCount > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* 2. Service */}
                    <div className='space-y-3'>
                      <div className='text-sm text-grey-900'>2. Service</div>

                      <Select
                        value={params.service?.id ?? ''}
                        onValueChange={id => {
                          const opt = serviceOptions.find(o => o.id === id);
                          if (!opt) return;

                          updateParam('service', opt.value);
                        }}
                        disabled={!params.institution}
                      >
                        <SelectTrigger className='h-14 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:!border-primary-400 focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!ring-offset-0 data-[state=open]:!border-primary-400 data-[state=open]:!ring-0'>
                          <div className='flex items-center gap-3 w-full'>
                            {params.service ? (
                              <span className='truncate text-left'>{params.service.name}</span>
                            ) : (
                              <span className='text-slate-500 text-left'>
                                {params.institution
                                  ? 'Choisir un service'
                                  : "Sélectionnez d'abord une institution"}
                              </span>
                            )}
                          </div>
                        </SelectTrigger>

                        <SelectContent className='rounded-lg bg-tertiary-50 border border-slate-200'>
                          {serviceOptions.map(opt => (
                            <SelectItem
                              key={opt.id}
                              value={opt.id}
                              className='group relative pl-3 pr-8 focus:bg-primary-100 text-gray-900'
                            >
                              <span className='font-medium'>{opt.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className='text-xs text-slate-500'>
                        {params.institution
                          ? `${servicesCount} service${servicesCount > 1 ? 's' : ''} disponible${servicesCount > 1 ? 's' : ''}`
                          : 'Aucune institution sélectionnée'}
                      </div>
                    </div>

                    {/* 3. Montant */}
                    <div className='space-y-3'>
                      <div className='text-sm text-grey-900'>3. Montant (FCFA)</div>

                      <Input
                        value={params.amount ? String(params.amount) : ''}
                        onChange={e => onAmountChange(e.target.value)}
                        inputMode='numeric'
                        placeholder='0 FCFA'
                        disabled={!params.service}
                        className='h-10 rounded-lg border-0 bg-tertiary-50 px-6 text-sm text-slate-900 placeholder:text-grey-400 focus-visible:ring-sky-200'
                      />
                    </div>

                    {/* Boutons */}
                    <div className='mt-8 grid gap-2'>
                      <button
                        type='button'
                        onClick={handleCalculate}
                        disabled={!canCalculate}
                        className='inline-flex py-1 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-primary-400 to-primary-300 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-primary-50 disabled:text-tertiary-300'
                      >
                        <Calculator className='h-3 w-3' />
                        Calculer
                      </button>

                      <button
                        type='button'
                        onClick={() => {
                          resetSimulation();
                          setHasCalculated(false);
                        }}
                        className='inline-flex h-8 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700'
                      >
                        Réinitialiser
                      </button>
                    </div>

                    <Separator className='my-1 h-[0.5px] bg-gray-200 mb-3' />

                    <div className='flex gap-2 rounded-xl bg-sky-50 p-2'>
                      <div className='mt-1 text-sky-600'>
                        <Info className='h-4 w-4' />
                      </div>
                      <p className='text-sm leading-relaxed text-sky-900'>
                        Les frais affichés sont indicatifs et peuvent varier selon les conditions de
                        l&apos;institution.
                      </p>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Colonne droite */}
          <div className='space-y-6'>
            <div
              className='rounded-xl border border-sky-200 bg-gradient-to-b from-[#F0FAFE] to-white p-6 shadow-sm'
              id='sim-result'
            >
              <div className='flex items-center gap-2 text-slate-700'>
                <Check className='h-5 w-5 text-emerald-500' />
                <div className='text-lg text-grey-900'>Résultat de la simulation</div>
              </div>

              <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                <div className='rounded-xl border border-slate-200 bg-white p-4'>
                  <div className='flex items-center gap-2 text-xs text-grey-700'>
                    <Building2 className='h-4 w-4' />
                    Institution
                  </div>
                  <div className='mt-1 text-sm font-medium text-grey-900'>
                    {showResult ? params.institution?.name : '—'}
                  </div>
                </div>

                <div className='rounded-xl border border-slate-200 bg-white p-4'>
                  <div className='flex items-center gap-2 text-xs text-grey-700'>
                    <Calculator className='h-4 w-4' />
                    Service
                  </div>
                  <div className='mt-1 text-sm font-medium text-grey-900'>
                    {showResult ? params.service?.name : '—'}
                  </div>
                </div>
              </div>

              <div className='mt-6 rounded-xl border border-slate-200 bg-white p-6'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-grey-700'>Montant</span>
                  <span className='text-grey-900 font-semibold'>
                    {showResult ? formatCurrencyUI(params.amount) : '—'}
                  </span>
                </div>

                <div className='mt-4 flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <span className='text-grey-700 shrink-0'>Frais de service</span>
                    {showResult && feeResult.label && feeResult.label !== '—' ? (
                      <span className='text-primary-400 text-xs truncate min-w-0'>
                        ({feeResult.label})
                      </span>
                    ) : null}
                  </div>

                  <span className='text-grey-900 font-semibold'>
                    {showResult ? `+${formatCurrencyUI(fees)}` : '—'}
                  </span>
                </div>

                <div className='mt-4 border-t border-slate-200 pt-4'>
                  <div className='flex items-end justify-between'>
                    <span className='font-semibold text-grey-900'>Total</span>
                    <span className='text-2xl font-bold tracking-tight text-slate-900'>
                      {showResult ? formatCurrencyUI(total) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                <button
                  type='button'
                  onClick={onCompare}
                  disabled={!showResult}
                  className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-primary-400 to-primary-300 px-4 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-tertiary-300 '
                >
                  <BarChart3 className='h-3 w-3 ' />
                  Comparer toutes les options
                </button>

                <button
                  type='button'
                  onClick={() => {
                    resetSimulation();
                    setHasCalculated(false);
                  }}
                  className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-1 text-sm text-slate-700 hover:bg-slate-50'
                >
                  Nouvelle simulation
                </button>
              </div>
            </div>

            <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <History className='h-4 w-4 text-grey-600' />
                  <div className='text-sm font-medium text-grey-600'>Simulations récentes</div>
                </div>

                <button
                  type='button'
                  onClick={clearRecent}
                  className='text-xs text-slate-500 hover:text-slate-700'
                >
                  Vider
                </button>
              </div>

              <div className='mt-4 space-y-3'>
                {recent.length === 0 ? (
                  <div className='rounded-lg bg-slate-50 p-4 text-sm text-slate-500'>
                    Aucune simulation récente pour le moment.
                  </div>
                ) : (
                  recent.map(r => (
                    <div
                      key={r.key}
                      className='rounded-lg bg-slate-50 p-4 flex items-center justify-between'
                    >
                      <div>
                        <div className='text-sm text-slate-900'>
                          {r.institution} · {r.service}
                        </div>
                        <div className='text-xs text-slate-500'>{formatCurrencyUI(r.amount)}</div>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm text-slate-900'>{formatCurrencyUI(r.total)}</div>
                        <div className='text-xs text-slate-400'>{r.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
