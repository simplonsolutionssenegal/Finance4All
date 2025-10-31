'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Coins, FileText, Plus, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { TypeService, TypeCalculation, type CreateServiceDto } from '@/types/Service';

const serviceSchema = z
  .object({
    name: z.string().min(2, '*Le nom doit contenir au moins 2 caractères'),
    longName: z.string().min(2, '*La description doit contenir au moins 2 caractères'),
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
    typeFrais: z.enum([TypeCalculation.FREE, TypeCalculation.POURCENTAGE, TypeCalculation.FIX], {
      message: '* Veuillez sélectionner un type de frais',
    }),
    montantMin: z.number().min(0, 'Doit être ≥ 0').optional(),
    montantMax: z.number().min(0, 'Doit être ≥ 0').optional(),
    frais: z.object({
      montantFixe: z.number().optional(),
      pourcentage: z.number().min(0).max(100).optional(),
      minimum: z.number().optional(),
      maximum: z.number().optional(),
    }),
    conditionAccess: z.array(z.string()),
    plafonds: z.array(z.string()),
    infrastructureAccess: z.array(z.string()),
  })
  .refine(v => v.montantMin == null || v.montantMax == null || v.montantMin <= v.montantMax, {
    message: 'montantMin doit être ≤ montantMax',
    path: ['montantMax'],
  });

type ServiceFormData = z.infer<typeof serviceSchema>;

type FeeOptionProps = {
  id: string;
  value: TypeCalculation; // string enum attendu par RadioGroup
  title: string;
  description?: string;
};

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

