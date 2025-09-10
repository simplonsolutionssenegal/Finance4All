'use client';

// Imports externes
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Composants UI
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Liste des régions du Cameroun
const regions = [
  { value: 'national', label: 'Couverture sur tout le territoire national' },
  { value: 'bceao', label: 'Couverture zone BCEAO' },
  { value: 'dakar', label: 'Couverture de Dakar' },
  { value: 'centre', label: 'Couverture Centre du pays' },
  { value: 'international', label: 'Couverture internationale' },
];

// Liste des types d'institutions
const typeInstitutions = [
  { value: 'banque', label: 'Banque' },
  { value: 'microfinance', label: 'Microfinance' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'autre', label: 'Autre' },
];

// Amélioration du schéma de validation
const formSchema = z.object({
  nom: z.string().min(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  }),
  type: z.string({
    required_error: "Veuillez sélectionner un type d'institution.",
  }),
  description: z.string().min(10, {
    message: 'La description doit contenir au moins 10 caractères.',
  }),
  siteWeb: z.string().url({
    message: 'Veuillez saisir une URL valide.',
  }),
  logo: z
    .any()
    .optional()
    .refine(files => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, {
      message: `La taille maximale du fichier est de 5MB.`,
    })
    .refine(files => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), {
      message: 'Seuls les formats .jpg, .jpeg et .png sont acceptés.',
    }),
  contactNom: z
    .string()
    .min(2, {
      message: 'Le nom du contact doit contenir au moins 2 caractères.',
    })
    .optional(),
  contactEmail: z
    .string()
    .email({
      message: 'Veuillez saisir une adresse email valide.',
    })
    .optional(),
  contactTelephone: z
    .string()
    .min(8, {
      message: 'Veuillez saisir un numéro de téléphone valide.',
    })
    .optional(),
  regionsDesservies: z
    .array(z.string())
    .min(1, {
      message: 'Veuillez sélectionner au moins une région.',
    })
    .optional(),
});

export type InstitutionFormValues = z.infer<typeof formSchema>;

