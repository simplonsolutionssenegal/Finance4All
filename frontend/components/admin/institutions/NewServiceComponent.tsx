'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Coins, FileText, Plus, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import NumericFormField from '@/components/admin/institutions/NumericFormField';
import { Badge } from '@/components/ui/badge';
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

const serviceSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères *'),
    longName: z.string().min(2, 'La description doit contenir au moins 2 caractères *'),
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
    montantMin: z.number().min(0, 'Doit être ≥ 0').optional(),
    montantMax: z.number().min(0, 'Doit être ≥ 0').optional(),

    feeTypeUI: z.enum(['FREE', 'FIX', 'POURCENTAGE'], {
      message: '* Veuillez sélectionner un type de frais',
    }),

    frais: z.object({
      montantFixe: z.number().min(0, 'Doit être ≥ 0').optional(),
      pourcentage: z.number().min(0, 'Doit être ≥ 0').max(100, 'Doit être ≤ 100').optional(),
      minimum: z.number().min(0, 'Doit être ≥ 0').optional(),
      maximum: z.number().min(0, 'Doit être ≥ 0').optional(),
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
        v.frais.maximum != null;

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
          message: 'Le champ montant Fixe est obligatoire *',
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
      if (v.frais.minimum == null || Number.isNaN(v.frais.minimum)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ minimim est obligatoire *',
          path: ['frais', 'minimum'],
        });
      }
      if (v.frais.maximum == null || Number.isNaN(v.frais.maximum)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ maximum est obligatoire * ',
          path: ['frais', 'maximum'],
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
  });

type ServiceFormData = z.infer<typeof serviceSchema>;

type TagInputFieldProps = {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

type NewServiceComponentProps = { institutionId: string };

const TagInputField = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
}: TagInputFieldProps) => {
  const [input, setInput] = useState('');
  const handleAdd = () => {
    if (input.trim()) {
      onChange([...value, input.trim()]);
      setInput('');
    }
  };
  const handleRemove = (index: number) => {
    if (!disabled) onChange(value.filter((_, i) => i !== index));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  return (
    <>
      <FormLabel>{label}</FormLabel>
      <div className='flex gap-2'>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
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
          {value.map((item, index) => (
            <Badge
              key={item}
              variant='secondary'
              className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
              onClick={() => handleRemove(index)}
            >
              {item}
              <X className='w-3 h-3 ml-1' />
            </Badge>
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
  value: 'FREE' | 'FIX' | 'POURCENTAGE';
  title: string;
  description?: string;
}) => (
  <div className='flex items-center gap-3 rounded-xl border p-3 hover:bg-gray-50 cursor-pointer'>
    <RadioGroupItem
      id={id}
      value={value}
      className='h-3 w-3 rounded-full border-1 border-[#5AB6DB] data-[state=checked]:bg-[#5AB6DB] data-[state=checked]:border-[#5AB6DB] data-[state=checked]:text-[#5AB6DB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5AB6DB] focus-visible:ring-offset-2'
    />
    <Label htmlFor={id} className='cursor-pointer flex-1'>
      <div className='font-medium'>{title}</div>
      {description && <div className='text-xs text-gray-500'>{description}</div>}
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
      frais: {
        montantFixe: undefined,
        pourcentage: undefined,
        minimum: undefined,
        maximum: undefined,
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
    if (feeTypeUI === 'FREE') {
      form.setValue('frais.montantFixe', undefined);
      form.setValue('frais.pourcentage', undefined);
      form.setValue('frais.minimum', undefined);
      form.setValue('frais.maximum', undefined);
    } else if (feeTypeUI === 'FIX') {
      form.setValue('frais.pourcentage', undefined);
      form.setValue('frais.minimum', undefined);
      form.setValue('frais.maximum', undefined);
    } else if (feeTypeUI === 'POURCENTAGE') {
      form.setValue('frais.montantFixe', undefined);
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
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft className='w-5 h-5' /> <span>Retour à l&apos;institution</span>
        </Link>
      </div>

      <div className='mb-6 flex items-center gap-3'>
        <div className='bg-[#5AB6DB] p-2 rounded-2xl'>
          <Settings className='h-6 w-6 text-white' aria-hidden='true' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Nouveau service</h1>
          <span className='text-gray-400 font-light text-sm'>Créez un nouveau service</span>
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
                    active && 'bg-teal-500 text-white border-teal-500',
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
            {/* Étape 1 */}
            <div className={getStepClassName(0)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nom du service *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Transfert'
                        className={cx(
                          'bg-[#F8F9FA] ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none',
                          fieldState.error ? 'border-1 border-red-500' : 'border-0'
                        )}
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='longName'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Transfert d'argent"
                        className={cx(
                          'bg-[#F8F9FA] min-h-15 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none',
                          fieldState.error ? 'border-1 border-red-500' : 'border-0'
                        )}
                        {...field}
                        disabled={isCreating}
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
                    <FormLabel>Type de service *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isCreating}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cx(
                            'bg-[#F8F9FA] data-[placeholder]:text-black/40 data-[placeholder]:font-normal ring-0 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0',
                            fieldState.error ? 'border-1 border-red-500' : 'border-0'
                          )}
                        >
                          <SelectValue placeholder='Sélectionner un type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-cyan-200 w-50 h-70'>
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
                    className='w-full h-6 rounded-lg bg-[#6EC1E4] text-white hover:bg-[#5AB6DB] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
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
                    <FormLabel className='text-base font-semibold'>Type de frais *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value ?? undefined}
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
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className='text-xs text-red-600 min-h-[16px]' />
                  </FormItem>
                )}
              />
              {feeTypeUI !== 'FREE' && (
                <div className='space-y-4'>
                  <FormLabel className='text-sm font-semibold'>Configuration des frais</FormLabel>

                  <div
                    className={
                      feeTypeUI === 'POURCENTAGE'
                        ? 'grid grid-cols-3 gap-4'
                        : 'grid grid-cols-2 gap-4 mb-4'
                    }
                  >
                    {feeTypeUI === 'FIX' && (
                      <NumericFormField
                        control={form.control}
                        name={'frais.montantFixe'}
                        label='Montant fixe (FCFA)'
                        requiredMark
                        disabled={isCreating}
                      />
                    )}

                    {(feeTypeUI === 'FIX' || feeTypeUI === 'POURCENTAGE') && (
                      <NumericFormField
                        control={form.control}
                        name={'frais.pourcentage'}
                        label='Pourcentage (%)'
                        step='0.01'
                        max={100}
                        requiredMark={feeTypeUI === 'POURCENTAGE'}
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
                  </div>
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
                  <FormItem>
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
                  <FormItem>
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

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full h-6 rounded bg-white border-[#EAEAEA] text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  onClick={() => setStep(0)}
                  disabled={isCreating}
                >
                  <ArrowLeft />
                  Précédent
                </Button>
                <Button
                  type='submit'
                  disabled={isCreating || !form.formState.isValid}
                  className='w-full h-6 rounded bg-[#6EC1E4] text-white hover:bg-[#5AB6DB] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
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
