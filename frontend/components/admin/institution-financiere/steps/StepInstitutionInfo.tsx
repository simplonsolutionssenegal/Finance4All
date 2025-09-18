import Image from 'next/image';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { typeInstitutions } from '../constants';
import type { InstitutionFormValues } from '../validation-schema';

interface StepInstitutionInfoProps {
  form: UseFormReturn<InstitutionFormValues>;
  logoPreview: string | null;
  handleLogoChange: (files: FileList | null) => void;
}

export const StepInstitutionInfo: React.FC<StepInstitutionInfoProps> = ({ form, logoPreview, handleLogoChange }) => {
  return (
    <div className='space-y-5'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <FormField
          control={form.control}
          name='nom'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>Nom de l&apos;institution</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'institution" className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg' {...field} />
              </FormControl>
              <FormMessage className='text-red-500 text-xs' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>Type d&apos;institution</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'>
                    <SelectValue placeholder='Sélectionner un type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typeInstitutions.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className='text-red-500 text-xs' />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Décrivez l'institution financière" className='resize-none h-[100px] border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg' {...field} />
            </FormControl>
            <FormMessage className='text-red-500 text-xs' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='siteWeb'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>Site web</FormLabel>
            <FormControl>
              <Input placeholder='https://exemple.com' className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg' {...field} />
            </FormControl>
            <FormMessage className='text-red-500 text-xs' />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='logo'
        render={({ field: { onChange, value: _value, ...fieldProps } }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>Logo de l&apos;institution</FormLabel>
            <FormControl>
              <div className='flex flex-col'>
                <label className='border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-all'>
                  {logoPreview ? (
                    <div className='w-full h-32 flex items-center justify-center'>
                      <Image src={logoPreview} alt='Logo preview' width={128} height={128} className='max-h-full max-w-full object-contain' />
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-6'>
                      <div className='rounded-full bg-teal-50 p-3 mb-2'>
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                          <path d='M12 5V19M5 12H19' stroke='#0D9488' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                      </div>
                      <p className='text-sm font-medium text-teal-600'>Ajouter un logo</p>
                      <p className='text-xs text-gray-500 mt-1'>Formats JPG, JPEG ou PNG, max 5 Mo</p>
                    </div>
                  )}
                  <Input
                    type='file'
                    accept='image/jpeg,image/jpg,image/png'
                    className='hidden'
                    {...fieldProps}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const files = e.target.files;
                      onChange(files ?? null);
                      handleLogoChange(files ?? null);
                    }}
                  />
                </label>
              </div>
            </FormControl>
            <FormMessage className='text-red-500 text-xs' />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StepInstitutionInfo;
