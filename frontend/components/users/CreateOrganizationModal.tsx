'use client';

import { ArrowLeft, ArrowRight, Building2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateOrganization } from '@/hooks/organization/useCreateOrganization';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COUNTRIES = [
  { value: 'senegal', label: 'Sénégal' },
  { value: 'cameroun', label: 'Cameroun' },
];

export default function CreateOrganizationModal({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<CreateOrganizationModalProps>) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 fields
  const [orgName, setOrgName] = useState('');
  const [country, setCountry] = useState('');

  // Step 2 fields
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createOrganization, isCreating } = useCreateOrganization({
    onSuccess,
  });

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setOrgName('');
      setCountry('');
      setAdminFirstName('');
      setAdminLastName('');
      setAdminEmail('');
      setErrors({});
    }
  }, [isOpen]);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (orgName.trim().length < 2) {
      newErrors.orgName = 'Le nom doit contenir au moins 2 caractères';
    }
    if (!country) {
      newErrors.country = 'Veuillez sélectionner un pays';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adminFirstName.trim()) {
      newErrors.adminFirstName = 'Le prénom est requis';
    }
    if (!adminLastName.trim()) {
      newErrors.adminLastName = 'Le nom est requis';
    }
    if (!adminEmail.trim()) {
      newErrors.adminEmail = "L'email est requis";
    } else if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        adminEmail.trim()
      )
    ) {
      newErrors.adminEmail = 'Veuillez entrer un email valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setErrors({});
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    const result = await createOrganization({
      name: orgName.trim(),
      country,
      adminFirstName: adminFirstName.trim(),
      adminLastName: adminLastName.trim(),
      adminEmail: adminEmail.trim(),
    });

    if (result.success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  // Step indicator
  const stepIndicator = (
    <div className='flex items-center justify-center gap-3 py-2'>
      {[1, 2].map(step => {
        const isCompleted = currentStep > step;
        const isActive = currentStep === step;

        return (
          <div key={step} className='flex items-center gap-2'>
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                    ? 'bg-primary-300 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCompleted ? <Check className='size-4' /> : step}
            </div>
            <span
              className={`text-sm ${
                isActive || isCompleted ? 'font-medium text-gray-900' : 'text-gray-400'
              }`}
            >
              {step === 1 ? 'Organisation' : 'Administrateur'}
            </span>
            {step === 1 && <div className='mx-2 h-px w-8 bg-gray-300' />}
          </div>
        );
      })}
    </div>
  );

  // Step 1 content
  const step1Content = (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <label htmlFor='orgName' className='text-sm font-medium text-gray-700 block'>
          Nom de l&apos;organisation <span className='text-red-500'>*</span>
        </label>
        <Input
          id='orgName'
          placeholder="Nom de l'organisation"
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
          className='w-full bg-gray-50 border-0'
          disabled={isCreating}
        />
        {errors.orgName && <p className='text-sm text-red-500'>{errors.orgName}</p>}
      </div>

      <div className='space-y-2'>
        <label htmlFor='country' className='text-sm font-medium text-gray-700 block'>
          Pays <span className='text-red-500'>*</span>
        </label>
        <Select value={country} onValueChange={setCountry} disabled={isCreating}>
          <SelectTrigger id='country' className='w-full bg-gray-50 border-0 cursor-pointer'>
            <SelectValue placeholder='Sélectionner un pays' />
          </SelectTrigger>
          <SelectContent className='bg-white border-0 rounded-lg shadow-xl'>
            {COUNTRIES.map(c => (
              <SelectItem
                key={c.value}
                value={c.value}
                className='cursor-pointer hover:bg-gray-100'
              >
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && <p className='text-sm text-red-500'>{errors.country}</p>}
      </div>
    </div>
  );

  // Step 2 content
  const step2Content = (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <label htmlFor='adminFirstName' className='text-sm font-medium text-gray-700 block'>
            Prénom <span className='text-red-500'>*</span>
          </label>
          <Input
            id='adminFirstName'
            placeholder='Prénom'
            value={adminFirstName}
            onChange={e => setAdminFirstName(e.target.value)}
            className='w-full bg-gray-50 border-0'
            disabled={isCreating}
          />
          {errors.adminFirstName && <p className='text-sm text-red-500'>{errors.adminFirstName}</p>}
        </div>
        <div className='space-y-2'>
          <label htmlFor='adminLastName' className='text-sm font-medium text-gray-700 block'>
            Nom <span className='text-red-500'>*</span>
          </label>
          <Input
            id='adminLastName'
            placeholder='Nom'
            value={adminLastName}
            onChange={e => setAdminLastName(e.target.value)}
            className='w-full bg-gray-50 border-0'
            disabled={isCreating}
          />
          {errors.adminLastName && <p className='text-sm text-red-500'>{errors.adminLastName}</p>}
        </div>
      </div>

      <div className='space-y-2'>
        <label htmlFor='adminEmail' className='text-sm font-medium text-gray-700 block'>
          Email <span className='text-red-500'>*</span>
        </label>
        <Input
          id='adminEmail'
          type='email'
          placeholder='email@example.com'
          value={adminEmail}
          onChange={e => setAdminEmail(e.target.value)}
          className='w-full bg-gray-50 border-0'
          disabled={isCreating}
        />
        {errors.adminEmail && <p className='text-sm text-red-500'>{errors.adminEmail}</p>}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg border-0 rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
            <Building2 className='size-5' />
            Créer une organisation partenaire
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-600'>
            Configurez l&apos;organisation et son administrateur en 2 étapes
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {stepIndicator}

          {currentStep === 1 ? step1Content : step2Content}

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              onClick={handleClose}
              variant='outline'
              className='border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              disabled={isCreating}
            >
              Annuler
            </Button>

            {currentStep === 2 && (
              <Button
                onClick={handleBack}
                variant='outline'
                className='border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                disabled={isCreating}
              >
                <ArrowLeft className='size-4 mr-1' />
                Retour
              </Button>
            )}

            {currentStep === 1 ? (
              <Button
                onClick={handleNext}
                className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white'
              >
                Suivant
                <ArrowRight className='size-4 ml-1' />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className='bg-primary-300 cursor-pointer hover:bg-primary-400 text-white'
                disabled={isCreating}
              >
                {isCreating ? (
                  <span className='flex items-center gap-2'>
                    <span className='inline-flex size-4 animate-spin rounded-full border-2 border-white border-b-transparent' />
                    <span>Création...</span>
                  </span>
                ) : (
                  'Créer'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
