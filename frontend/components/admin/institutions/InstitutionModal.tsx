'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateInstitution } from '@/hooks/institution/useCreateInstitution';
import { useUpdateInstitution } from '@/hooks/institution/useUpdateInstitution';
import type { Institution } from '@/types/Institution';

interface InstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refresh: () => void;
  institution?: Institution | null;
}

const institutionSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  website: z.string().url('Doit être une URL valide').optional().or(z.literal('')),
  geographicZones: z.array(z.string()).min(1, 'Au moins une zone géographique est requise'),
  logoUrl: z.string().url('Doit être une URL valide').optional().or(z.literal('')),
  type: z.enum(
    [
      'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      'PORTEFEUILLE_NUMERIQUE',
      'SERVICE_PAIEMENT_ELECTRONIQUE',
      'BANQUE_NUMERIQUE',
      'SERVICE_FINANCIER_DECENTRALISE',
      'SERVICE_FINANCEMENT_PARTICIPATIF',
      'SERVICE_INVESTISSEMENT',
      'SERVICE_GESTION_FINANCIERE',
      'SERVICE_ASSURANCE_NUMERIQUE',
    ],
    'Le type est requis'
  ),
  pays: z.enum(['SENEGAL', 'CAMEROUN'], 'Le pays est requis'),
});

type FormData = z.infer<typeof institutionSchema>;

const availableZones = [
  'EURO',
  'USD',
  'Franc Suisse',
  'Roupie indienne',
  'Australie',
  'Caraïbes orientales',
  'Sud Africain',
  'UEMOA',
  'CEMAC',
  'Pacifique',
];

const InstitutionTypes = {
  ETABLISSEMENT_MONNAIE_ELECTRONIQUE: 'Établissement de monnaie électronique',
  PORTEFEUILLE_NUMERIQUE: 'Portefeuille numérique',
  SERVICE_PAIEMENT_ELECTRONIQUE: 'Service de paiement',
  BANQUE_NUMERIQUE: 'Banque numérique',
  SERVICE_FINANCIER_DECENTRALISE: 'SFD',
  SERVICE_FINANCEMENT_PARTICIPATIF: 'Financement participatif',
  SERVICE_INVESTISSEMENT: 'Investissement',
  SERVICE_GESTION_FINANCIERE: 'Gestion financière',
  SERVICE_ASSURANCE_NUMERIQUE: 'Assurance numérique',
} as const;

const Countries = {
  SENEGAL: 'Sénégal',
  CAMEROUN: 'Cameroun',
} as const;

const removeZone = (zones: string[] | undefined, zoneToRemove: string): string[] => {
  return zones?.filter(z => z !== zoneToRemove) || [];
};

