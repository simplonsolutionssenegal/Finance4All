'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { InstitutionFormFields } from './shared/InstitutionFormFields';
import { institutionSchema, type InstitutionFormData } from './shared/InstitutionFormSchema';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useCreateInstitution } from '@/hooks/institution/useCreateInstitution';
import { useUpdateInstitution } from '@/hooks/institution/useUpdateInstitution';
import type { Institution } from '@/types/Institution';

interface InstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refresh: () => void;
  institution?: Institution | null;
}

const InstitutionModal = ({ open, onOpenChange, refresh, institution }: InstitutionModalProps) => {
  const isEditMode = !!institution;
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<InstitutionFormData>({
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
    setCurrentStep(1);
  }, [institution, form, open]);

  const { isCreating, createInstitution } = useCreateInstitution({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      refresh();
      setCurrentStep(1);
    },
  });

  const { isUpdating, updateInstitution } = useUpdateInstitution({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      refresh();
      setCurrentStep(1);
    },
  });

  const onSubmit = (data: InstitutionFormData) => {
    if (isEditMode && institution) {
      updateInstitution({ id: institution.id, data });
    } else {
      createInstitution(data);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  const canGoToStep2 = () => {
    const { name, type } = form.getValues();
    return name && name.length >= 2 && type;
  };

  const canGoToStep3 = () => {
    const { description, logoUrl } = form.getValues();
    return description && description.length >= 10 && (!logoUrl || !form.formState.errors.logoUrl);
  };

  const handleNext = () => {
    if (currentStep === 1 && canGoToStep2()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canGoToStep3()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Informations de base',
      subtitle: 'Nom et type',
    },
    {
      number: 2,
      title: 'Détails',
      subtitle: 'Logo et description',
    },
    {
      number: 3,
      title: 'Contact & Localisation',
      subtitle: 'Coordonnées et zones',
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!isSubmitting) {
          onOpenChange(o);
          if (!o) {
            form.reset();
            setCurrentStep(1);
          }
        }
      }}
    >
      <DialogContent
        className='
          w-[95vw] sm:w-[512px]
          p-0 bg-white
          rounded-xl shadow-xl border border-gray-200
          max-h-[600px] overflow-hidden flex flex-col
        '
      >
        <DialogHeader className='items-start p-6 pb-4'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center'>
              <Building2 className='w-6 h-6 text-primary-300' strokeWidth={2} />
            </div>
            <DialogTitle className='text-xl font-semibold text-tertiary-400'>
              Nouvelle institution
            </DialogTitle>
          </div>
          <p className='text-sm text-tertiary-400/60'>
            Créez une nouvelle institution financière sur la plateforme
          </p>
        </DialogHeader>

        {/* Stepper */}
        <div className='px-6 pt-1 pb-1'>
          <div className='flex items-start justify-between'>
            {steps.map(step => {
              const isActive = currentStep >= step.number;
              const isCompleted = currentStep > step.number;
              const stepTextClass = isActive ? 'text-white' : 'text-tertiary-400/60';
              const stepBgStyle = isActive
                ? { backgroundColor: 'var(--primary-300)', border: '1px solid transparent' }
                : { backgroundColor: undefined, border: '1px solid var(--primary-400)' };

              return (
                <div
                  key={step.number}
                  className='flex flex-col items-center'
                  style={{ width: '30%' }}
                >
                  <div className='flex flex-col items-center mb-2'>
                    <div
                      className={
                        'w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base transition-all'
                      }
                      style={stepBgStyle}
                    >
                      <div className={stepTextClass}>
                        {isCompleted ? <Check className='w-5 h-5' /> : step.number}
                      </div>
                    </div>
                  </div>
                  <div className='text-center'>
                    <p
                      className={`text-sm font-medium ${isActive ? 'text-primary-300' : 'text-tertiary-400/60'}`}
                    >
                      {step.title}
                    </p>
                    <p className='text-xs text-tertiary-400/60 mt-0.5'>{step.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex-1 overflow-y-auto'>
            <div className='px-6 pb-6 space-y-4'>
              {/* Étape 1: Informations de base */}
              {currentStep === 1 && (
                <div className='space-y-4'>
                  <InstitutionFormFields
                    control={form.control}
                    watch={form.watch}
                    errors={form.formState.errors}
                    disabled={isSubmitting}
                    variant='compact'
                    step={1}
                  />
                </div>
              )}

              {/* Étape 2: Détails */}
              {currentStep === 2 && (
                <div className='space-y-4'>
                  <InstitutionFormFields
                    control={form.control}
                    watch={form.watch}
                    errors={form.formState.errors}
                    disabled={isSubmitting}
                    variant='compact'
                    step={2}
                  />
                </div>
              )}

              {/* Étape 3: Contact & Localisation */}
              {currentStep === 3 && (
                <div className='space-y-4'>
                  <InstitutionFormFields
                    control={form.control}
                    watch={form.watch}
                    errors={form.formState.errors}
                    disabled={isSubmitting}
                    variant='compact'
                    step={3}
                  />
                </div>
              )}
            </div>

            <DialogFooter className='sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl'>
              <div className='flex w-full justify-between items-center'>
                {currentStep > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    className='h-9 px-4 py-2 rounded-[10px] hover:bg-gray-100 flex items-center gap-2 text-tertiary-400'
                    style={{ borderWidth: '0.8px', borderColor: '#DEE2E6' }}
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className='w-4 h-4' />
                    Retour
                  </Button>
                )}

                <div className={`flex gap-3 ${currentStep === 1 ? 'ml-auto' : ''}`}>
                  <Button
                    type='button'
                    variant='ghost'
                    className='h-9 px-4 py-2 rounded-[10px] hover:bg-gray-100 text-tertiary-400'
                    onClick={() => !isSubmitting && onOpenChange(false)}
                  >
                    Annuler
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type='button'
                      className='h-9 px-4 py-2 rounded-[10px] text-white hover:opacity-95 flex items-center gap-2'
                      style={{ backgroundColor: 'var(--primary-400)' }}
                      onClick={handleNext}
                      disabled={
                        isSubmitting ||
                        (currentStep === 1 && !canGoToStep2()) ||
                        (currentStep === 2 && !canGoToStep3())
                      }
                    >
                      Suivant
                      <ArrowRight className='w-4 h-4' />
                    </Button>
                  ) : (
                    <Button
                      type='submit'
                      disabled={isSubmitting || !form.formState.isValid}
                      className='h-9 px-4 py-2 rounded-[10px] bg-green-500 text-white hover:bg-green-600 flex items-center gap-2'
                    >
                      <Check className='w-4 h-4' />
                      {isSubmitting ? 'Création...' : "Créer l'institution"}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionModal;
