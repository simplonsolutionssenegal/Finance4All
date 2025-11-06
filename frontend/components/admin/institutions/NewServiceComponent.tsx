'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  FileText,
  MoveRight,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
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
import { useCreateService } from '@/hooks/service/useCreateService';
import { TypeService, type CreateServiceDto } from '@/types/Service';

enum Currency {
  AUD = 'AUD',
  CAD = 'CAD',
  CHF = 'CHF',
  DKK = 'DKK',
  GBP = 'GBP',
  JPY = 'JPY',
  NOK = 'NOK',
  SEK = 'SEK',
  USD = 'USD',
  ZAR = 'ZAR',
  SAR = 'SAR',
  ARS = 'ARS',
  BRL = 'BRL',
  BGN = 'BGN',
  XAF = 'XAF',
  XOF = 'XOF',
  CLP = 'CLP',
  CNY = 'CNY',
  COP = 'COP',
  KRW = 'KRW',
  CRC = 'CRCAED ',
  AEDHKD = 'HKDHUF ',
  HUFINR = 'INR',
  IDR = 'IDR',
  ISK = 'ISK',
  ILS = 'ILS',
  JOD = 'JOD',
  KES = 'KES',
  LBP = 'LBP',
  MYR = 'MYR',
  MAD = 'MAD',
  MUR = 'MUR',
  MXN = 'MXN',
  NZD = 'NZD',
  OMR = 'OMR',
  PEN = 'PEN',
  PHP = 'PHP',
  PLN = 'PLN',
  QAR = 'QAR',
  DOP = 'DOP',
  CZK = 'CZK',
  RON = 'RON',
  RUB = 'RUB',
  RSD = 'RSD',
  SGD = 'SGD',
  LKR = 'LKR',
  TWD = 'TWD',
  THB = 'THB',
  TRY = 'TRY',
  VND = 'VND',
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
    montantMin: z.number().positive('Doit être ≥ 0').optional(),
    montantMax: z.number().positive('Doit être ≥ 0').optional(),

    feeTypeUI: z.enum(['FREE', 'FIX', 'MIXTE', 'POURCENTAGE', 'CHANGE'], {
      message: '* Veuillez sélectionner un type de frais',
    }),

    frais: z.object({
      montantFixe: z.number().positive('Doit être ≥ 0').optional(),
      pourcentage: z.number().positive('Doit être ≥ 0').max(100, 'Doit être ≤ 100').optional(),
      minimum: z.number().positive('Doit être ≥ 0').optional(),
      maximum: z.number().positive('Doit être ≥ 0').optional(),
      fraisChange: z.number().positive('Doit être ≥ 0').optional(),
      devise: z
        .enum(
          [
            Currency.AUD,
            Currency.CAD,
            Currency.CHF,
            Currency.DKK,
            Currency.GBP,
            Currency.JPY,
            Currency.NOK,
            Currency.SEK,
            Currency.USD,
            Currency.ZAR,
            Currency.SAR,
            Currency.ARS,
            Currency.BRL,
            Currency.BGN,
            Currency.XAF,
            Currency.XOF,
            Currency.CLP,
            Currency.CNY,
            Currency.COP,
            Currency.KRW,
            Currency.CRC,
            Currency.IDR,
            Currency.ISK,
            Currency.ILS,
            Currency.JOD,
            Currency.KES,
            Currency.LBP,
            Currency.MYR,
            Currency.MAD,
            Currency.MUR,
            Currency.MXN,
            Currency.NZD,
            Currency.OMR,
            Currency.PEN,
            Currency.PHP,
            Currency.PLN,
            Currency.QAR,
            Currency.DOP,
            Currency.CZK,
            Currency.RON,
            Currency.RUB,
            Currency.RSD,
            Currency.SGD,
            Currency.LKR,
            Currency.TWD,
            Currency.THB,
            Currency.TRY,
            Currency.VND,
          ],
          { message: 'Choisissez une devise' }
        )
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
        v.frais.fraisChange != null ||
        v.frais.devise != null;

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
    }

    if (v.feeTypeUI === 'CHANGE') {
      if (v.frais.fraisChange == null || Number.isNaN(v.frais.fraisChange)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ montant devise est obligatoire *',
          path: ['frais', 'fraisChange'],
        });
      }
      if (v.frais.devise == null) {
        ctx.addIssue({
          code: 'custom',
          message: 'La devise de référence est obligatoire *',
          path: ['frais', 'devise'],
        });
      }
    }
  });