export interface AddInstitutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInstitutionDialog({ open, onOpenChange }: Readonly<AddInstitutionDialogProps>) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Define type-safe resolver with explicit typing
  const form = useForm<InstitutionFormValues>({
    // Type assertion needed due to compatibility issues between Zod schema types
    // and the expected types for zodResolver - this is a common pattern when using zod with react-hook-form
    resolver: zodResolver(formSchema as any), 
    defaultValues: {
      nom: '',
      type: '',
      description: '',
      siteWeb: 'https://',
      contactNom: '',
      contactEmail: '',
      contactTelephone: '',
      regionsDesservies: [],
    },
    mode: 'onChange',
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  function onSubmit(_values: InstitutionFormValues) {
    // Envoyer les données à l'API (à implémenter par l'équipe back-end)
    // En attendant, on simule la sauvegarde avec un toast
    toast.success('Institution financière ajoutée avec succès');
    onOpenChange(false);
    form.reset();
    setLogoPreview(null);
    setSelectedRegions([]);
    setCurrentStep(1);
  }

  const handleLogoChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(current => {
      const isSelected = current.includes(region);
      let newRegions;

      if (isSelected) {
        newRegions = current.filter(r => r !== region);
      } else {
        newRegions = [...current, region];
      }

      form.setValue('regionsDesservies', newRegions);
      return newRegions;
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) {
          form.reset();
          setLogoPreview(null);
          setSelectedRegions([]);
          setCurrentStep(1);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden'>
        <DialogTitle className="sr-only">Ajouter une institution financière</DialogTitle>
        <DialogDescription className="sr-only">Formulaire d'ajout d'une institution financière</DialogDescription>
        {/* Header unifié avec titre et étapes */}
        <div className='bg-black text-white'>
          {/* En-tête principal */}
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-700'>
            <h2 className='text-2xl font-bold'>Ajouter une institution</h2>
            <button
              onClick={() => onOpenChange(false)}
              className='rounded-full p-1.5 hover:bg-white/10 transition-colors'
              aria-label='Fermer'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M18 6L6 18'
                  stroke='#fff'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M6 6L18 18'
                  stroke='#fff'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>

          {/* Sous-titre et indicateur de progression */}
          <div className='px-5 py-3'>
            <h3 className='text-lg font-medium mb-3'>
              {currentStep === 1 && "Informations de l'institution"}
              {currentStep === 2 && 'Informations de contact'}
              {currentStep === 3 && 'Zones de couverture'}
            </h3>

            {/* Indicateur de progression */}
            <div className='flex justify-between px-6 py-1 relative'>
              {[1, 2, 3].map(step => {
                // Détermine la classe pour l'étape en cours
                let stepClass = 'bg-gray-700 border-gray-600 text-gray-300';
                if (step < currentStep) {
                  stepClass = 'bg-teal-500 border-teal-500 text-white';
                } else if (step === currentStep) {
                  stepClass = 'bg-white border-white text-black font-medium';
                }

                // Détermine le label de l'étape
                let stepLabel = 'Zones';
                if (step === 1) {
                  stepLabel = 'Informations';
                } else if (step === 2) {
                  stepLabel = 'Contact';
                }

                return (
                  <div key={step} className='flex flex-col items-center z-10'>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${stepClass}`}
                    >
                      {step < currentStep ? <Check className='w-4 h-4' /> : step}
                    </div>
                    <span
                      className={`text-xs mt-1 ${currentStep === step ? 'text-white font-medium' : 'text-gray-300'}`}
                    >
                      {stepLabel}
                    </span>
                  </div>
                );
              })}

              {/* Ligne de progression */}
              <div className='absolute left-0 right-0 top-4 h-[2px] bg-gray-700 -z-0 mx-10' />
            </div>
          </div>
        </div>

        <div className='px-6 py-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              {/* Étape 1: Informations principales */}
              {currentStep === 1 && (
                <div className='space-y-5'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <FormField
                      control={form.control}
                      name='nom'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium text-gray-700'>
                            Nom de l&apos;institut
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Société générale'
                              className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'
                              {...field}
                            />
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
                          <FormLabel className='text-sm font-medium text-gray-700'>
                            Type d&apos;institution
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'>
                                <SelectValue placeholder='Sélectionner un type' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typeInstitutions.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
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
                        <FormLabel className='text-sm font-medium text-gray-700'>
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez l'institution financière"
                            className='resize-none h-[100px] border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'
                            {...field}
                          />
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
                        <FormLabel className='text-sm font-medium text-gray-700'>
                          Site web
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://exemple.com'
                            className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='text-red-500 text-xs' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='logo'
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium text-gray-700'>
                          Logo de l&apos;institution
                        </FormLabel>
                        <FormControl>
                          <div className='flex flex-col'>
                            <label className='border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-all'>
                              {logoPreview ? (
                                <div className='w-full h-32 flex items-center justify-center'>
                                  <Image
                                    src={logoPreview}
                                    alt='Logo preview'
                                    width={128}
                                    height={128}
                                    className='max-h-full max-w-full object-contain'
                                  />
                                </div>
                              ) : (
                                <div className='flex flex-col items-center justify-center py-6'>
                                  <div className='rounded-full bg-teal-50 p-3 mb-2'>
                                    <svg
                                      width='24'
                                      height='24'
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      xmlns='http://www.w3.org/2000/svg'
                                    >
                                      <path
                                        d='M12 5V19M5 12H19'
                                        stroke='#0D9488'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                    </svg>
                                  </div>
                                  <p className='text-sm font-medium text-teal-600'>
                                    Ajouter un logo
                                  </p>
                                  <p className='text-xs text-gray-500 mt-1'>
                                    Formats JPG, JPEG ou PNG, max 5 Mo
                                  </p>
                                </div>
                              )}
                              <Input
                                type='file'
                                accept='image/jpeg,image/jpg,image/png'
                                className='hidden'
                                onChange={e => {
                                  onChange(e.target.files);
                                  handleLogoChange(e.target.files);
                                }}
                                {...fieldProps}
                              />
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className='text-red-500 text-xs' />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Étape 2: Informations de contact */}
              {currentStep === 2 && (
                <div className='space-y-5'>
                  <div className='mb-4'>
                    <h3 className='text-lg font-semibold text-gray-800'>Informations de contact</h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Ces informations permettront aux utilisateurs de contacter l&apos;institution
                      (tous les champs sont optionnels)
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name='contactNom'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium text-gray-700'>
                          Nom du contact{' '}
                          <span className='text-gray-400 font-normal'>(optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Nom complet'
                            className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'
                            {...field}
                          />
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
                            <Input
                              placeholder='contact@exemple.com'
                              className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'
                              {...field}
                            />
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
                            <Input
                              placeholder='+237 XXX XXX XXX'
                              className='border-gray-200 focus:border-teal-500 focus:ring-teal-100 rounded-lg'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Étape 3: Zones géographiques */}
              {currentStep === 3 && (
                <div className='space-y-5'>
                  <div className='mb-4'>
                    <h3 className='text-lg font-semibold text-gray-800'>Couverture géographique</h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Sélectionnez les régions couvertes par cette institution
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name='regionsDesservies'
                    render={() => (
                      <FormItem>
                        <div className='flex flex-wrap gap-2 mb-4'>
                          {selectedRegions.map(region => {
                            const regionLabel = regions.find(r => r.value === region)?.label;
                            return (
                              <Badge
                                key={region}
                                className='rounded-full py-1.5 px-3 bg-teal-50 text-teal-700 hover:bg-teal-100 border-0'
                              >
                                {regionLabel}
                                <button
                                  type='button'
                                  className='ml-1.5 text-teal-500 hover:text-teal-700 focus:outline-none'
                                  onClick={() => toggleRegion(region)}
                                >
                                  ✕
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                        <FormControl>
                          <div className='grid grid-cols-2 gap-3'>
                            {regions.map(region => {
                              const isSelected = selectedRegions.includes(region.value);
                              return (
                                <button
                                  type='button'
                                  key={region.value}
                                  onClick={() => toggleRegion(region.value)}
                                  aria-pressed={isSelected}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all text-left ${
                                    isSelected
                                      ? 'bg-teal-50 border-teal-300'
                                      : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className='flex items-center'>
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                        isSelected
                                          ? 'border-teal-500 bg-teal-500'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {isSelected && <Check className='w-3 h-3 text-white' />}
                                    </div>
                                    <span
                                      className={`ml-2 text-sm ${
                                        isSelected ? 'font-medium text-teal-700' : 'text-gray-700'
                                      }`}
                                    >
                                      {region.label}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage className='text-red-500 text-xs mt-2' />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className='flex justify-between pt-5 border-t border-gray-100 mt-6'>
                {currentStep > 1 ? (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={prevStep}
                    className='border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg'
                  >
                    Précédent
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < totalSteps ? (
                  <Button
                    type='button'
                    onClick={nextStep}
                    className='bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg px-5'
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type='submit'
                    className='bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg px-5'
                  >
                    Enregistrer
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
