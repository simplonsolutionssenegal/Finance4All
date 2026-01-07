'use client';

import { ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Control, FieldErrors, UseFormWatch } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  AVAILABLE_ZONES,
  COUNTRIES,
  INSTITUTION_TYPES,
  COUNTRY_FLAGS,
  removeZone,
  type InstitutionFormData,
} from './InstitutionFormSchema';

interface InstitutionFormFieldsProps {
  control: Control<InstitutionFormData>;
  watch: UseFormWatch<InstitutionFormData>;
  errors: FieldErrors<InstitutionFormData>;
  disabled?: boolean;
  variant?: 'default' | 'compact';
  step?: number; // Nouvelle prop pour gérer les étapes
}

export const InstitutionFormFields = ({
  control,
  watch,
  errors,
  disabled = false,
  variant = 'default',
  step,
}: InstitutionFormFieldsProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchZone, setSearchZone] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const logoUrl = watch('logoUrl');
  const sanitizedLogoUrl = typeof logoUrl === 'string' ? logoUrl.trim() : logoUrl;
  const selectedZones = watch('geographicZones') || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredZones = AVAILABLE_ZONES.filter(
    zone => zone.toLowerCase().includes(searchZone.toLowerCase()) && !selectedZones.includes(zone)
  );

  const isCompact = variant === 'compact';

  // Gestion des étapes
  if (step !== undefined && isCompact) {
    // Étape 1: Nom et Type
    if (step === 1) {
      return (
        <>
          <FormField
            control={control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>
                  Nom de l&apos;institution *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ex: Orange Money'
                    className='h-9 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)]'
                    style={{ borderWidth: '0.8px' }}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                {errors.name?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.name.message)}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>Type *</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full h-9 px-3 py-1 justify-between rounded-[10px] bg-[#F8F9FA] border text-left font-normal'
                        style={{ borderWidth: '0.8px', borderColor: '#00000000' }}
                        disabled={disabled}
                      >
                        <span className='truncate text-tertiary-400'>
                          {field.value ? INSTITUTION_TYPES[field.value] : 'Banque'}
                        </span>
                        <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-full min-w-[200px] bg-white border border-gray-200 shadow-lg'
                    >
                      {Object.entries(INSTITUTION_TYPES).map(([value, label]) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => field.onChange(value)}
                          className='cursor-pointer hover:bg-[var(--primary-300)] hover:text-white focus:bg-[var(--primary-300)] focus:text-white'
                        >
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                {errors.type?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.type.message)}</p>
                )}
              </FormItem>
            )}
          />
        </>
      );
    }

    // Étape 2: Logo, Description, Website
    if (step === 2) {
      return (
        <>
          <FormField
            control={control}
            name='logoUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>URL du logo</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='https://example.com/logo.png'
                    className='h-9 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)]'
                    style={{ borderWidth: '0.8px' }}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                {errors.logoUrl?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.logoUrl.message)}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>
                  Description *
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Description de l'institution"
                    className='h-16 rounded-[10px] px-3 py-2 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)] resize-none'
                    style={{ borderWidth: '0.8px' }}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                {errors.description?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.description.message)}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='website'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>Site web</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://www.example.com'
                    className='h-9 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)] placeholder:text-tertiary-400/60'
                    style={{ borderWidth: '0.8px' }}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                {errors.website?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.website.message)}</p>
                )}
              </FormItem>
            )}
          />

          {sanitizedLogoUrl && !errors.logoUrl && (
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
        </>
      );
    }

    // Étape 3: Pays et Zones
    if (step === 3) {
      return (
        <>
          <FormField
            control={control}
            name='pays'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>Pays *</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full h-9 px-3 py-1 justify-between rounded-[10px] bg-[#F8F9FA] border text-left font-normal'
                        style={{ borderWidth: '0.8px', borderColor: '#00000000' }}
                        disabled={disabled}
                      >
                        <div className='flex items-center gap-2 text-tertiary-400'>
                          {field.value ? (
                            <>
                              <span className='mr-2'>{COUNTRY_FLAGS[field.value]}</span>
                              {COUNTRIES[field.value]}
                            </>
                          ) : (
                            'Sélectionner un pays'
                          )}
                        </div>
                        <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-full min-w-[200px] bg-white border border-gray-200 shadow-lg'
                    >
                      {Object.entries(COUNTRIES).map(([value, label]) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => field.onChange(value)}
                          className='cursor-pointer hover:bg-[var(--primary-300)] hover:text-white focus:bg-[var(--primary-300)] focus:text-white'
                        >
                          <span className='mr-2'>
                            {COUNTRY_FLAGS[value as keyof typeof COUNTRY_FLAGS]}
                          </span>
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                {errors.pays?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.pays.message)}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='geographicZones'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>
                  Zones de couverture *
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
                        placeholder='Ex: Dakar, Thiès...'
                        className='h-9 pr-20 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)]'
                        style={{ borderWidth: '0.8px' }}
                        disabled={disabled}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        className='absolute right-1 h-9 px-4 py-2 rounded-[10px] bg-white text-sm font-medium'
                        style={{ borderWidth: '0.8px', borderColor: '#DEE2E6' }}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={disabled}
                      >
                        Ajouter
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
                            className='w-full text-left px-4 py-2.5 hover:bg-[var(--primary-300)] hover:text-white focus:bg-[var(--primary-300)] focus:text-white text-sm cursor-pointer transition-colors'
                          >
                            {zone}
                          </button>
                        ))
                      ) : (
                        <div className='px-4 py-2.5 text-sm text-gray-500'>Aucune zone trouvée</div>
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
                        onClick={() => !disabled && field.onChange(removeZone(field.value, zone))}
                      >
                        {zone}
                        <X className='w-3.5 h-3.5' />
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.geographicZones?.message && (
                  <p className='text-sm text-red-600 mt-1'>
                    {String(errors.geographicZones.message)}
                  </p>
                )}
              </FormItem>
            )}
          />
        </>
      );
    }
  }

  // Version COMPACT sans étapes (pour EditInstitutionModal)
  if (isCompact && step === undefined) {
    return (
      <>
        {/* Name Field - COMPACT */}
        <FormField
          control={control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-tertiary-400'>
                Nom de l&apos;institution *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Ex: Orange Money'
                  className='h-9 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)]'
                  style={{ borderWidth: '0.8px' }}
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              {errors.name?.message && (
                <p className='text-sm text-red-600 mt-1'>{String(errors.name.message)}</p>
              )}
            </FormItem>
          )}
        />

        {/* Type and Country - COMPACT */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-start'>
          <FormField
            control={control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>Type *</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full h-9 px-3 py-1 justify-between rounded-[10px] bg-[#F8F9FA] border text-left font-normal'
                        style={{ borderWidth: '0.8px', borderColor: '#00000000' }}
                        disabled={disabled}
                      >
                        <span className='truncate text-tertiary-400'>
                          {field.value ? INSTITUTION_TYPES[field.value] : 'Banque'}
                        </span>
                        <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-full min-w-[200px] bg-white border border-gray-200 shadow-lg'
                    >
                      {Object.entries(INSTITUTION_TYPES).map(([value, label]) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => field.onChange(value)}
                          className='cursor-pointer hover:bg-[var(--primary-300)] hover:text-white focus:bg-[var(--primary-300)] focus:text-white'
                        >
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                {errors.type?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.type.message)}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='pays'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-tertiary-400'>Pays *</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full h-9 px-3 py-1 justify-between rounded-[10px] bg-[#F8F9FA] border text-left font-normal'
                        style={{ borderWidth: '0.8px', borderColor: '#00000000' }}
                        disabled={disabled}
                      >
                        <div className='flex items-center gap-2 text-tertiary-400'>
                          {field.value ? (
                            <>
                              <span className='mr-2'>{COUNTRY_FLAGS[field.value]}</span>
                              {COUNTRIES[field.value]}
                            </>
                          ) : (
                            'Sélectionner un pays'
                          )}
                        </div>
                        <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-full min-w-[200px] bg-white border border-gray-200 shadow-lg'
                    >
                      {Object.entries(COUNTRIES).map(([value, label]) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => field.onChange(value)}
                          className='cursor-pointer hover:bg-[var(--primary-300)] hover:text-white focus:bg-[var(--primary-300)] focus:text-white'
                        >
                          <span className='mr-2'>
                            {COUNTRY_FLAGS[value as keyof typeof COUNTRY_FLAGS]}
                          </span>
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                {errors.pays?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.pays.message)}</p>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Logo - COMPACT */}
        <FormField
          control={control}
          name='logoUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-tertiary-400'>URL du logo</FormLabel>
              <FormControl>
                <div className='space-y-3'>
                  <Input
                    type='text'
                    placeholder='https://example.com/logo.png'
                    className='h-9 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)]'
                    style={{ borderWidth: '0.8px' }}
                    {...field}
                    disabled={disabled}
                  />
                  {sanitizedLogoUrl && !errors.logoUrl && (
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
                  )}
                </div>
              </FormControl>
              {errors.logoUrl?.message && (
                <p className='text-sm text-red-600 mt-1'>{String(errors.logoUrl.message)}</p>
              )}
            </FormItem>
          )}
        />

        {/* Description - COMPACT */}
        <FormField
          control={control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-tertiary-400'>Description *</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Description de l'institution"
                  className='h-16 rounded-[10px] px-3 py-2 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)] resize-none'
                  style={{ borderWidth: '0.8px' }}
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              {errors.description?.message && (
                <p className='text-sm text-red-600 mt-1'>{String(errors.description.message)}</p>
              )}
            </FormItem>
          )}
        />

        {/* Website and Zones - COMPACT */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-start'>
          <FormField
            control={control}
            name='website'
            render={({ field }) => (
              <FormItem className='self-start'>
                <FormLabel className='text-sm font-medium text-tertiary-400'>Site web</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://www.example.com'
                    className='h-9 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)] placeholder:text-tertiary-400/60'
                    style={{ borderWidth: '0.8px' }}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                {errors.website?.message && (
                  <p className='text-sm text-red-600 mt-1'>{String(errors.website.message)}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='geographicZones'
            render={({ field }) => (
              <FormItem className='self-start'>
                <FormLabel className='text-sm font-medium text-tertiary-400'>
                  Zones de couverture *
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
                      placeholder='Ex: Dakar, Thiès...'
                      className='h-9 pr-20 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)]'
                      style={{ borderWidth: '0.8px' }}
                      disabled={disabled}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      className='absolute right-1 top-0 h-9 px-4 py-2 rounded-[10px] bg-white text-sm font-medium'
                      style={{ borderWidth: '0.8px', borderColor: '#DEE2E6' }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      disabled={disabled}
                    >
                      Ajouter
                    </Button>
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
                            className='w-full text-left px-4 py-2.5 hover:bg-[var(--primary-300)] hover:text-white focus:bg-[var(--primary-300)] focus:text-white text-sm cursor-pointer transition-colors'
                          >
                            {zone}
                          </button>
                        ))
                      ) : (
                        <div className='px-4 py-2.5 text-sm text-gray-500'>Aucune zone trouvée</div>
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
                        onClick={() => !disabled && field.onChange(removeZone(field.value, zone))}
                      >
                        {zone}
                        <X className='w-3.5 h-3.5' />
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.geographicZones?.message && (
                  <p className='text-sm text-red-600 mt-1'>
                    {String(errors.geographicZones.message)}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>
      </>
    );
  }

  // DEFAULT VARIANT (reste inchangé pour compatibilité)
  return (
    <>
      {/* Name Field - DEFAULT */}
      <FormField
        control={control}
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
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Type and Country - DEFAULT */}
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={control}
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
                      disabled={disabled}
                    >
                      {field.value ? INSTITUTION_TYPES[field.value] : 'Sélectionner un type'}
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
                    {Object.entries(INSTITUTION_TYPES).map(([value, label]) => (
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
          control={control}
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
                      disabled={disabled}
                    >
                      {field.value ? COUNTRIES[field.value] : 'Sélectionner un pays'}
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
                    {Object.entries(COUNTRIES).map(([value, label]) => (
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

      {/* Description - DEFAULT */}
      <FormField
        control={control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>Description *</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Description de l'institution"
                className='rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none'
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Logo - DEFAULT */}
      <FormField
        control={control}
        name='logoUrl'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>Logo (emoji ou URL)</FormLabel>
            <FormControl>
              <Input
                type='text'
                placeholder='🏦 ou https://'
                className='h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Website - DEFAULT */}
      <FormField
        control={control}
        name='website'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>Site web</FormLabel>
            <FormControl>
              <Input
                placeholder='https://'
                className='h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Zones - DEFAULT */}
      <FormField
        control={control}
        name='geographicZones'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-medium text-gray-700'>Zones couvertes</FormLabel>
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
                    disabled={disabled}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    className='absolute right-0 h-full px-3 hover:bg-transparent'
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={disabled}
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
                    <div className='px-4 py-2.5 text-sm text-gray-500'>Aucune zone trouvée</div>
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
                    onClick={() => !disabled && field.onChange(removeZone(field.value, zone))}
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

      {/* Logo preview - DEFAULT */}
      {sanitizedLogoUrl && !errors.logoUrl && (
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
    </>
  );
};
