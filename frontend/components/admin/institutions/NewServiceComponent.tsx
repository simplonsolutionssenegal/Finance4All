'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Coins, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';

import NumericFormField from '@/components/admin/institutions/NumericFormField';
// import { FeeOption } from '@/components/admin/services/FeeOption';
// import { TagInputField } from '@/components/admin/services/TagInputField';
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
import { RadioGroup } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateService } from '@/hooks/service/useCreateService';
import {
  serviceSchema,
  type ServiceFormData,
  Currency,
  FEE_OPTIONS,
  toServicePayload,
} from '@/lib/serviceForm.shared';
import { TypeService } from '@/types/Service';

import { FeeOption } from './FeeOption';
import { TagInputField } from './TagInputField';

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

type NewServiceComponentProps = { institutionId: string };

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
      default:
        break;
    }
  }, [feeTypeUI, form]);

  const onSubmit = (data: ServiceFormData) => {
    const serviceData = toServicePayload(data);
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
          <ArrowLeft className='w-5 h-5' /> <span>Retour</span>
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
            {/* Étape 1 */}
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
                  name='montantMin'
                  label='Montant minimum (FCFA)'
                  disabled={isCreating}
                />
                <NumericFormField
                  control={form.control}
                  name='montantMax'
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
                      Sélectionnez le type de frais *
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value ?? 'FREE'}
                        onValueChange={field.onChange}
                        className='space-y-3'
                      >
                        {FEE_OPTIONS.map(option => (
                          <FeeOption
                            key={option.id}
                            id={option.id}
                            value={option.value}
                            title={option.title}
                            description={option.description}
                          />
                        ))}
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
                        name='frais.montantFixe'
                        label='Montant fixe (FCFA)'
                        requiredMark
                        disabled={isCreating}
                      />
                    )}

                    {(feeTypeUI === 'MIXTE' || feeTypeUI === 'POURCENTAGE') && (
                      <NumericFormField
                        control={form.control}
                        name='frais.pourcentage'
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
                          name='frais.minimum'
                          label='Minimum (FCFA)'
                          requiredMark
                          disabled={isCreating}
                        />
                        <NumericFormField
                          control={form.control}
                          name='frais.maximum'
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
                          name='frais.fraisChange.fxSurcharge'
                          label='Montant en devise'
                          step='0.01'
                          requiredMark
                          disabled={isCreating}
                        />

                        <FormField
                          control={form.control}
                          name='frais.fraisChange.devise'
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
                  <FormItem className='text-sm font-normal'>
                    <TagInputField
                      label="Conditions d'accès"
                      placeholder='Ajouter une condition'
                      value={field.value || []}
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
                      value={field.value || []}
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
                  <FormItem className='text-sm font-normal'>
                    <TagInputField
                      label="Infrastructure d'accès"
                      placeholder='Ex: Agence, GAB, Mobile'
                      value={field.value || []}
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
