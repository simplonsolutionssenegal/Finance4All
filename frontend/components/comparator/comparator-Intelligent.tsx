'use client';

import { Separator } from '@radix-ui/react-dropdown-menu';
import {
  ArrowRight,
  DollarSign,
  Funnel,
  TrendingDown,
  Zap,
  ArrowLeft,
  ChartColumn,
} from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useCompareServices } from '@/hooks/service/useCompareServices';
import { useGetServices } from '@/hooks/service/useGetServices';
import { type ServiceDTO, TypeService } from '@/types/Service';

import { ServiceList } from './ServiceList';

type ProductType = 'TRANSFERT' | 'CREDIT' | 'EPARGNE';

// Type for the fee calculation type
interface FraisWithTypeCalc {
  _typeCalculation?: number;
  typeCalculation?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
  montantFixe?: number;
}

// Constante pour formater la devise
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Constante pour calculer les frais
const computeFee = (service: ServiceDTO, montant: number): { label: string; value: number } => {
  const frais = service.frais as FraisWithTypeCalc | undefined;

  if (!frais) {
    return { label: 'Non défini', value: 0 };
  }

  const typeCalc = frais._typeCalculation ?? frais.typeCalculation ?? undefined;

  // 0 = FREE
  if (typeCalc === 0) {
    return { label: 'Gratuit !', value: 0 };
  }

  // 1 = POURCENTAGE
  if (typeCalc === 1) {
    const pourcentage = frais.pourcentage ?? 0;

    // On calcule d'abord la commission théorique
    let fee = montant * pourcentage;

    const min = typeof frais.minimum === 'number' ? frais.minimum : undefined;
    const max = typeof frais.maximum === 'number' ? frais.maximum : undefined;

    // On applique min / max seulement si un montant est saisi
    if (montant > 0) {
      if (min !== undefined) {
        fee = Math.max(fee, min);
      }
      if (max !== undefined) {
        fee = Math.min(fee, max);
      }
    } else {
      fee = 0;
    }

    // Construction du texte d'intervalle
    const intervalParts: string[] = [];
    if (min !== undefined) {
      intervalParts.push(`min ${formatCurrency(min)}`);
    }
    if (max !== undefined) {
      intervalParts.push(`max ${formatCurrency(max)}`);
    }

    const intervalText = intervalParts.length > 0 ? ` (${intervalParts.join(' · ')})` : '';

    return {
      label: `${pourcentage * 100}% du montant${intervalText}`,
      value: fee,
    };
  }

  // 2 = FIX (éventuellement + pourcentage)
  if (typeCalc === 2) {
    const montantFixe = frais.montantFixe ?? 0;
    const pourcentage = frais.pourcentage ?? 0;
    const fee = montantFixe + montant * pourcentage;

    return {
      label:
        pourcentage > 0
          ? `${formatCurrency(montantFixe)} + ${pourcentage * 100}%`
          : `${formatCurrency(montantFixe)} fixe`,
      value: fee,
    };
  }

  return { label: 'Non défini', value: 0 };
};

