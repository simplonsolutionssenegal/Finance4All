"use client";

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { createInstitution, type InstitutionCreatedResponse } from '@/lib/api/institutions';

import { StepProgressIndicator } from './step-progress-indicator';
import { StepContactInfo } from './steps/StepContactInfo';
import { StepInstitutionInfo } from './steps/StepInstitutionInfo';
import { StepRegionsCoverage } from './steps/StepRegionsCoverage';
import { formSchema, type InstitutionFormValues } from './validation-schema';

export interface AddInstitutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (institution: InstitutionCreatedResponse) => void;
}

export function AddInstitutionDialog({ open, onOpenChange, onCreated }: Readonly<AddInstitutionDialogProps>) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;

  // Resolver custom (évite d'utiliser zodResolver avec FileList)
  const resolver: Resolver<InstitutionFormValues> = async values => {
    const parsed = formSchema.safeParse(values);
    if (parsed.success) return { values: parsed.data, errors: {} };
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors = Object.entries(flat).reduce<Record<string, { type: string; message?: string }>>(
      (acc, [key, messages]) => {
        if (messages?.length) acc[key] = { type: 'validation', message: messages[0] };
        return acc;
      },
      {}
    );
    return { values: {} as InstitutionFormValues, errors: fieldErrors };
  };

  const form = useForm<InstitutionFormValues>({
    resolver,
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

  const nextStep = () => currentStep < totalSteps && setCurrentStep(s => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  async function onSubmit(values: InstitutionFormValues) {
    try {
      setIsSubmitting(true);
      const created = await createInstitution(values);
      onCreated?.(created);
      toast.success('Institution financière ajoutée avec succès');
      internalClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue lors de la création';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleLogoChange = (files: FileList | null) => {
    if (files?.length) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      setLogoPreview(null);
    }
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(curr => {
      const next = curr.includes(region) ? curr.filter(r => r !== region) : [...curr, region];
      form.setValue('regionsDesservies', next, { shouldValidate: true, shouldDirty: true });
      return next;
    });
  };

  // Centralise le reset pour usage commun (fermeture manuelle + onOpenChange)
  const resetDialogState = () => {
    form.reset();
    setLogoPreview(null);
    setSelectedRegions([]);
    setCurrentStep(1);
  };

  const internalClose = () => {
    // Utilise désormais la logique centralisée pour fermer et reset
    handleOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetDialogState();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden'>
        {/* Header */}
        <div className='bg-black text-white'>
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-700'>
            <DialogTitle asChild>
              <h2 className='text-2xl font-bold'>Ajouter une institution</h2>
            </DialogTitle>
            <button
              type='button'
              onClick={internalClose}
              className='rounded-full p-1.5 hover:bg-white/10 transition-colors'
              aria-label='Fermer'
              title='Fermer'
            >
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                <path d='M18 6L6 18' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M6 6L18 18' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </button>
          </div>

          {/* Sous-titre + progression */}
          <div className='px-5 py-3'>
            <h3 className='text-lg font-medium mb-3'>
              {currentStep === 1 && "Informations de l'institution"}
              {currentStep === 2 && 'Informations de contact'}
              {currentStep === 3 && 'Zones de couverture'}
            </h3>
            <DialogDescription className='sr-only'>
              Formulaire multi-étapes pour ajouter une institution financière.
            </DialogDescription>

            <StepProgressIndicator currentStep={currentStep} />
          </div>
        </div>

        {/* Body */}
        <div className='px-6 py-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              {/* Étape 1 */}
              {currentStep === 1 && (
                <StepInstitutionInfo form={form} logoPreview={logoPreview} handleLogoChange={handleLogoChange} />
              )}

              {currentStep === 2 && (
                <StepContactInfo form={form} />
              )}

              {currentStep === 3 && (
                <StepRegionsCoverage form={form} selectedRegions={selectedRegions} toggleRegion={toggleRegion} />
              )}

              <div className='flex justify-between pt-5 border-t border-gray-100 mt-6'>
                {currentStep > 1 ? (
                  <Button type='button' variant='outline' onClick={prevStep} className='border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg'>
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
                    disabled={isSubmitting}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg px-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
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
