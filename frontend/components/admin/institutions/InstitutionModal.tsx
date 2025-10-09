'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!isSubmitting) {
          onOpenChange(open);
          if (!open) form.reset();
        }
      }}
    >
      <DialogContent className='max-w-md bg-white'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-gray-900'>
            {isEditMode ? "Modifier l'institut" : 'Ajouter un institut'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;institut</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Société générale'
                      className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Description de l'institution..."
                      className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
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
                  <FormLabel>Site web</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://www.institut.sn'
                      className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                  <FormLabel>Zones géographiques couvertes</FormLabel>
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
                        placeholder='Rechercher une zone...'
                        className='w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        disabled={isSubmitting}
                      />
                      <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none' />
                    </div>
                    {isDropdownOpen && filteredZones.length > 0 && (
                      <div className='absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
                        {filteredZones.map(zone => (
                          <Button
                            key={zone}
                            onClick={() => {
                              field.onChange([...(field.value || []), zone]);
                              setSearchZone('');
                              setIsDropdownOpen(false);
                            }}
                            className='w-full justify-start'
                          >
                            {zone}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedZones.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {selectedZones.map(zone => (
                        <Badge
                          key={zone}
                          variant='default'
                          className='bg-gray-400/30 p-2 cursor-pointer hover:bg-gray-500'
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

            <FormField
              control={form.control}
              name='logoUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo (URL)</FormLabel>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='https://exemple.com/logo.png'
                      {...field}
                      disabled={isSubmitting}
                      className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </FormControl>
                  <FormMessage />
                  {logoUrl && form.formState.errors.logoUrl?.type !== 'invalid_string' && (
                    <div className='mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50'>
                      <p className='text-xs text-gray-500 mb-2'>Aperçu du logo :</p>
                      <div className='flex items-center justify-center'>
                        <Image
                          src={logoUrl}
                          alt='Aperçu du logo'
                          width={500}
                          height={500}
                          className='max-h-24 max-w-full object-contain'
                        />
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className='flex justify-end pt-4'>
              <Button
                type='submit'
                disabled={isSubmitting || !form.formState.isValid}
                className='bg-cyan-400 text-white hover:bg-cyan-500 px-8 py-3 rounded-xl'
              >
                {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Modifier' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionModal;
