'use client';

import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { RadioGroup } from '@/components/ui/radio-group';
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
import {
  type ServiceFormData,
  FEE_OPTIONS,
  serviceSchema,
  toFormDefaults,
  toServicePayload,
} from '@/lib/serviceForm.shared';
import { TypeService } from '@/types/Service';

import { FeeOption } from './FeeOption';
import { TagInputField } from './TagInputField';

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

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
      // on garde undefined pour que le préfill décide (et pour le create aussi)
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
    const serviceData = toServicePayload(data);

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
                      key={field.value}
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

            {/* ✅ Message immédiat (si min > max) : on affiche l'erreur des champs */}
            {(form.formState.errors.montantMin?.message ||
              form.formState.errors.montantMax?.message) && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                {form.formState.errors.montantMin?.message ??
                  form.formState.errors.montantMax?.message}
              </div>
            )}

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
                      {FEE_OPTIONS.map(opt => (
                        <FeeOption
                          key={opt.id}
                          id={opt.id}
                          value={opt.value}
                          title={opt.title}
                          description={opt.description}
                        />
                      ))}
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
                step='0.1'
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
                        {/* ⚠️ Ici, tu gardes Currency dans shared,
                            donc si tu veux afficher la liste ici, ajoute une export "CURRENCIES" dans shared,
                            ou remets Currency localement. */}
                        <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                          {/* Exemple rapide: */}
                          <SelectItem value='XOF'>XOF</SelectItem>
                          <SelectItem value='XAF'>XAF</SelectItem>
                          <SelectItem value='EUR'>EUR</SelectItem>
                          <SelectItem value='USD'>USD</SelectItem>
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
              render={({ field, fieldState }) => (
                <FormItem>
                  <TagInputField
                    label="Conditions d'accès"
                    placeholder='Ajouter une condition'
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={isUpdating}
                    error={!!fieldState.error}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='plafonds'
              render={({ field, fieldState }) => (
                <FormItem>
                  <TagInputField
                    label='Plafonds'
                    placeholder='Ex: 500 000 FCFA/jour'
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={isUpdating}
                    error={!!fieldState.error}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='infrastructureAccess'
              render={({ field, fieldState }) => (
                <FormItem>
                  <TagInputField
                    label="Infrastructure d'accès"
                    placeholder='Ex: Agence, GAB, Mobile'
                    value={field.value || []}
                    onChange={field.onChange}
                    disabled={isUpdating}
                    error={!!fieldState.error}
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
