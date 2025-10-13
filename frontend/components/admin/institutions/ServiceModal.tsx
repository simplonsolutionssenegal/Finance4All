'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm, type ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateService } from '@/hooks/service/useCreateService';
import { TypeService, type CreateServiceDto } from '@/types/Service';

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  refresh: () => void;
}

const serviceSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  longName: z.string().min(2, 'Le nom complet doit contenir au moins 2 caractères'),
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
    'Le type de service doit être valide'
  ),
  frais: z.object({
    montantFixe: z.number().optional(),
    pourcentage: z.number().min(0).max(100).optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
  }),
  conditionAccess: z.array(z.string()),
  plafonds: z.array(z.string()),
  infrastructureAccess: z.array(z.string()),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// Composant réutilisable pour les champs de frais numériques
interface NumberFieldProps {
  field: ControllerRenderProps<
    ServiceFormData,
    'frais.montantFixe' | 'frais.pourcentage' | 'frais.minimum' | 'frais.maximum'
  >;
  label: string;
  placeholder?: string;
  step?: string;
  isCreating: boolean;
}

const NumberField = ({ field, label, placeholder = '0', step, isCreating }: NumberFieldProps) => (
  <FormItem>
    <FormLabel className='text-sm text-gray-600'>{label}</FormLabel>
    <FormControl>
      <Input
        type='number'
        step={step}
        placeholder={placeholder}
        className='w-full px-4 py-3 border border-gray-200 rounded-lg'
        {...field}
        value={field.value || ''}
        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={isCreating}
      />
    </FormControl>
    <FormMessage />
  </FormItem>
);

// Composant réutilisable pour la gestion des tableaux
interface ArrayFieldProps {
  field: ControllerRenderProps<
    ServiceFormData,
    'conditionAccess' | 'plafonds' | 'infrastructureAccess'
  >;
  label: string;
  placeholder: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  isCreating: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const ArrayField = ({
  field,
  label,
  placeholder,
  inputValue,
  onInputChange,
  isCreating,
  onAdd,
  onRemove,
}: ArrayFieldProps) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <div className='flex gap-2'>
      <Input
        value={inputValue}
        onChange={e => onInputChange(e.target.value)}
        placeholder={placeholder}
        className='flex-1'
        disabled={isCreating}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAdd();
          }
        }}
      />
      <Button
        type='button'
        onClick={onAdd}
        disabled={isCreating || !inputValue.trim()}
        className='bg-cyan-400 hover:bg-cyan-500'
      >
        <Plus className='w-4 h-4' />
      </Button>
    </div>
    {field.value && field.value.length > 0 && (
      <div className='flex flex-wrap gap-2 mt-2'>
        {field.value.map((item: string, index: number) => (
          <Badge
            key={`${item}-${index}`} // eslint-disable-line react/no-array-index-key
            variant='secondary'
            className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
            onClick={() => !isCreating && onRemove(index)}
          >
            {item}
            <X className='w-3 h-3 ml-1' />
          </Badge>
        ))}
      </div>
    )}
    <FormMessage />
  </FormItem>
);

const ServiceModal = ({ open, onOpenChange, institutionId, refresh }: ServiceModalProps) => {
  const { createService, isCreating } = useCreateService({
    onSuccess: () => {
      refresh();
      onOpenChange(false);
      form.reset();
    },
  });

  const [conditionInput, setConditionInput] = useState('');
  const [plafondInput, setPlafondInput] = useState('');
  const [infrastructureInput, setInfrastructureInput] = useState('');

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      longName: '',
      type: undefined,
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
  });

  const onSubmit = (data: ServiceFormData) => {
    const serviceData: CreateServiceDto = {
      ...data,
    };
    createService({ institutionId, serviceData });
  };

  const addArrayItem = (
    field: ControllerRenderProps<
      ServiceFormData,
      'conditionAccess' | 'plafonds' | 'infrastructureAccess'
    >,
    input: string,
    setInput: (value: string) => void
  ) => {
    if (input.trim()) {
      field.onChange([...(field.value || []), input.trim()]);
      setInput('');
    }
  };

  const removeArrayItem = (
    field: ControllerRenderProps<
      ServiceFormData,
      'conditionAccess' | 'plafonds' | 'infrastructureAccess'
    >,
    index: number
  ) => {
    field.onChange(field.value.filter((_, i: number) => i !== index));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!isCreating) {
          onOpenChange(open);
          if (!open) form.reset();
        }
      }}
    >
      <DialogContent className='max-w-2xl bg-white max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-gray-900'>
            Ajouter un service financier
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom court</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Transfert'
                        className='w-full px-4 py-3 border border-gray-200 rounded-lg'
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='longName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Transfert d'argent"
                        className='w-full px-4 py-3 border border-gray-200 rounded-lg'
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de service</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isCreating}>
                    <FormControl>
                      <SelectTrigger className='w-full px-4 py-3 border border-gray-200 rounded-lg'>
                        <SelectValue placeholder='Sélectionner un type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='bg-white'>
                      {Object.entries(TypeService).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-2'>
              <FormLabel>Frais</FormLabel>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='frais.montantFixe'
                  render={({ field }) => (
                    <NumberField
                      field={field}
                      label='Montant fixe (FCFA)'
                      isCreating={isCreating}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name='frais.pourcentage'
                  render={({ field }) => (
                    <NumberField
                      field={field}
                      label='Pourcentage (%)'
                      step='0.01'
                      isCreating={isCreating}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name='frais.minimum'
                  render={({ field }) => (
                    <NumberField field={field} label='Minimum (FCFA)' isCreating={isCreating} />
                  )}
                />

                <FormField
                  control={form.control}
                  name='frais.maximum'
                  render={({ field }) => (
                    <NumberField field={field} label='Maximum (FCFA)' isCreating={isCreating} />
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name='conditionAccess'
              render={({ field }) => (
                <ArrayField
                  field={field}
                  label="Conditions d'accès"
                  placeholder='Ajouter une condition'
                  inputValue={conditionInput}
                  onInputChange={setConditionInput}
                  isCreating={isCreating}
                  onAdd={() => addArrayItem(field, conditionInput, setConditionInput)}
                  onRemove={index => removeArrayItem(field, index)}
                />
              )}
            />

            <FormField
              control={form.control}
              name='plafonds'
              render={({ field }) => (
                <ArrayField
                  field={field}
                  label='Plafonds'
                  placeholder='Ex: 500 000 FCFA/jour'
                  inputValue={plafondInput}
                  onInputChange={setPlafondInput}
                  isCreating={isCreating}
                  onAdd={() => addArrayItem(field, plafondInput, setPlafondInput)}
                  onRemove={index => removeArrayItem(field, index)}
                />
              )}
            />

            <FormField
              control={form.control}
              name='infrastructureAccess'
              render={({ field }) => (
                <ArrayField
                  field={field}
                  label="Infrastructure d'accès"
                  placeholder='Ex: Agence, GAB, Mobile'
                  inputValue={infrastructureInput}
                  onInputChange={setInfrastructureInput}
                  isCreating={isCreating}
                  onAdd={() => addArrayItem(field, infrastructureInput, setInfrastructureInput)}
                  onRemove={index => removeArrayItem(field, index)}
                />
              )}
            />

            <div className='flex justify-end gap-4 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                type='submit'
                disabled={isCreating || !form.formState.isValid}
                className='bg-cyan-400 text-white hover:bg-cyan-500 px-8 py-3 rounded-xl'
              >
                {isCreating ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceModal;
