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
  step?: number;
}

// Types pour les styles conditionnels
type StyleConfig = {
  input: string;
  textarea: string;
  button: string;
  label: string;
  dropdown: string;
};

const STYLE_CONFIGS: Record<'default' | 'compact', StyleConfig> = {
  compact: {
    input:
      'h-9 rounded-[10px] px-3 py-1 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)]',
    textarea:
      'h-16 rounded-[10px] px-3 py-2 bg-[#F8F9FA] border border-transparent placeholder:text-tertiary-400/60 focus-visible:border-[var(--primary-300)] focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-[var(--primary-300)] resize-none',
    button:
      'w-full h-9 px-3 py-1 justify-between rounded-[10px] bg-[#F8F9FA] border text-left font-normal',
    label: 'text-sm font-medium text-tertiary-400',
    dropdown:
      'hover:bg-[var(--primary-300)] hover:text-white focus:bg-[var(--primary-300)] focus:text-white',
  },
  default: {
    input:
      'h-11 rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
    textarea:
      'rounded-md border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none',
    button:
      'w-full h-11 px-3 justify-between rounded-md border-gray-300 bg-white hover:bg-gray-50 text-left font-normal',
    label: 'text-sm font-medium text-gray-700',
    dropdown: 'hover:bg-primary-300 hover:text-white focus:bg-primary-300 focus:text-white',
  },
};

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

  const styles = STYLE_CONFIGS[variant];
  const isCompact = variant === 'compact';

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

  // Composant Name Field
  const NameField = () => (
    <FormField
      control={control}
      name='name'
      render={({ field }) => (
        <FormItem>
          <FormLabel className={styles.label}>Nom de l&apos;institution *</FormLabel>
          <FormControl>
            <Input
              placeholder='Ex: Orange Money'
              className={styles.input}
              style={isCompact ? { borderWidth: '0.8px' } : undefined}
              {...field}
              disabled={disabled}
            />
          </FormControl>
          {isCompact && errors.name?.message && (
            <p className='text-sm text-red-600 mt-1'>{String(errors.name.message)}</p>
          )}
          {!isCompact && <FormMessage />}
        </FormItem>
      )}
    />
  );

  // Composant Type Field
  const TypeField = () => (
    <FormField
      control={control}
      name='type'
      render={({ field }) => (
        <FormItem>
          <FormLabel className={styles.label}>Type *</FormLabel>
          <FormControl>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className={styles.button}
                  style={isCompact ? { borderWidth: '0.8px', borderColor: '#00000000' } : undefined}
                  disabled={disabled}
                >
                  <span className={isCompact ? 'truncate text-tertiary-400' : ''}>
                    {field.value
                      ? INSTITUTION_TYPES[field.value]
                      : isCompact
                        ? 'Banque'
                        : 'Sélectionner un type'}
                  </span>
                  <ChevronDown className='w-4 h-4 ml-2 opacity-50' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-full min-w-[200px] bg-white border border-gray-200 shadow-lg'
              >
                {!isCompact && (
                  <>
                    <DropdownMenuItem
                      onClick={() => field.onChange('')}
                      className={`cursor-pointer ${styles.dropdown}`}
                    >
                      Sélectionner un type
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {Object.entries(INSTITUTION_TYPES).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => field.onChange(value)}
                    className={`cursor-pointer ${styles.dropdown}`}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </FormControl>
          {isCompact && errors.type?.message && (
            <p className='text-sm text-red-600 mt-1'>{String(errors.type.message)}</p>
          )}
          {!isCompact && <FormMessage />}
        </FormItem>
      )}
    />
  );

  // Composant Country Field
  const CountryField = () => (
    <FormField
      control={control}
      name='pays'
      render={({ field }) => (
        <FormItem>
          <FormLabel className={styles.label}>Pays *</FormLabel>
          <FormControl>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className={styles.button}
                  style={isCompact ? { borderWidth: '0.8px', borderColor: '#00000000' } : undefined}
                  disabled={disabled}
                >
                  <div
                    className={`flex items-center gap-2 ${isCompact ? 'text-tertiary-400' : ''}`}
                  >
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
                {!isCompact && (
                  <>
                    <DropdownMenuItem
                      onClick={() => field.onChange('')}
                      className={`cursor-pointer ${styles.dropdown}`}
                    >
                      Sélectionner un pays
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {Object.entries(COUNTRIES).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => field.onChange(value)}
                    className={`cursor-pointer ${styles.dropdown}`}
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
          {isCompact && errors.pays?.message && (
            <p className='text-sm text-red-600 mt-1'>{String(errors.pays.message)}</p>
          )}
          {!isCompact && <FormMessage />}
        </FormItem>
      )}
    />
  );

  // Composant Logo Field
  const LogoField = () => (
    <FormField
      control={control}
      name='logoUrl'
      render={({ field }) => (
        <FormItem>
          <FormLabel className={styles.label}>
            {isCompact ? 'URL du logo' : 'Logo (emoji ou URL)'}
          </FormLabel>
          <FormControl>
            <div className={isCompact ? 'space-y-3' : ''}>
              <Input
                type='text'
                placeholder={isCompact ? 'https://example.com/logo.png' : '🏦 ou https://'}
                className={styles.input}
                style={isCompact ? { borderWidth: '0.8px' } : undefined}
                {...field}
                disabled={disabled}
              />
              {isCompact && sanitizedLogoUrl && !errors.logoUrl && (
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
          {isCompact && errors.logoUrl?.message && (
            <p className='text-sm text-red-600 mt-1'>{String(errors.logoUrl.message)}</p>
          )}
          {!isCompact && <FormMessage />}
        </FormItem>
      )}
    />
  );

  // Composant Description Field
  const DescriptionField = () => (
    <FormField
      control={control}
      name='description'
      render={({ field }) => (
        <FormItem>
          <FormLabel className={styles.label}>Description *</FormLabel>
          <FormControl>
            <Textarea
              rows={3}
              placeholder="Description de l'institution"
              className={styles.textarea}
              style={isCompact ? { borderWidth: '0.8px' } : undefined}
              {...field}
              disabled={disabled}
            />
          </FormControl>
          {isCompact && errors.description?.message && (
            <p className='text-sm text-red-600 mt-1'>{String(errors.description.message)}</p>
          )}
          {!isCompact && <FormMessage />}
        </FormItem>
      )}
    />
  );

  // Composant Website Field
  const WebsiteField = () => (
    <FormField
      control={control}
      name='website'
      render={({ field }) => (
        <FormItem className={isCompact ? 'self-start' : ''}>
          <FormLabel className={styles.label}>Site web</FormLabel>
          <FormControl>
            <Input
              placeholder={isCompact ? 'https://www.example.com' : 'https://'}
              className={styles.input}
              style={isCompact ? { borderWidth: '0.8px' } : undefined}
              {...field}
              disabled={disabled}
            />
          </FormControl>
          {isCompact && errors.website?.message && (
            <p className='text-sm text-red-600 mt-1'>{String(errors.website.message)}</p>
          )}
          {!isCompact && <FormMessage />}
        </FormItem>
      )}
    />
  );

  // Composant Zones Field
  const ZonesField = () => (
    <FormField
      control={control}
      name='geographicZones'
      render={({ field }) => (
        <FormItem className={isCompact ? 'self-start' : ''}>
          <FormLabel className={styles.label}>
            {isCompact ? 'Zones de couverture *' : 'Zones couvertes'}
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
                  placeholder={isCompact ? 'Ex: Dakar, Thiès...' : 'Sélectionner une zone'}
                  className={isCompact ? `${styles.input} pr-20` : `${styles.input} pr-9`}
                  style={isCompact ? { borderWidth: '0.8px' } : undefined}
                  disabled={disabled}
                />
                {isCompact ? (
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
                ) : (
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
                )}
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
                      className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${styles.dropdown}`}
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
          {isCompact && errors.geographicZones?.message && (
            <p className='text-sm text-red-600 mt-1'>{String(errors.geographicZones.message)}</p>
          )}
          {!isCompact && <FormMessage />}
        </FormItem>
      )}
    />
  );

  // Logo preview pour variant default
  const LogoPreview = () => {
    if (!isCompact && sanitizedLogoUrl && !errors.logoUrl) {
      return (
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
      );
    }
    return null;
  };

  // Rendu conditionnel basé sur les étapes
  if (step !== undefined && isCompact) {
    // Mode avec étapes (InstitutionModal)
    if (step === 1) {
      return (
        <>
          <NameField />
          <TypeField />
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <LogoField />
          <DescriptionField />
          <WebsiteField />
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <CountryField />
          <ZonesField />
        </>
      );
    }
  }

  // Mode compact sans étapes (EditInstitutionModal)
  if (isCompact && step === undefined) {
    return (
      <>
        <NameField />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-start'>
          <TypeField />
          <CountryField />
        </div>
        <LogoField />
        <DescriptionField />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-start'>
          <WebsiteField />
          <ZonesField />
        </div>
      </>
    );
  }

  // Mode default (variante par défaut)
  return (
    <>
      <NameField />
      <div className='grid grid-cols-2 gap-4'>
        <TypeField />
        <CountryField />
      </div>
      <DescriptionField />
      <LogoField />
      <WebsiteField />
      <ZonesField />
      <LogoPreview />
    </>
  );
};