type NewServiceComponentProps = {
  institutionId: string;
};
const FeeOption = ({ id, value, title, description }: FeeOptionProps) => {
  return (
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
};

const NewServiceComponent = ({ institutionId }: NewServiceComponentProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const [conditionInput, setConditionInput] = useState('');
  const [plafondInput, setPlafondInput] = useState('');
  const [infrastructureInput, setInfrastructureInput] = useState('');

  const { createService, isCreating } = useCreateService({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['institution', institutionId],
      });
      router.push(`/institutions/${institutionId}`);
    },
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      longName: '',
      type: undefined,
      typeFrais: undefined,
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

  const typeFrais = form.watch('typeFrais');

  const validateStep1 = useCallback(() => {
    const { name, longName, type } = form.getValues();
    return name.length >= 2 && longName.length >= 2 && type && type.length > 0;
  }, [form]);

  const watchStep1Fields = form.watch(['name', 'longName', 'type']);

  useEffect(() => {
    setIsStep1Valid(validateStep1());
  }, [watchStep1Fields, validateStep1]);

  useEffect(() => {
    if (typeFrais === TypeCalculation.FREE) {
      form.setValue('frais.montantFixe', undefined);
      form.setValue('frais.pourcentage', undefined);
      form.setValue('frais.minimum', undefined);
      form.setValue('frais.maximum', undefined);
    } else if (typeFrais === TypeCalculation.FIX) {
      form.setValue('frais.minimum', undefined);
      form.setValue('frais.maximum', undefined);
    }
  }, [typeFrais, form]);

  const onSubmit = (data: ServiceFormData) => {
    const serviceData: CreateServiceDto = {
      ...data,
    };
    createService({ institutionId, serviceData });
  };

  const steps = [
    { label: 'Informations', baseIcon: FileText },
    { label: 'Frais', baseIcon: Coins },
  ];

  const getStepClassName = (stepNumber: number) => {
    return step === stepNumber ? 'space-y-4' : 'hidden';
  };

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
            <div className={getStepClassName(0)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du service *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Transfert'
                        className='bg-[#F8F9FA] border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none'
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='longName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Transfert d'argent"
                        className='bg-[#F8F9FA] min-h-15 border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none'
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de service *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isCreating}
                    >
                      <FormControl>
                        <SelectTrigger className='bg-[#F8F9FA] data-[placeholder]:text-black/40 data-[placeholder]:font-normal border-0 ring-0 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0'>
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
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='montantMin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant minimum (FCFA)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          inputMode='decimal'
                          min='0'
                          placeholder='0'
                          className='bg-[#F8F9FA] border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                          {...field}
                          value={field.value ?? ''}
                          onKeyDown={e => {
                            if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                          }}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage className='text-xs text-red-600' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='montantMax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant maximum (FCFA)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          inputMode='decimal'
                          min='0'
                          placeholder='0'
                          className='bg-[#F8F9FA] border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                          {...field}
                          value={field.value ?? ''}
                          onKeyDown={e => {
                            if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                          }}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage className='text-xs text-red-600' />
                    </FormItem>
                  )}
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

            <div className={getStepClassName(1)}>
              <FormField
                control={form.control}
                name='typeFrais'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base font-semibold'>Type de frais *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className='space-y-3'
                      >
                        <FeeOption id='fee-free' value={TypeCalculation.FREE} title='Gratuit' />
                        <FeeOption
                          id='fee-fix'
                          value={TypeCalculation.FIX}
                          title='Frais fixe'
                          description='Montant constant en FCFA'
                        />
                        <FeeOption
                          id='fee-percent'
                          value={TypeCalculation.POURCENTAGE}
                          title='Frais en pourcentage'
                          description='Taux sur le montant'
                        />
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              {typeFrais && typeFrais !== TypeCalculation.FREE && (
                <div className='space-y-4'>
                  <FormLabel className='text-sm font-semibold'>Configuration des frais</FormLabel>
                  <div className='grid grid-cols-2 gap-4'>
                    {typeFrais === TypeCalculation.FIX && (
                      <FormField
                        control={form.control}
                        name='frais.montantFixe'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-sm text-gray-600'>
                              Montant fixe (FCFA) *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min='0'
                                placeholder='0'
                                className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                {...field}
                                value={field.value || ''}
                                onChange={e =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                disabled={isCreating}
                              />
                            </FormControl>
                            <FormMessage className='text-xs text-red-600' />
                          </FormItem>
                        )}
                      />
                    )}

                    {(typeFrais === TypeCalculation.FIX ||
                      typeFrais === TypeCalculation.POURCENTAGE) && (
                      <FormField
                        control={form.control}
                        name='frais.pourcentage'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-sm text-gray-600'>
                              Pourcentage (%) {typeFrais === TypeCalculation.POURCENTAGE && '*'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                step='0.01'
                                min='0'
                                max='100'
                                placeholder='0'
                                className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                {...field}
                                value={field.value || ''}
                                onChange={e =>
                                  field.onChange(
                                    e.target.value ? Number(e.target.value) : undefined
                                  )
                                }
                                disabled={isCreating}
                              />
                            </FormControl>
                            <FormMessage className='text-xs text-red-600' />
                          </FormItem>
                        )}
                      />
                    )}

                    {typeFrais === TypeCalculation.POURCENTAGE && (
                      <>
                        <FormField
                          control={form.control}
                          name='frais.minimum'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-sm text-gray-600'>
                                Minimum (FCFA)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  placeholder='0'
                                  className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                  {...field}
                                  value={field.value || ''}
                                  onChange={e =>
                                    field.onChange(
                                      e.target.value ? Number(e.target.value) : undefined
                                    )
                                  }
                                  disabled={isCreating}
                                />
                              </FormControl>
                              <FormMessage className='text-xs text-red-600' />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='frais.maximum'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-sm text-gray-600'>
                                Maximum (FCFA)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  placeholder='0'
                                  className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                  {...field}
                                  value={field.value || ''}
                                  onChange={e =>
                                    field.onChange(
                                      e.target.value ? Number(e.target.value) : undefined
                                    )
                                  }
                                  disabled={isCreating}
                                />
                              </FormControl>
                              <FormMessage className='text-xs text-red-600' />
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
                  <FormItem>
                    <FormLabel>Conditions d&apos;accès</FormLabel>
                    <div className='flex gap-2'>
                      <Input
                        value={conditionInput}
                        onChange={e => setConditionInput(e.target.value)}
                        placeholder='Ajouter une condition'
                        className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                        disabled={isCreating}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (conditionInput.trim()) {
                              field.onChange([...field.value, conditionInput.trim()]);
                              setConditionInput('');
                            }
                          }
                        }}
                      />
                      <Button
                        type='button'
                        onClick={() => {
                          if (conditionInput.trim()) {
                            field.onChange([...field.value, conditionInput.trim()]);
                            setConditionInput('');
                          }
                        }}
                        disabled={isCreating || !conditionInput.trim()}
                        className='bg-cyan-400 hover:bg-cyan-500'
                      >
                        <Plus className='w-4 h-4' />
                      </Button>
                    </div>
                    {field.value.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {field.value.map((item, index) => (
                          <Badge
                            key={item}
                            variant='secondary'
                            className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
                            onClick={() =>
                              !isCreating &&
                              field.onChange(field.value.filter((_, i) => i !== index))
                            }
                          >
                            {item}
                            <X className='w-3 h-3 ml-1' />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='plafonds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plafonds</FormLabel>
                    <div className='flex gap-2'>
                      <Input
                        value={plafondInput}
                        onChange={e => setPlafondInput(e.target.value)}
                        placeholder='Ex: 500 000 FCFA/jour'
                        className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                        disabled={isCreating}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (plafondInput.trim()) {
                              field.onChange([...field.value, plafondInput.trim()]);
                              setPlafondInput('');
                            }
                          }
                        }}
                      />
                      <Button
                        type='button'
                        onClick={() => {
                          if (plafondInput.trim()) {
                            field.onChange([...field.value, plafondInput.trim()]);
                            setPlafondInput('');
                          }
                        }}
                        disabled={isCreating || !plafondInput.trim()}
                        className='bg-cyan-400 hover:bg-cyan-500'
                      >
                        <Plus className='w-4 h-4' />
                      </Button>
                    </div>
                    {field.value.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {field.value.map((item, index) => (
                          <Badge
                            key={item}
                            variant='secondary'
                            className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
                            onClick={() =>
                              !isCreating &&
                              field.onChange(field.value.filter((_, i) => i !== index))
                            }
                          >
                            {item}
                            <X className='w-3 h-3 ml-1' />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='infrastructureAccess'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Infrastructure d&apos;accès</FormLabel>
                    <div className='flex gap-2'>
                      <Input
                        value={infrastructureInput}
                        onChange={e => setInfrastructureInput(e.target.value)}
                        placeholder='Ex: Agence, GAB, Mobile'
                        className='bg-[#F8F9FA] border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                        disabled={isCreating}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (infrastructureInput.trim()) {
                              field.onChange([...field.value, infrastructureInput.trim()]);
                              setInfrastructureInput('');
                            }
                          }
                        }}
                      />
                      <Button
                        type='button'
                        onClick={() => {
                          if (infrastructureInput.trim()) {
                            field.onChange([...field.value, infrastructureInput.trim()]);
                            setInfrastructureInput('');
                          }
                        }}
                        disabled={isCreating || !infrastructureInput.trim()}
                        className='bg-cyan-400 hover:bg-cyan-500'
                      >
                        <Plus className='w-4 h-4' />
                      </Button>
                    </div>
                    {field.value.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {field.value.map((item, index) => (
                          <Badge
                            key={item}
                            variant='secondary'
                            className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
                            onClick={() =>
                              !isCreating &&
                              field.onChange(field.value.filter((_, i) => i !== index))
                            }
                          >
                            {item}
                            <X className='w-3 h-3 ml-1' />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage className='text-xs text-red-600' />
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
