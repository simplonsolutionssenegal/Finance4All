import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { InstitutionFormValues } from '../validation-schema';

interface StepContactInfoProps {
  form: UseFormReturn<InstitutionFormValues>;
}

export const StepContactInfo: React.FC<StepContactInfoProps> = ({ form }) => {
  return (
    <div className='space-y-5'>
      <div className='mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>Informations de contact</h3>
        <p className='text-sm text-gray-500 mt-1'>Ces informations permettront aux utilisateurs de contacter l&apos;institution (tous les champs sont optionnels)</p>
      </div>
      <FormField
        control={form.control}
        name='contactNom'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>
              Nom du contact <span className='text-gray-400 font-normal'>(optionnel)</span>
            </FormLabel>
            <FormControl>
              <Input placeholder='Nom complet' className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg' {...field} />
            </FormControl>
            <FormMessage className='text-red-500 text-xs' />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <FormField
          control={form.control}
          name='contactEmail'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>
                Email <span className='text-gray-400 font-normal'>(optionnel)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='contact@exemple.com' className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg' {...field} />
              </FormControl>
              <FormMessage className='text-red-500 text-xs' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='contactTelephone'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>
                Téléphone <span className='text-gray-400 font-normal'>(optionnel)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='+237 XXX XXX XXX' className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg' {...field} />
              </FormControl>
              <FormMessage className='text-red-500 text-xs' />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default StepContactInfo;
