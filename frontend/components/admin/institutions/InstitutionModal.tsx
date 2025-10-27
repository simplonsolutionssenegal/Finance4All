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
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (institution) {
      form.reset({
        name: institution.name,
        description: institution.description,
        website: institution.website || '',
        geographicZones: institution.geographicZones,
        logoUrl: institution.logoUrl || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        website: '',
        geographicZones: [],
        logoUrl: '',
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

  const [searchZone, setSearchZone] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  let submitLabel = 'Enregistrer';
  if (isSubmitting) submitLabel = 'Enregistrement…';
  else if (isEditMode) submitLabel = 'Modifier';

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
          w-[92vw] sm:w-auto
          sm:max-w-[540px] md:max-w-[560px]
          p-0 bg-white/95 backdrop-blur
          rounded-xl shadow-2xl border border-gray-200
          max-h-[85vh] overflow-y-auto
        '
      >
        <DialogHeader className='items-start p-5 pb-3 border-b border-gray-100'>
          <DialogTitle className='text-[16px] font-semibold text-gray-900'>
            {isEditMode ? "Modifier l'institution" : 'Nouvelle institution'}
          </DialogTitle>
          <p className='text-[13px] text-gray-500'>
            Modifiez les informations de l’institution financière
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='p-5 pt-4 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='col-span-1 md:col-span-2'>
                    <FormLabel className='text-sm text-gray-700'>Nom de l’institution *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex : Orange Money'
                        className='h-10 rounded-lg border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
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
                name='description'
                render={({ field }) => (
                  <FormItem className='col-span-1 md:col-span-2'>
                    <FormLabel className='text-sm text-gray-700'>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder='Description de l’institution…'
                        className='rounded-lg border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none'
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
                    <FormLabel className='text-sm text-gray-700'>Site web</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://www.institution.sn'
                        className='h-10 rounded-lg border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
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
                    <FormLabel className='text-sm text-gray-700'>Logo (URL)</FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        placeholder='https://exemple.com/logo.png'
                        className='h-10 rounded-lg border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
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
                  <FormItem className='col-span-1 md:col-span-2'>
                    <FormLabel className='text-sm text-gray-700'>
                      Zones géographiques couvertes *
                    </FormLabel>
                    <div ref={dropdownRef} className='relative'>
                      <div className='relative'>
                        <Input
                          type='text'
                          value={searchZone}
                          onChange={e => {
                            setSearchZone(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          onFocus={() => setIsDropdownOpen(true)}
                          placeholder='Rechercher une zone…'
                          className='h-10 pr-9 rounded-lg border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                          disabled={isSubmitting}
                        />
                        <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none' />
                      </div>

                      {isDropdownOpen && filteredZones.length > 0 && (
                        <div className='absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl max-h-56 overflow-y-auto'>
                          {filteredZones.map(zone => (
                            <button
                              key={zone}
                              type='button'
                              onClick={() => {
                                field.onChange([...(field.value || []), zone]);
                                setSearchZone('');
                                setIsDropdownOpen(false);
                              }}
                              className='w-full text-left px-4 py-2.5 hover:bg-gray-50'
                            >
                              {zone}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedZones.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-3'>
                        {selectedZones.map(zone => (
                          <Badge
                            key={zone}
                            variant='secondary'
                            className='gap-1 rounded-full px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 cursor-pointer'
                            onClick={() =>
                              !isSubmitting &&
                              field.onChange((field.value || []).filter(z => z !== zone))
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

              {sanitizedLogoUrl && form.formState.errors.logoUrl?.type !== 'invalid_string' && (
                <div className='col-span-1 md:col-span-2'>
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                    <p className='text-xs text-gray-500 mb-2'>Aperçu du logo</p>
                    <div className='flex items-center justify-center'>
                      <Image
                        src={sanitizedLogoUrl}
                        alt='Aperçu du logo'
                        width={500}
                        height={500}
                        className='max-h-24 max-w-full object-contain'
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className='sticky -m-5 mt-2 p-5 pt-3 border-t border-gray-100 bg-white rounded-b-xl'>
              <div className='flex w-full justify-end gap-2.5'>
                <Button
                  type='button'
                  variant='ghost'
                  className='h-10 px-4 rounded-lg'
                  onClick={() => !isSubmitting && onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting || !form.formState.isValid}
                  className='h-10 px-5 rounded-lg text-white hover:opacity-90'
                  style={{ backgroundColor: 'var(--primary-200)' }}
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
