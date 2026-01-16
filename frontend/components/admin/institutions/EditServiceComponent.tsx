'use client';

import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ArrowLeft, Plus, X, MoveRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Chip from '@/components/admin/institutions/Chip';
import NumericFormField from '@/components/admin/institutions/NumericFormField';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateService } from '@/hooks/service/useUpdateService';
import { apiClient } from '@/lib/api-client';
import { TypeService, type CreateServiceDto } from '@/types/Service';

/** -------------------------
 *  1) Schéma: reprends EXACTEMENT ton serviceSchema
 *  (je laisse ici une version identique à ta logique)
 *  ------------------------- */
enum Currency {
  XOF = 'XOF',
  XAF = 'XAF',
  EUR = 'EUR',
  USD = 'USD',
}

const serviceSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Le champ nom service est obligatoire *')
      .refine(val => val.trim().length >= 2, {
        message: 'Le nom doit contenir au moins 2 caractères (hors espaces) *',
      }),
    longName: z
      .string()
      .min(1, 'Le champ description est obligatoire *')
      .refine(val => val.trim().length >= 2, {
        message: 'La description doit contenir au moins 2 caractères (hors espaces) *',
      }),
    type: z.enum(
      [
        TypeService.PAIEMENT_MARCHAND,
        TypeService.ACHAT_CREDIT,
        TypeService.PAIEMENT_FACTURES,
        TypeService.DEPOT_SIMPLE,
        TypeService.DEPOT_RETRAIT_SIMPLE,
        TypeService.RETRAIT_SIMPLE,
        TypeService.TRANSFERT_ARGENT,
        TypeService.BANQUE_WALLET,
        TypeService.WALLET_BANQUE,
        TypeService.EPARGNE,
        TypeService.CREDIT,
        TypeService.ASSURANCE,
        TypeService.AUTRES,
      ],
      { message: '* Veuillez sélectionner un type de service' }
    ),
    // ✅ CHANGEMENT : Accepter 0 ou valeurs positives
    montantMin: z.number().nonnegative('Doit être ≥ 0').optional(),
    montantMax: z.number().nonnegative('Doit être ≥ 0').optional(),

    feeTypeUI: z.enum(['FREE', 'FIX', 'MIXTE', 'POURCENTAGE', 'CHANGE'], {
      message: '* Veuillez sélectionner un type de frais',
    }),

    frais: z.object({
      // ✅ CHANGEMENT : Accepter 0 ou valeurs positives pour les frais aussi
      montantFixe: z.number().nonnegative('Doit être ≥ 0').optional(),
      pourcentage: z.number().nonnegative('Doit être ≥ 0').max(100, 'Doit être ≤ 100').optional(),
      minimum: z.number().nonnegative('Doit être ≥ 0').optional(),
      maximum: z.number().nonnegative('Doit être ≥ 0').optional(),
      fraisChange: z
        .object({
          fxSurcharge: z.number().nonnegative('Doit être ≥ 0'),
          devise: z.enum([Currency.XOF, Currency.XAF, Currency.EUR, Currency.USD]),
        })
        .optional(),
    }),

    conditionAccess: z.array(z.string()),
    plafonds: z.array(z.string()),
    infrastructureAccess: z.array(z.string()),
  })
  .refine(v => v.montantMin == null || v.montantMax == null || v.montantMin <= v.montantMax, {
    message: 'montantMin doit être ≤ montantMax',
    path: ['montantMax'],
  })
  .superRefine((v, ctx) => {
    if (v.feeTypeUI === 'FREE') {
      const anyFee =
        v.frais.montantFixe != null ||
        v.frais.pourcentage != null ||
        v.frais.minimum != null ||
        v.frais.maximum != null ||
        v.frais.fraisChange != null;

      if (anyFee) {
        ctx.addIssue({
          code: 'custom',
          message: "Le service est gratuit : n'indiquez aucun frais.",
          path: ['frais'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'FIX') {
      if (v.frais.montantFixe == null || Number.isNaN(v.frais.montantFixe)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ montant fixe est obligatoire *',
          path: ['frais', 'montantFixe'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'MIXTE') {
      if (v.frais.montantFixe == null || Number.isNaN(v.frais.montantFixe)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ montant fixe est obligatoire *',
          path: ['frais', 'montantFixe'],
        });
      }
      if (v.frais.pourcentage == null || Number.isNaN(v.frais.pourcentage)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ pourcentage est obligatoire *',
          path: ['frais', 'pourcentage'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'POURCENTAGE') {
      if (v.frais.pourcentage == null || Number.isNaN(v.frais.pourcentage)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ pourcentage est obligatoire *',
          path: ['frais', 'pourcentage'],
        });
      }
      if (
        v.frais.minimum != null &&
        v.frais.maximum != null &&
        !Number.isNaN(v.frais.minimum) &&
        !Number.isNaN(v.frais.maximum) &&
        v.frais.minimum > v.frais.maximum
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'minimum doit être ≤ maximum',
          path: ['frais', 'maximum'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'CHANGE') {
      if (!v.frais.fraisChange) {
        ctx.addIssue({
          code: 'custom',
          message: 'Les frais de change sont obligatoires *',
          path: ['frais', 'fraisChange'],
        });
      } else {
        if (
          v.frais.fraisChange.fxSurcharge == null ||
          Number.isNaN(v.frais.fraisChange.fxSurcharge)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: 'Le champ montant devise est obligatoire *',
            path: ['frais', 'fraisChange', 'fxSurcharge'],
          });
        }
        if (!v.frais.fraisChange.devise) {
          ctx.addIssue({
            code: 'custom',
            message: 'La devise de référence est obligatoire *',
            path: ['frais', 'fraisChange', 'devise'],
          });
        }
      }
    }
  });

type ServiceFormData = z.infer<typeof serviceSchema>;

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const TagInputField = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
}: {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const next = input.trim();
    if (!next) return;
    if (!value.includes(next)) onChange([...value, next]);
    setInput('');
  };

  const handleRemoveByValue = (val: string) => {
    if (!disabled) onChange(value.filter(v => v !== val));
  };

  return (
    <>
      <FormLabel className='text-sm font-normal'>{label}</FormLabel>
      <div className='flex gap-2'>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          className={cx(
            'bg-[#F8F9FA] shadow-none transition-all',
            'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
            error ? 'border-red-500 focus:ring-red-500' : 'border-transparent'
          )}
          disabled={disabled}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />

        <Button
          type='button'
          onClick={handleAdd}
          disabled={disabled || !input.trim()}
          className='bg-cyan-400 hover:bg-cyan-500'
        >
          <Plus className='w-4 h-4' />
        </Button>
      </div>

      {value.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {value.map(item => (
            <Chip
              key={item}
              variant='secondary'
              onClick={() => handleRemoveByValue(item)}
              className='bg-gray-200 px-3 py-1'
              ariaLabel={`Supprimer ${item}`}
            >
              {item}
              <X className='w-3 h-3 ml-1' />
            </Chip>
          ))}
        </div>
      )}

      <FormMessage className='text-xs text-red-600 min-h-[16px]' />
    </>
  );
};

const FeeOption = ({
  id,
  value,
  title,
  description,
}: {
  id: string;
  value: 'FREE' | 'FIX' | 'MIXTE' | 'POURCENTAGE' | 'CHANGE';
  title: string;
  description?: string;
}) => (
  <div className='flex items-center  gap-2 rounded-lg border-1 border-gray-300 p-2 hover:bg-gray-50 cursor-pointer'>
    <RadioGroupItem
      id={id}
      value={value}
      className='
    h-2 w-2 rounded-full border-0
    text-primary-300
    data-[state=checked]:bg-primary-300
    data-[state=checked]:border-primary-300
    data-[state=checked]:text-primary-300
    data-[state=checked]:[&>span]:bg-primary-300 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2
  '
    />
    <Label htmlFor={id} className='cursor-pointer flex-1'>
      <div className='flex items-center gap-2 flex-wrap'>
        <span className='font-normal'>{title}</span>
        {description && (
          <>
            <MoveRight className='h-3 w-6 opacity-60' aria-hidden />
            <span className='font-normal text-gray-500'>{description}</span>
          </>
        )}
      </div>
    </Label>
  </div>
);
/** -------------------------
 *  3) Utils: pré-remplissage
 *  ------------------------- */
function inferFeeTypeUI(frais: any): ServiceFormData['feeTypeUI'] {
  if (!frais) return 'FREE';
  if (frais.fraisChange) return 'CHANGE';
  const hasFix = frais.montantFixe != null;
  const hasPct = frais.pourcentage != null;
  const hasMinMax = frais.minimum != null || frais.maximum != null;

  if (hasFix && hasPct) return 'MIXTE';
  if (hasFix) return 'FIX';
  if (hasPct || hasMinMax) return 'POURCENTAGE';
  return 'FREE';
}

const TYPE_MAP: Record<string, TypeService> = {
  PAIEMENT_MARCHAND: TypeService.PAIEMENT_MARCHAND,
  ACHAT_CREDIT: TypeService.ACHAT_CREDIT,
  PAIEMENT_FACTURES: TypeService.PAIEMENT_FACTURES,
  DEPOT_SIMPLE: TypeService.DEPOT_SIMPLE,
  DEPOT_RETRAIT_SIMPLE: TypeService.DEPOT_RETRAIT_SIMPLE,
  RETRAIT_SIMPLE: TypeService.RETRAIT_SIMPLE,
  TRANSFERT_ARGENT: TypeService.TRANSFERT_ARGENT,
  BANQUE_WALLET: TypeService.BANQUE_WALLET,
  WALLET_BANQUE: TypeService.WALLET_BANQUE,
  EPARGNE: TypeService.EPARGNE,
  CREDIT: TypeService.CREDIT,
  ASSURANCE: TypeService.ASSURANCE,
  AUTRES: TypeService.AUTRES,
};

const normalizeTypeService = (t: unknown): TypeService => {
  if (typeof t !== 'string') return TypeService.AUTRES;

  // si l'API renvoie déjà le label (exact)
  if (Object.values(TypeService).includes(t as TypeService)) {
    return t as TypeService;
  }

  // si l'API renvoie un code
  const key = t.trim().toUpperCase();
  return TYPE_MAP[key] ?? TypeService.AUTRES;
};

function toFormDefaults(service: any): ServiceFormData {
  return {
    name: service.name ?? '',
    longName: service.longName ?? '',
    type: normalizeTypeService(service.type),
    montantMin:
      service.montantMin != null && service.montantMin !== 0 ? service.montantMin : undefined,
    montantMax:
      service.montantMax != null && service.montantMax !== 0 ? service.montantMax : undefined,
    feeTypeUI: inferFeeTypeUI(service.frais),
    frais: {
      montantFixe:
        service.frais?.montantFixe != null && service.frais.montantFixe !== 0
          ? service.frais.montantFixe
          : undefined,
      pourcentage:
        service.frais?.pourcentage != null && service.frais.pourcentage !== 0
          ? service.frais.pourcentage * 100
          : undefined,
      minimum:
        service.frais?.minimum != null && service.frais.minimum !== 0
          ? service.frais.minimum
          : undefined,
      maximum:
        service.frais?.maximum != null && service.frais.maximum !== 0
          ? service.frais.maximum
          : undefined,
      fraisChange: service.frais?.fraisChange
        ? {
            fxSurcharge: service.frais.fraisChange.fxSurcharge,
            devise: service.frais.fraisChange.devise,
          }
        : undefined,
    },
    conditionAccess: service.conditionAccess ?? [],
    plafonds: service.plafonds ?? [],
    infrastructureAccess: service.infrastructureAccess ?? [],
  };
}

type EditServiceComponentProps = {
  institutionId: string;
  serviceId: string;
};

export default function EditServiceComponent({
  institutionId,
  serviceId,
}: EditServiceComponentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // ✅ 1) Charger l'institution pour récupérer le service à éditer
  const institutionQuery = useQuery({
    queryKey: ['institution', institutionId],
    queryFn: async () => {
      const token = await getToken();
      return apiClient<{ success: boolean; data: any }>(
        `institutions/${institutionId}`,
        'GET',
        token,
        undefined
      );
    },
  });

  const service = useMemo(() => {
    const inst = institutionQuery.data?.data;
    return inst?.services?.find((s: any) => s.id === serviceId);
  }, [institutionQuery.data, serviceId]);

  // ✅ 2) Hook update
  const { updateService, isUpdating } = useUpdateService({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution', institutionId] });
      router.push(`/institutions/${institutionId}`);
    },
  });

  // ✅ 3) Form
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      longName: '',
      type: undefined as any,
      montantMin: undefined,
      montantMax: undefined,
      feeTypeUI: 'FREE',
      frais: {
        montantFixe: undefined,
        pourcentage: undefined,
        minimum: undefined,
        maximum: undefined,
        fraisChange: undefined,
      },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    },
    mode: 'onChange',
  });

  // ✅ 4) Pré-remplissage une seule fois
  const [didPrefill, setDidPrefill] = useState(false);
  useEffect(() => {
    if (!service || didPrefill) return;
    form.reset(toFormDefaults(service));
    setDidPrefill(true);
  }, [service, didPrefill, form]);

  // ✅ 5) Nettoyage des champs frais quand feeType change (même logique que ton create)
  const feeTypeUI = form.watch('feeTypeUI');
  useEffect(() => {
    switch (feeTypeUI) {
      case 'FREE':
        form.setValue('frais.montantFixe', undefined);
        form.setValue('frais.pourcentage', undefined);
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        form.setValue('frais.fraisChange', undefined);
        break;
      case 'FIX':
        form.setValue('frais.pourcentage', undefined);
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        form.setValue('frais.fraisChange', undefined);
        break;
      case 'MIXTE':
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        form.setValue('frais.fraisChange', undefined);
        break;
      case 'POURCENTAGE':
        form.setValue('frais.montantFixe', undefined);
        form.setValue('frais.fraisChange', undefined);
        break;
      case 'CHANGE':
        form.setValue('frais.montantFixe', undefined);
        form.setValue('frais.pourcentage', undefined);
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        break;
    }
  }, [feeTypeUI, form]);

  const baseFieldClass =
    'bg-[#F8F9FA] shadow-none transition-all ' +
    'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ' +
    'focus-visible:ring-2 focus-visible:ring-cyan-500';

  const fieldClass = (hasError?: boolean) =>
    cx(
      baseFieldClass,
      hasError
        ? 'border-red-500 focus:ring-red-500 focus-visible:ring-red-500'
        : 'border-transparent'
    );

  const onSubmit = (data: ServiceFormData) => {
    const { feeTypeUI: _ui, ...rest } = data;
    const serviceData: CreateServiceDto = { ...rest };

    updateService({
      institutionId,
      serviceId,
      serviceData,
    });
  };

  if (institutionQuery.isLoading) {
    return <div className='p-6'>Chargement du service…</div>;
  }

  if (institutionQuery.isError || !service) {
    return (
      <div className='p-6'>
        <div className='mb-3 text-red-600'>Impossible de charger le service.</div>
        <Link className='text-cyan-700 underline' href={`/institutions/${institutionId}`}>
          Retour à l’institution
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className='mb-4'>
        <Link
          href={`/institutions/${institutionId}`}
          className='flex items-center gap-2 text-gray-900'
        >
          <ArrowLeft className='w-5 h-5' /> <span>Retour</span>
        </Link>
      </div>

      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Modifier le service</h1>
        <span className='text-gray-500 font-light text-sm'>
          Mettez à jour les informations du service
        </span>
      </div>

      <div className='bg-white shadow-md rounded-2xl p-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className='font-normal'>Nom du service *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Transfert'
                        className={fieldClass(!!fieldState.error)}
                        {...field}
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className='font-normal'>Type de service *</FormLabel>
                    <Select
                      key={field.value} // ← Force le re-render quand la valeur change
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      disabled={isUpdating}
                    >
                      <FormControl>
                        <SelectTrigger className={fieldClass(!!fieldState.error)}>
                          <SelectValue placeholder='Sélectionner un type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                        {Object.entries(TypeService).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='longName'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className='font-normal'>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Transfert d'argent"
                      className={cx(fieldClass(!!fieldState.error), 'min-h-15')}
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <NumericFormField
                control={form.control}
                name={'montantMin'}
                label='Montant minimum (FCFA)'
                disabled={isUpdating}
              />
              <NumericFormField
                control={form.control}
                name={'montantMax'}
                label='Montant maximum (FCFA)'
                disabled={isUpdating}
              />
            </div>

            <FormField
              control={form.control}
              name='feeTypeUI'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-normal text-gray-900'>
                    Séléctionnez le type de frais *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ?? 'FREE'}
                      onValueChange={field.onChange}
                      className='space-y-3'
                    >
                      <FeeOption id='fee-free' value='FREE' title='Gratuit' />
                      <FeeOption
                        id='fee-fix'
                        value='FIX'
                        title='Frais fixe'
                        description='Montant constant en FCFA'
                      />
                      <FeeOption
                        id='fee-percent'
                        value='POURCENTAGE'
                        title='Frais en pourcentage'
                        description='Taux sur le montant'
                      />
                      <FeeOption
                        id='fee-mixte'
                        value='MIXTE'
                        title='Frais mixte (fixe + %)'
                        description='Combinaison des deux'
                      />
                      <FeeOption
                        id='fee-change'
                        value='CHANGE'
                        title='Frais selon devise / taux de change'
                        description='Montant ajusté selon la devise'
                      />
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                </FormItem>
              )}
            />

            {(feeTypeUI === 'FIX' || feeTypeUI === 'MIXTE') && (
              <NumericFormField
                control={form.control}
                name={'frais.montantFixe'}
                label='Montant fixe (FCFA)'
                requiredMark
                disabled={isUpdating}
              />
            )}

            {(feeTypeUI === 'MIXTE' || feeTypeUI === 'POURCENTAGE') && (
              <NumericFormField
                control={form.control}
                name={'frais.pourcentage'}
                label='Taux (%)'
                step='0.01'
                max={100}
                requiredMark
                disabled={isUpdating}
              />
            )}

            {feeTypeUI === 'POURCENTAGE' && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <NumericFormField
                  control={form.control}
                  name={'frais.minimum'}
                  label='Minimum (FCFA)'
                  disabled={isUpdating}
                />
                <NumericFormField
                  control={form.control}
                  name={'frais.maximum'}
                  label='Maximum (FCFA)'
                  disabled={isUpdating}
                />
              </div>
            )}

            {feeTypeUI === 'CHANGE' && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <NumericFormField
                  control={form.control}
                  name={'frais.fraisChange.fxSurcharge'}
                  label='Montant en devise'
                  step='0.01'
                  requiredMark
                  disabled={isUpdating}
                />

                <FormField
                  control={form.control}
                  name='frais.fraisChange.devise'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal'>Devise de référence *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isUpdating}
                      >
                        <FormControl>
                          <SelectTrigger className={fieldClass(!!fieldState.error)}>
                            <SelectValue placeholder='Sélectionnez une devise' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                          {Object.values(Currency).map(v => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name='conditionAccess'
              render={({ field }) => (
                <FormItem>
                  <TagInputField
                    label="Conditions d'accès"
                    placeholder='Ajouter une condition'
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={isUpdating}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='plafonds'
              render={({ field }) => (
                <FormItem>
                  <TagInputField
                    label='Plafonds'
                    placeholder='Ex: 500 000 FCFA/jour'
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={isUpdating}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='infrastructureAccess'
              render={({ field }) => (
                <FormItem>
                  <TagInputField
                    label="Infrastructure d'accès"
                    placeholder='Ex: Agence, GAB, Mobile'
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={isUpdating}
                  />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={isUpdating}
                className='w-full'
              >
                Annuler
              </Button>

              <Button
                type='submit'
                disabled={isUpdating || !form.formState.isValid}
                className='w-full bg-primary-300 text-white hover:bg-primary-300'
              >
                <Check className='mr-2 h-4 w-4' />
                {isUpdating ? 'Modification…' : 'Modifier le service'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
