'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

  const addArrayItem = (field: any, input: string, setInput: (value: string) => void) => {
    if (input.trim()) {
      field.onChange([...(field.value || []), input.trim()]);
      setInput('');
    }
  };

  const removeArrayItem = (field: any, index: number) => {
    field.onChange(field.value.filter((_: any, i: number) => i !== index));
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
                    <FormItem>
                      <FormLabel className='text-sm text-gray-600'>Montant fixe (FCFA)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          className='w-full px-4 py-3 border border-gray-200 rounded-lg'
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='frais.pourcentage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm text-gray-600'>Pourcentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='0'
                          className='w-full px-4 py-3 border border-gray-200 rounded-lg'
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='frais.minimum'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm text-gray-600'>Minimum (FCFA)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          className='w-full px-4 py-3 border border-gray-200 rounded-lg'
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='frais.maximum'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm text-gray-600'>Maximum (FCFA)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          className='w-full px-4 py-3 border border-gray-200 rounded-lg'
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isCreating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                      className='flex-1'
                      disabled={isCreating}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(field, conditionInput, setConditionInput);
                        }
                      }}
                    />
                    <Button
                      type='button'
                      onClick={() => addArrayItem(field, conditionInput, setConditionInput)}
                      disabled={isCreating || !conditionInput.trim()}
                      className='bg-cyan-400 hover:bg-cyan-500'
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  </div>
                  {field.value && field.value.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {field.value.map((item: string, index: number) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
                          onClick={() => !isCreating && removeArrayItem(field, index)}
                        >
                          {item}
                          <X className='w-3 h-3 ml-1' />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
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
                      className='flex-1'
                      disabled={isCreating}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(field, plafondInput, setPlafondInput);
                        }
                      }}
                    />
                    <Button
                      type='button'
                      onClick={() => addArrayItem(field, plafondInput, setPlafondInput)}
                      disabled={isCreating || !plafondInput.trim()}
                      className='bg-cyan-400 hover:bg-cyan-500'
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  </div>
                  {field.value && field.value.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {field.value.map((item: string, index: number) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
                          onClick={() => !isCreating && removeArrayItem(field, index)}
                        >
                          {item}
                          <X className='w-3 h-3 ml-1' />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
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
                      className='flex-1'
                      disabled={isCreating}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(field, infrastructureInput, setInfrastructureInput);
                        }
                      }}
                    />
                    <Button
                      type='button'
                      onClick={() =>
                        addArrayItem(field, infrastructureInput, setInfrastructureInput)
                      }
                      disabled={isCreating || !infrastructureInput.trim()}
                      className='bg-cyan-400 hover:bg-cyan-500'
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  </div>
                  {field.value && field.value.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {field.value.map((item: string, index: number) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='bg-gray-200 px-3 py-1 cursor-pointer hover:bg-gray-300'
                          onClick={() => !isCreating && removeArrayItem(field, index)}
                        >
                          {item}
                          <X className='w-3 h-3 ml-1' />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
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