const InstitutionModal = ({ open, onOpenChange, refresh, institution }: InstitutionModalProps) => {
  const isEditMode = !!institution;

  const form = useForm<FormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      geographicZones: [],
      logoUrl: '',
      type: undefined,
      pays: undefined,
    },
    mode: 'onChange',
  });

  // Gestionnaire de clic en dehors pour fermer le dropdown des zones
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsDropdownOpen]);

  useEffect(() => {
    if (institution) {
      form.reset({
        name: institution.name,
        description: institution.description,
        website: institution.website || '',
        geographicZones: institution.geographicZones,
        logoUrl: institution.logoUrl || '',
        type: institution.type,
        pays: institution.pays,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        website: '',
        geographicZones: [],
        logoUrl: '',
        type: undefined,
        pays: undefined,
      });
    }
  }, [institution, form]);

  const { isCreating, createInstitution } = useCreateInstitution({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      refresh();
    },
  });

  const { isUpdating, updateInstitution } = useUpdateInstitution({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      refresh();
    },
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchZone, setSearchZone] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const logoUrl = form.watch('logoUrl');
  const sanitizedLogoUrl = typeof logoUrl === 'string' ? logoUrl.trim() : logoUrl;
  const selectedZones = form.watch('geographicZones');

  const filteredZones = availableZones.filter(
    zone =>
      zone.toLowerCase().includes(searchZone.toLowerCase()) && !(selectedZones || []).includes(zone)
  );

  const onSubmit = (data: FormData) => {
    if (isEditMode && institution) {
      updateInstitution({ id: institution.id, data });
    } else {
      createInstitution(data);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  let submitLabel = 'Enregistrer les modifications';
  if (isSubmitting) submitLabel = 'Enregistrement…';
  else if (!isEditMode) submitLabel = 'Créer l&apos;institution';

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!isSubmitting) {
          onOpenChange(o);
          if (!o) form.reset();
        }
      }}
    >
      <DialogContent
        className='
          w-[95vw] sm:w-[512px]
          p-0 bg-white
          rounded-xl shadow-xl border border-gray-200
          h-[600px] overflow-y-auto
        '
      >
        <DialogHeader className='items-start p-6 pb-4 border-b border-gray-100'>
          <DialogTitle className='text-xl font-semibold text-tertiary-400'>
            {isEditMode ? 'Modifier l&apos;institution' : 'Nouvelle institution'}
          </DialogTitle>
          <p className='text-sm text-tertiary-400/60'>
            {isEditMode
              ? 'Modifiez les informations de l&apos;institution financière'
              : 'Créez une nouvelle institution financière sur la plateforme. Elle sera en attente de validation avant d&apos;être active.'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 pt-5 space-y-4'>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Nom de l&apos;institution *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Orange Money'
                        className='h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700'>Type *</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='outline'
                              className='w-full h-11 px-3 justify-between rounded-md border-gray-300 bg-white hover:bg-gray-50 text-left font-normal'
                              disabled={isSubmitting}
                            >
                              {field.value ? InstitutionTypes[field.value] : 'Sélectionner un type'}
                              <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align='start'
                            className='w-full min-w-[200px] bg-white border border-gray-200 shadow-lg'
                          >
                            <DropdownMenuItem
                              onClick={() => field.onChange('')}
                              className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                            >
                              Sélectionner un type
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {Object.entries(InstitutionTypes).map(([value, label]) => (
                              <DropdownMenuItem
                                key={value}
                                onClick={() => field.onChange(value)}
                                className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                              >
                                {label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='pays'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700'>Pays *</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='outline'
                              className='w-full h-11 px-3 justify-between rounded-md border-gray-300 bg-white hover:bg-gray-50 text-left font-normal'
                              disabled={isSubmitting}
                            >
                              {field.value ? Countries[field.value] : 'Sélectionner un pays'}
                              <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align='start'
                            className='w-full min-w-[200px] bg-white border border-gray-200 shadow-lg'
                          >
                            <DropdownMenuItem
                              onClick={() => field.onChange('')}
                              className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                            >
                              Sélectionner un pays
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {Object.entries(Countries).map(([value, label]) => (
                              <DropdownMenuItem
                                key={value}
                                onClick={() => field.onChange(value)}
                                className='cursor-pointer hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white'
                              >
                                {label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Description *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Description de l'institution"
                        className='rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none'
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='logoUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Logo (emoji ou URL)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='🏦 ou https://'
                        className='h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>Site web</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://'
                        className='h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='geographicZones'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Zones couvertes
                    </FormLabel>
                    <div ref={dropdownRef} className='relative'>
                      <div className='relative'>
                        <div className='relative flex items-center'>
                          <Input
                            type='text'
                            value={searchZone}
                            onChange={e => {
                              setSearchZone(e.target.value);
                              setIsDropdownOpen(true);
                            }}
                            placeholder='Sélectionner une zone'
                            className='h-11 pr-9 rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                            disabled={isSubmitting}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            className='absolute right-0 h-full px-3 hover:bg-transparent'
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={isSubmitting}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                            />
                          </Button>
                        </div>
                      </div>

                      {isDropdownOpen && (
                        <div className='absolute z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-56 overflow-y-auto'>
                          {filteredZones.length > 0 ? (
                            filteredZones.map(zone => (
                              <button
                                key={zone}
                                type='button'
                                onClick={() => {
                                  field.onChange([...(field.value || []), zone]);
                                  setSearchZone('');
                                  setIsDropdownOpen(false);
                                }}
                                className='w-full text-left px-4 py-2.5 hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white text-sm cursor-pointer transition-colors'
                              >
                                {zone}
                              </button>
                            ))
                          ) : (
                            <div className='px-4 py-2.5 text-sm text-gray-500'>
                              Aucune zone trouvée
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedZones.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-3'>
                        {selectedZones.map(zone => (
                          <Badge
                            key={zone}
                            variant='secondary'
                            className='gap-1.5 rounded-md px-3 py-1.5 bg-gray-100 text-gray-700 text-sm border-0 hover:bg-gray-200 cursor-pointer'
                            onClick={() =>
                              !isSubmitting && field.onChange(removeZone(field.value, zone))
                            }
                          >
                            {zone}
                            <X className='w-3.5 h-3.5' />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {sanitizedLogoUrl && !form.formState.errors.logoUrl && (
                <div>
                  <div className='rounded-md border border-gray-200 bg-gray-50 p-4'>
                    <div className='flex items-center justify-center'>
                      <Image
                        src={sanitizedLogoUrl}
                        alt='Aperçu du logo'
                        width={500}
                        height={500}
                        className='max-h-20 max-w-full object-contain'
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className='sticky -mx-6 -mb-6 mt-6 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl'>
              <div className='flex w-full justify-end gap-3'>
                <Button
                  type='button'
                  variant='ghost'
                  className='h-11 px-6 rounded-md hover:bg-gray-200'
                  onClick={() => !isSubmitting && onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting || !form.formState.isValid}
                  className='h-11 px-6 rounded-md bg-cyan-500 text-white hover:bg-cyan-600'
                >
                  {submitLabel}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionModal;