export default function ComparatorIntelligent() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productType, setProductType] = useState<ProductType>('TRANSFERT');
  const [isComparing, setIsComparing] = useState(false);

  // Récupération de la liste des services
  const {
    services: allServices,
    isLoading,
    isError,
    error,
  } = useGetServices({
    page: 1,
    limit: 50,
    type: selectedType || undefined,
  });

  // Récupération de la comparaison (uniquement si on compare)
  const {
    services: comparedServices,
    message: compareMessage,
    isLoading: isCompareLoading,
    isError: isCompareError,
    error: compareError,
  } = useCompareServices(isComparing ? selectedIds : []);

  // Liste des types de service pour le select
  const serviceTypes = useMemo(() => {
    return Object.values(TypeService) as string[];
  }, []);

  // Les services fournis par le backend sont déjà filtrés par `type`
  const filteredServices = useMemo(() => allServices, [allServices]);

  function toggleSelected(id: string) {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setIsComparing(false);
  }

  const canCompare = selectedIds.length >= 2;

  // Lignes de critères pour le tableau façon maquette
  const criteriaRows = [
    {
      key: 'fees',
      label: 'Frais de service',
      icon: <DollarSign className='h-3 w-3 text-primary-400' />,
      render: (s: ServiceDTO) => {
        const fee = computeFee(s, amount);
        const hasFees = fee.label !== 'Non défini';

        return (
          <div className='flex flex-col items-center text-center'>
            {/* Ligne du montant : seulement si on a un montant ET des frais réels */}
            {hasFees && amount > 0 && (
              <span className='text-sm text-slate-900'>
                {formatCurrency(Math.round(fee.value))}
              </span>
            )}

            {/* Si pas de frais → on affiche juste un tiret */}
            {!hasFees && <span className='text-sm text-slate-900'>—</span>}

            {/* Ligne de description des frais : uniquement si le service a des frais */}
            {hasFees && <span className='mt-0.5 text-[11px] text-emerald-600'>{fee.label}</span>}
          </div>
        );
      },
    },
    {
      key: 'delay',
      label: 'Délai',
      icon: <Zap className='h-3 w-3 text-primary-400' />,
      render: (_s: ServiceDTO) => <span className='text-sm text-slate-800'>Instantané</span>,
    },
    {
      key: 'limit',
      label: 'Limite de solde',
      icon: <span className='text-base'>💳</span>,
      render: (s: ServiceDTO) => {
        const max = s.montantMax;

        return (
          <span className='text-sm text-slate-800'>
            {typeof max === 'number' ? `${formatCurrency(max)}` : '—'}
          </span>
        );
      },
    },
    {
      key: 'cashback',
      label: 'Cashback',
      icon: <TrendingDown className='h-3 w-3 text-primary-400' />,
      render: (_s: ServiceDTO) => (
        <span className='text-sm text-slate-800'>
          {/* à remplacer quand tu as un champ cashback */}—
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Note',
      icon: <span className='text-base'>⭐</span>,
      render: (_s: ServiceDTO) => (
        <span className='flex items-center justify-center gap-1 text-sm text-slate-800'>
          {/* à remplacer par s.rating si tu as la note */}
          4.7 / 5
        </span>
      ),
    },
  ];

  return (
    <div className='min-h-screen bg-slate-50 py-10'>
      <main className='mx-auto flex max-w-6xl flex-col gap-6 px-4'>
        {/* HEADER */}
        <section className='rounded-3xl py-4'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs text-primary-400'>
            <Funnel className='h-4 w-4' />
            Outil d&apos;aide à la décision
          </div>

          <div>
            <h1 className='text-3xl text-slate-900'>Comparateur Intelligent</h1>

            <p className='mt-2 max-w-xl text-sm text-slate-500'>
              Comparez les produits financiers par critères clés : coût, rapidité,
              <br />
              couverture.
            </p>
          </div>
        </section>

        {/* FILTRES : Type de produit */}
        <section className='rounded-xl bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-sm text-slate-800'>Type de produit</h2>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            {/* Transferts & Mobile Money */}
            <button
              type='button'
              onClick={() => setProductType('TRANSFERT')}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                productType === 'TRANSFERT'
                  ? 'border border-sky-300 bg-primary-50 text-slate-800'
                  : 'border border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className='flex items-center gap-3'>
                <ArrowRight className='h-4 w-4' />
                <span>Transferts &amp; Mobile Money</span>
              </span>
            </button>

            {/* Crédit & Prêts */}
            <button
              type='button'
              onClick={() => setProductType('CREDIT')}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                productType === 'CREDIT'
                  ? 'border border-sky-300 bg-primary-50 text-slate-800'
                  : 'border border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className='flex items-center gap-3'>
                <DollarSign className='h-3 w-4' />
                <span>Crédit &amp; Prêts</span>
              </span>
            </button>

            {/* Épargne (désactivé / bientôt dispo) */}
            <button
              type='button'
              disabled
              className='flex flex-col items-start gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-left text-sm text-slate-400'
            >
              <span className='flex items-center gap-3'>
                <TrendingDown className='h-3 w-3' />
                <span>Épargne</span>
              </span>
              <span className='rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px]'>
                Bientôt disponible
              </span>
            </button>
          </div>
        </section>

        {/* FILTRES DÉTAILLÉS */}
        <section className='space-y-6 rounded-xl bg-white p-6 shadow-sm'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Type de service (Select Radix) */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500'>Type de service</label>
              <Select
                value={selectedType === '' ? 'ALL' : selectedType}
                onValueChange={value => {
                  if (value === 'ALL') {
                    setSelectedType('');
                  } else {
                    setSelectedType(value);
                  }
                  setIsComparing(false);
                }}
              >
                <SelectTrigger
                  size='default'
                  className='h-11 data-[size=default]:h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 text-sm text-slate-700 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-slate-200'
                >
                  <SelectValue placeholder='Tous les types' />
                </SelectTrigger>

                <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200 rounded-xl'>
                  <SelectItem value='ALL'>Tous les types</SelectItem>

                  {serviceTypes.map(type => (
                    <SelectItem
                      key={type}
                      value={type}
                      className='group relative pl-3 pr-8 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200 text-gray-900'
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pays (placeholder) */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500'>Pays</label>
              <Select>
                <SelectTrigger
                  size='default'
                  className='h-11 data-[size=default]:h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 text-sm text-slate-400 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-slate-200'
                >
                  <SelectValue placeholder='Tous les pays' />
                </SelectTrigger>
              </Select>
            </div>

            {/* Montant du transfert */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-slate-500'>Montant du transfert (F CFA)</label>
              <input
                type='number'
                value={amount}
                onChange={e => setAmount(Number(e.target.value) || 0)}
                className='h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none'
                placeholder='50000'
                min={0}
              />
            </div>
          </div>

          <Separator className='my-1 h-[0.5px] bg-gray-200' />

          {/* Résumé + bouton comparer */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs text-slate-400'>
              <Funnel className='h-4 w-4' />
              <span>
                {filteredServices.length} services disponibles • {selectedIds.length} sélectionné(s)
              </span>
            </div>
            <button
              type='button'
              disabled={!canCompare}
              onClick={() => setIsComparing(true)}
              className={[
                'inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs shadow-sm transition',
                !canCompare
                  ? 'bg-primary-200 text-white/70 cursor-not-allowed'
                  : 'bg-primary-200 text-white hover:bg-primary-500',
              ].join(' ')}
            >
              <span>
                Comparer{' '}
                {selectedIds.length > 0 ? `${selectedIds.length} services` : 'les services'}
              </span>
              <ArrowRight className='h-4 w-4' />
            </button>
          </div>
        </section>

        {/* === LISTE DES SERVICES === */}
        {!isComparing && (
          <section className='space-y-4'>
            <h2 className='text-lg  text-slate-900'>Sélectionnez les services à comparer</h2>

            <ServiceList
              services={filteredServices}
              selectedIds={selectedIds}
              amount={amount}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onToggleService={toggleSelected}
              computeFee={computeFee}
            />
          </section>
        )}

        {/* === RÉSULTAT DE COMPARAISON : TABLEAU TYPE MAQUETTE === */}
        {isComparing && (
          <>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl  text-slate-900'>Comparaison détaillée</h2>
                {compareMessage && <p className='mt-1 text-xs text-slate-500'>{compareMessage}</p>}
              </div>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setIsComparing(false)}
                  className='inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 hover:bg-slate-50'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>Modifier</span>
                </button>
                <button
                  type='button'
                  className='inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600'
                >
                  <ChartColumn className='h-4 w-4' />
                  Vue graphique
                </button>
              </div>
            </div>
            <section className='space-y-4 rounded-3xl bg-white p-2 shadow-sm'>
              {/* États chargement / erreur */}
              {isCompareLoading && (
                <p className='text-sm text-slate-500'>Chargement de la comparaison...</p>
              )}

              {isCompareError && (
                <p className='text-sm text-red-500'>
                  {compareError?.message ?? 'Impossible de charger la comparaison.'}
                </p>
              )}

              {/* Tableau */}
              {!isCompareLoading && !isCompareError && comparedServices.length >= 2 && (
                <div className='overflow-x-auto'>
                  <div className='min-w-[720px] '>
                    {/* Ligne d'en-tête : Critères + services */}
                    <div className='grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))]'>
                      {/* Colonne "Critères" */}
                      <div className='rounded-tl-3xl px-4 py-4 font-bold '>Critères</div>

                      {/* Colonnes services */}
                      {comparedServices.map(s => (
                        <div
                          key={s.id}
                          className='flex flex-col items-center justify-center border-slate-100 bg-white px-2 py-2 text-center'
                        >
                          <div className='mb-1 flex h-6 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-50'>
                            {s.institution.logoUrl ? (
                              <Image
                                src={s.institution.logoUrl}
                                alt={s.institution.name}
                                width={40}
                                height={24}
                                className='h-6 w-10 object-contain'
                              />
                            ) : (
                              <span className='text-xs  text-slate-700'>
                                {s.institution.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <p className='text-[11px] font-bold '>{s.institution.name}</p>
                        </div>
                      ))}
                    </div>

                    {/* Lignes de critères */}
                    {criteriaRows.map((row, rowIndex) => (
                      <div
                        key={row.key}
                        className={[
                          'grid grid-cols-[220px_repeat(auto-fit,minmax(180px,1fr))] border-t border-slate-100',
                          rowIndex === criteriaRows.length - 1 ? 'rounded-b-3xl' : '',
                        ].join(' ')}
                      >
                        {/* Cellule critère */}
                        <div className='flex items-center gap-3  px-2 py-1 text-xs text-slate-700'>
                          <span className='flex h-7 w-7 items-center justify-center rounded-full bg-white'>
                            {row.icon}
                          </span>
                          <span>{row.label}</span>
                        </div>

                        {comparedServices.map(s => (
                          <div
                            key={`${row.key}-${s.id}`}
                            className='flex items-center justify-center bg-white px-2 py-4 text-sm text-slate-800'
                          >
                            {row.render(s)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
