'use client';

import { Check, Edit, Info, UserPlus } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
  zodErrorsToFieldErrors,
  type BeneficiaryFieldErrors,
} from '@/lib/validations/beneficiaire-validations';

export type CreateBeneficiaryPayload = {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  generateTempPassword: boolean;
  role: 'org:recipient';
};

export type UpdateBeneficiaryPayload = {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

type Mode = 'create' | 'edit';

interface AddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  mode?: Mode;
  beneficiaryId?: string;
  initialValues?: Partial<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>;

  onSubmit: (payload: CreateBeneficiaryPayload | UpdateBeneficiaryPayload) => void | Promise<void>;

  isCreating?: boolean;
  isUpdating?: boolean;
}

export default function AddBeneficiaryModal({
  isOpen,
  onClose,
  organizationId,
  mode = 'create',
  beneficiaryId,
  initialValues,
  onSubmit,
  isCreating = false,
  isUpdating = false,
}: Readonly<AddBeneficiaryModalProps>) {
  const busy = isCreating || isUpdating;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [generateTempPassword, setGenerateTempPassword] = useState(true);
  const [errors, setErrors] = useState<BeneficiaryFieldErrors>({});
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFirstName(initialValues?.firstName ?? '');
    setLastName(initialValues?.lastName ?? '');
    setEmail(initialValues?.email ?? '');
    setPhone(initialValues?.phone ?? '');
    setGenerateTempPassword(mode !== 'edit');

    setErrors({});
    setBanner(null);
  }, [isOpen, mode, initialValues]);

  const payloadForValidation = useMemo(() => {
    if (mode === 'edit') {
      return {
        id: beneficiaryId ?? initialValues?.id ?? '',
        organizationId: organizationId ?? '',
        firstName,
        lastName,
        phone: phone.trim().length ? phone : undefined,
      };
    }
    return {
      organizationId: organizationId ?? '',
      firstName,
      lastName,
      email,
      phone: phone.trim().length ? phone : undefined,
      generateTempPassword,
      role: 'org:recipient' as const,
    };
  }, [
    mode,
    beneficiaryId,
    initialValues?.id,
    organizationId,
    firstName,
    lastName,
    email,
    phone,
    generateTempPassword,
  ]);

  const validate = () => {
    setBanner(null);

    if (mode === 'create') {
      const result = createBeneficiarySchema.safeParse(payloadForValidation);
      if (!result.success) {
        setErrors(zodErrorsToFieldErrors(result.error));
        return false;
      }
    } else {
      const result = updateBeneficiarySchema.safeParse(payloadForValidation);
      if (!result.success) {
        setErrors(zodErrorsToFieldErrors(result.error));
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const isValid = useMemo(() => {
    if (mode === 'create') return createBeneficiarySchema.safeParse(payloadForValidation).success;
    return updateBeneficiarySchema.safeParse(payloadForValidation).success;
  }, [mode, payloadForValidation]);

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (mode === 'edit') {
        if (!beneficiaryId) return;

        await onSubmit({
          id: beneficiaryId,
          organizationId: organizationId.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
        });

        setBanner({ type: 'success', text: 'Bénéficiaire mis à jour avec succès.' });
        onClose();
        return;
      }

      await onSubmit({
        organizationId: organizationId.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        generateTempPassword,
        role: 'org:recipient',
      });

      setBanner({ type: 'success', text: 'Bénéficiaire créé avec succès.' });
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Une erreur s'est produite.";
      setBanner({ type: 'error', text: msg });
    }
  };

  const title = mode === 'create' ? 'Ajouter un bénéficiaire' : 'Modifier un bénéficiaire';
  const subtitle =
    mode === 'create'
      ? 'Créez un nouveau compte bénéficiaire pour votre organisation'
      : 'Modifiez les informations du bénéficiaire';

  const inputClass =
    'h-9 rounded-lg bg-[#F8F9FA] border-[0.8px] border-[#FFFFFF] ' +
    'placeholder:text-slate-400 ' +
    'focus-visible:ring-0 focus-visible:ring-offset-0';

  const inputErrorClass = 'border-red-300 bg-red-50/40 placeholder:text-red-300';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className='p-0 bg-white border-0 shadow-none overflow-hidden'
        style={{
          width: 512,
          maxWidth: 'calc(100vw - 32px)',
          borderRadius: 12,
          borderWidth: '0.8px',
          borderStyle: 'solid',
          borderColor: '#DEE2E6',
          boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.10), 0px 10px 15px -3px rgba(0,0,0,0.10)',
        }}
      >
        {/* Header */}
        <div className='relative px-5 pt-4'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full text-[#228BE6]'>
              {mode === 'create' ? <UserPlus className='h-4 w-4' /> : <Edit className='h-4 w-4' />}
            </div>
            <div className='text-[20px] font-semibold text-tertiary-400'>{title}</div>
          </div>
          <div className='mt-1 pl-[8px] text-[15px] text-tertiary-400/60'>{subtitle}</div>
        </div>

        {/* Body */}
        <div className='px-5 pt-1 pb-3 space-y-3.5'>
          {!organizationId ? (
            <div className='rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800'>
              Aucune organisation active. Sélectionne une organisation avant ajouter/modifier.
            </div>
          ) : null}

          {banner ? (
            <div
              className={[
                'rounded-[12px] px-4 py-3 text-[13px] border',
                banner.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200',
              ].join(' ')}
              role='status'
            >
              {banner.text}
            </div>
          ) : null}

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-[17px] font-medium text-tertiary-700'>
                Prénom <span className='text-black-500 font-medium text-[14px]'>*</span>
              </label>
              <Input
                value={firstName}
                onChange={e => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: undefined }));
                }}
                placeholder='Awa'
                disabled={busy}
                className={[inputClass, errors.firstName ? inputErrorClass : ''].join(' ')}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName ? (
                <div className='text-[12px] text-red-600'>{errors.firstName}</div>
              ) : null}
            </div>

            <div className='space-y-1'>
              <label className='text-[17px] font-medium text-tertiary-700'>
                Nom <span className='text-black-500 font-medium text-[14px]'>*</span>
              </label>
              <Input
                value={lastName}
                onChange={e => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));
                }}
                placeholder='Sarr'
                disabled={busy}
                className={[inputClass, errors.lastName ? inputErrorClass : ''].join(' ')}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName ? (
                <div className='text-[12px] text-red-600'>{errors.lastName}</div>
              ) : null}
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-[17px] font-medium text-tertiary-700'>
              Email{' '}
              {mode === 'create' ? (
                <span className='text-black-500 font-medium text-[14px]'>*</span>
              ) : null}
            </label>
            <Input
              type='email'
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              placeholder='awa.sarr@email.sn'
              disabled={busy || mode === 'edit'}
              className={[
                inputClass,
                mode === 'edit' ? 'opacity-80' : '',
                errors.email ? inputErrorClass : '',
              ].join(' ')}
              aria-invalid={!!errors.email}
            />
            {errors.email ? <div className='text-[12px] text-red-600'>{errors.email}</div> : null}
          </div>

          <div className='space-y-1'>
            <label className='text-[17px] font-medium text-tertiary-700'>Téléphone</label>
            <Input
              value={phone}
              onChange={e => {
                setPhone(e.target.value);
                if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
              }}
              placeholder='+221 76 567 8901'
              disabled={busy}
              className={[inputClass, errors.phone ? inputErrorClass : ''].join(' ')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone ? <div className='text-[12px] text-red-600'>{errors.phone}</div> : null}
          </div>

          {/* Mot de passe temporaire : comme la maquette */}
          {mode === 'create' ? (
            <button
              type='button'
              onClick={() => setGenerateTempPassword(v => !v)}
              disabled={busy}
              className={[
                'w-full text-left rounded-[12px] px-4 py-3.5 transition-colors',
                'border-[1px] border-primary-200',
                'border-l-[6px]',
                generateTempPassword
                  ? 'border-[#74C0FC] bg-[#F8FCFF] border-l-[#228BE6]'
                  : 'border-[#DEE2E6] bg-white hover:bg-[#F8F9FA] border-l-[#ADB5BD]',
              ].join(' ')}
            >
              <div className='flex items-start gap-2.5'>
                <div
                  className={[
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white',
                    generateTempPassword
                      ? 'border-[#74C0FC] text-[#228BE6]'
                      : 'border-[#CED4DA] text-primary-400',
                  ].join(' ')}
                >
                  <Info className='h-3 w-3' />
                </div>

                <div className='min-w-0'>
                  <div className='text-[14px] font-semibold leading-[18px] text-primary-200'>
                    Mot de passe temporaire
                  </div>
                  <div className='mt-1 pl-[16px] text-[12px] leading-[16px] text-[#868E96]'>
                    Un mot de passe temporaire sera généré automatiquement et affiché après la
                    création.
                  </div>
                </div>
              </div>
            </button>
          ) : null}
        </div>

        {/* Footer */}
        <div className='px-5 pb-4'>
          <div className='flex items-center justify-end gap-3'>
            <Button
              variant='outline'
              onClick={onClose}
              disabled={busy}
              className='h-9 rounded-lg border-[0.8px] border-[#DEE2E6] bg-white px-4 text-slate-700 hover:bg-[#F8F9FA]'
            >
              Annuler
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={busy || !isValid}
              className='h-9 rounded-lg bg-primary-300 px-4 text-white hover:bg-primary-300/90'
            >
              <Check className='mr-2 h-4 w-4' />
              {busy
                ? mode === 'create'
                  ? 'Création...'
                  : 'Mise à jour...'
                : mode === 'create'
                  ? 'Créer le compte'
                  : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