type ServiceFormData = z.infer<typeof serviceSchema>;

type TagInputFieldProps = {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
};

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

type NewServiceComponentProps = { institutionId: string };

const TagInputField = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
}: TagInputFieldProps) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const next = input.trim();
    if (!next) return;
    if (!value.includes(next)) {
      onChange([...value, next]);
    }
    setInput('');
  };

  const handleRemoveByValue = (val: string) => {
    if (!disabled) onChange(value.filter(v => v !== val));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <>
      <FormLabel className='text-sm font-normal '>{label}</FormLabel>
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
          onKeyDown={handleKeyDown}
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

const NewServiceComponent = ({ institutionId }: NewServiceComponentProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const { createService, isCreating } = useCreateService({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution', institutionId] });
      router.push(`/institutions/${institutionId}`);
    },
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      longName: '',
      type: undefined,
      montantMin: undefined,
      montantMax: undefined,
      feeTypeUI: 'FREE',
      frais: {
        montantFixe: undefined,
        pourcentage: undefined,
        minimum: undefined,
        maximum: undefined,
        fraisChange: undefined,
        devise: undefined,
      },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    },
    mode: 'onChange',
  });

  const validateStep1 = useCallback(() => {
    const { name, longName, type } = form.getValues();
    return name.length >= 2 && longName.length >= 2 && !!type;
  }, [form]);

  const watchStep1Fields = form.watch(['name', 'longName', 'type']);
  useEffect(() => {
    setIsStep1Valid(validateStep1());
  }, [watchStep1Fields, validateStep1]);

  const feeTypeUI = form.watch('feeTypeUI');

  useEffect(() => {
    switch (feeTypeUI) {
      case 'FREE':
        form.setValue('frais.montantFixe', undefined);
        form.setValue('frais.pourcentage', undefined);
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        form.setValue('frais.fraisChange', undefined);
        form.setValue('frais.devise', undefined);
        break;
      case 'FIX':
        form.setValue('frais.pourcentage', undefined);
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        form.setValue('frais.fraisChange', undefined);
        form.setValue('frais.devise', undefined);
        break;
      case 'MIXTE':
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        form.setValue('frais.fraisChange', undefined);
        form.setValue('frais.devise', undefined);
        break;
      case 'POURCENTAGE':
        form.setValue('frais.montantFixe', undefined);
        form.setValue('frais.fraisChange', undefined);
        form.setValue('frais.devise', undefined);
        break;
      case 'CHANGE':
        form.setValue('frais.montantFixe', undefined);
        form.setValue('frais.pourcentage', undefined);
        form.setValue('frais.minimum', undefined);
        form.setValue('frais.maximum', undefined);
        break;
      default:
        break;
    }
  }, [feeTypeUI, form]);

  const onSubmit = (data: ServiceFormData) => {
    const { feeTypeUI: _ui, ...rest } = data;
    const serviceData: CreateServiceDto = { ...rest };
    createService({ institutionId, serviceData });
  };

  const steps = [
    { label: 'Informations', baseIcon: FileText },
    { label: 'Frais', baseIcon: Coins },
  ];

  const getStepClassName = (n: number) => (n === step ? 'space-y-4' : 'hidden');

  return (
    <>
      <div className='mb-4'>
        <Link
          href={`/institutions/${institutionId}`}
          className='flex items-center gap-2 text-gray-900'
        >
          <ArrowLeft className='w-5 h-5 ' /> <span>Retour </span>
        </Link>
      </div>

      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-primary-300 p-2 rounded-2xl'>
          <Settings className='h-6 w-6 text-white' aria-hidden='true' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Nouveau service</h1>
          <span className='text-gray-500 font-light text-sm'>Créez un nouveau service</span>
        </div>
      </div>

      <div className='bg-white shadow-md rounded-2xl p-6'>
        <div className='grid grid-cols-2 gap-8 mb-4'>
          {steps.map((s, i) => {
            const active = i === step;
            const done = i < step;
            const IconToShow = done ? Check : s.baseIcon;
            return (
              <div key={s.label} className='flex flex-col items-center justify-center gap-2'>
                <div
                  className={cx(
                    'h-8 w-8 rounded-full flex items-center justify-center border transition-colors',
                    active && 'bg-primary-300 text-white border-primary-300',
                    done && 'bg-green-600 text-white border-green-600',
                    !active && !done && 'bg-[#F8F9FA] text-gray-700 border-[#F8F9FA]'
                  )}
                >
                  <IconToShow className='h-5 w-5' aria-hidden />
                </div>
                <span
                  className={cx(
                    'text-sm leading-tight text-center',
                    active ? 'text-gray-900' : 'text-gray-600'
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='rounded-2xl'>
            <div className={getStepClassName(0)}>
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
                          className={cx(
                            'bg-[#F8F9FA] shadow-none transition-all',
                            'focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-transparent',
                            fieldState.error
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-transparent'
                          )}
                          {...field}
                          disabled={isCreating}
                        />
                      </FormControl>
                      <div className='mt-1'>
                        <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                      </div>
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
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isCreating}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cx(
                              'bg-[#F8F9FA] data-[placeholder]:text-black/40 data-[placeholder]:font-normal shadow-none transition-all',
                              'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
                              'focus-visible:ring-2 focus-visible:ring-cyan-500',
                              fieldState.error
                                ? 'border-red-500 focus:ring-red-500 focus-visible:ring-red-500'
                                : 'border-transparent'
                            )}
                          >
                            <SelectValue placeholder='Sélectionner un type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                          {Object.entries(TypeService).map(([key, value]) => (
                            <SelectItem
                              key={key}
                              value={value}
                              className='group relative pl-3 pr-8 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200 text-gray-900'
                            >
                              <span className='block truncate pr-2'>{value}</span>
                              <Check className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 opacity-0 group-data-[state=checked]:opacity-100 pointer-events-none flex-shrink-0' />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className='mt-1'>
                        <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                      </div>
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
                        className={cx(
                          'bg-[#F8F9FA] min-h-15 shadow-none transition-all',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
                          fieldState.error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-transparent'
                        )}
                        {...field}
                        disabled={isCreating}
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
                  disabled={isCreating}
                />
                <NumericFormField
                  control={form.control}
                  name={'montantMax'}
                  label='Montant maximum (FCFA)'
                  disabled={isCreating}
                />
              </div>

              <Separator className='my-1 h-[0.5px] bg-gray-200' />

              <div className='pt-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.back()}
                    disabled={isCreating}
                    className='w-full h-6 rounded-lg bg-white border-[#EAEAEA] text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  >
                    Annuler
                  </Button>

                  <Button
                    type='button'
                    onClick={() => setStep(1)}
                    disabled={!isStep1Valid}
                    className='w-full h-6 rounded-lg bg-primary-300 text-white hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                  >
                    Continuer
                    <ArrowRight className='ml-2 h-4 w-4' aria-hidden='true' />
                  </Button>
                </div>
              </div>
            </div>

            {/* Étape 2 */}
            <div className={getStepClassName(1)}>
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
                          description='(Combinaison des deux)'
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
              {feeTypeUI !== 'FREE' && (
                <div className='space-y-4'>
                  <div
                    className={
                      feeTypeUI === 'POURCENTAGE'
                        ? 'grid grid-cols-3 gap-4'
                        : feeTypeUI === 'MIXTE'
                          ? 'grid grid-cols-2 gap-4'
                          : feeTypeUI === 'CHANGE'
                            ? 'grid grid-cols-1 gap-1'
                            : 'grid grid-cols-1 gap-4'
                    }
                  >
                    {(feeTypeUI === 'FIX' || feeTypeUI === 'MIXTE') && (
                      <NumericFormField
                        control={form.control}
                        name={'frais.montantFixe'}
                        label='Montant fixe (FCFA)'
                        requiredMark
                        disabled={isCreating}
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
                        disabled={isCreating}
                      />
                    )}

                    {feeTypeUI === 'POURCENTAGE' && (
                      <>
                        <NumericFormField
                          control={form.control}
                          name={'frais.minimum'}
                          label='Minimum (FCFA)'
                          requiredMark
                          disabled={isCreating}
                        />
                        <NumericFormField
                          control={form.control}
                          name={'frais.maximum'}
                          label='Maximum (FCFA)'
                          requiredMark
                          disabled={isCreating}
                        />
                      </>
                    )}

                    {feeTypeUI === 'CHANGE' && (
                      <>
                        <NumericFormField
                          control={form.control}
                          name={'frais.fraisChange'}
                          label='Montant en devise'
                          step='0.01'
                          requiredMark
                          disabled={isCreating}
                        />

                        <FormField
                          control={form.control}
                          name='frais.devise'
                          render={({ field, fieldState }) => (
                            <FormItem className='space-y-0.5'>
                              <FormLabel className='text-sm font-normal'>
                                Devise de référence *
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isCreating}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cx(
                                      'bg-[#F8F9FA] data-[placeholder]:text-black/40 data-[placeholder]:font-normal ring-0 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0',
                                      fieldState.error ? 'border-1 border-red-500' : 'border-0'
                                    )}
                                  >
                                    <SelectValue placeholder='Sélectionnez une devise' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                                  {Object.entries(Currency).map(([key, value]) => (
                                    <SelectItem
                                      key={key}
                                      value={value}
                                      className='group relative pl-3 pr-8 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200 text-gray-900'
                                    >
                                      <span className='block truncate pr-2'>{value}</span>
                                      <Check className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 opacity-0 group-data-[state=checked]:opacity-100 pointer-events-none flex-shrink-0' />
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name='conditionAccess'
                render={({ field }) => (
                  <FormItem className='text-sm font-normal '>
                    <TagInputField
                      label="Conditions d'accès"
                      placeholder='Ajouter une condition'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isCreating}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='plafonds'
                render={({ field }) => (
                  <FormItem className='text-sm font-normal'>
                    <TagInputField
                      label='Plafonds'
                      placeholder='Ex: 500 000 FCFA/jour'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isCreating}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='infrastructureAccess'
                render={({ field }) => (
                  <FormItem className='text-sm font-normal '>
                    <TagInputField
                      label="Infrastructure d'accès"
                      placeholder='Ex: Agence, GAB, Mobile'
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isCreating}
                    />
                  </FormItem>
                )}
              />
              <Separator className='my-1 h-[0.5px] bg-gray-200' />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-6'>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full h-6 rounded-lg bg-white border-[#EAEAEA] text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  onClick={() => setStep(0)}
                  disabled={isCreating}
                >
                  <ArrowLeft />
                  Précédent
                </Button>
                <Button
                  type='submit'
                  disabled={isCreating || !form.formState.isValid}
                  className='w-full h-6 rounded-lg bg-primary-300 text-white hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                >
                  <Check />
                  {isCreating ? 'Création…' : 'Créer le service'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default NewServiceComponent;
