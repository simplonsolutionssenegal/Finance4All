'use client';

import { Check, Pencil, UserPlus } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

const isPhoneValid = (phone: string): boolean => {
  return (
    phone.trim().length === 0 ||
    phone.trim().startsWith('+221', 0) ||
    phone.trim().startsWith('+237', 0)
  );
};

const isCreateModeValid = (
  organizationId: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string
): boolean => {
  const phoneOk = isPhoneValid(phone);
  const baseOk =
    !!organizationId && firstName.trim().length > 0 && lastName.trim().length > 0 && phoneOk;

  return baseOk && email.trim().length > 0 && email.includes('@');
};

// ✅ Extraction : Validation en mode édition
const isEditModeValid = (
  organizationId: string,
  firstName: string,
  lastName: string,
  phone: string,
  initialId?: string
): boolean => {
  const phoneOk = isPhoneValid(phone);
  const baseOk =
    !!organizationId && firstName.trim().length > 0 && lastName.trim().length > 0 && phoneOk;

  return baseOk && !!initialId;
};

export default function AddBeneficiaryModal({
  isOpen,
  onClose,
  organizationId,
  mode,
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

  useEffect(() => {
    if (!isOpen) return;

    setFirstName(initialValues?.firstName ?? '');
    setLastName(initialValues?.lastName ?? '');
    setEmail(initialValues?.email ?? '');
    setPhone(initialValues?.phone ?? '');
    setGenerateTempPassword(mode !== 'edit');
  }, [isOpen, mode, initialValues]);

  const isValid = useMemo(() => {
    if (mode === 'create') {
      return isCreateModeValid(organizationId, firstName, lastName, email, phone);
    }
    return isEditModeValid(organizationId, firstName, lastName, phone, initialValues?.id);
  }, [organizationId, firstName, lastName, email, phone, mode, initialValues?.id]);

  const handleSubmit = async () => {
    if (!isValid) return;

    if (mode === 'edit') {
      if (!beneficiaryId) return;
      await onSubmit({
        id: beneficiaryId,
        organizationId: organizationId.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
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
  };

  const title = mode === 'create' ? 'Ajouter un bénéficiaire' : 'Modifier le bénéficiaire';
  const subtitle =
    mode === 'create'
      ? 'Créez un nouveau compte bénéficiaire pour votre organisation'
      : 'Modifiez les informations du bénéficiaire';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[520px] rounded-2xl p-0 overflow-hidden'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600'>
              {mode === 'create' ? (
                <UserPlus className='h-4 w-4' />
              ) : (
                <Pencil className='h-4 w-4' />
              )}
            </div>

            <div>
              <div className='text-base font-semibold text-gray-900'>{title}</div>
              <div className='mt-0.5 text-xs text-gray-500'>{subtitle}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className='px-5 py-4 space-y-4'>
          {!organizationId ? (
            <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
              Aucune organisation active. Sélectionne une organisation dans Clerk avant
              ajouter/modifier.
            </div>
          ) : null}

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-gray-600'>
                Prénom <span className='text-red-500'>*</span>
              </label>
              <Input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder='Awa'
                disabled={busy}
                className='rounded-xl'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-gray-600'>
                Nom <span className='text-red-500'>*</span>
              </label>
              <Input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder='Sarr'
                disabled={busy}
                className='rounded-xl'
              />
            </div>
          </div>

          {/* Email : writable en create, readOnly en edit */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-gray-600'>
              Email {mode === 'create' ? <span className='text-red-500'>*</span> : null}
            </label>
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='awa.sarr@email.sn'
              disabled={busy || mode === 'edit'}
              className={`rounded-xl ${mode === 'edit' ? 'opacity-80' : ''}`}
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-gray-600'>Téléphone</label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder='+221 76 567 8901'
              disabled={busy}
              className='rounded-xl'
            />
          </div>

          {/* Mot de passe temporaire : seulement en create */}
          {mode === 'create' ? (
            <button
              type='button'
              onClick={() => setGenerateTempPassword(v => !v)}
              className={[
                'w-full rounded-2xl border px-4 py-3 text-left transition',
                generateTempPassword
                  ? 'border-sky-200 bg-sky-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50',
              ].join(' ')}
              disabled={busy}
            >
              <div className='flex items-start gap-3'>
                <div
                  className={[
                    'mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border',
                    generateTempPassword ? 'border-sky-400 bg-white' : 'border-gray-300 bg-white',
                  ].join(' ')}
                >
                  {generateTempPassword ? <Check className='h-3.5 w-3.5 text-sky-600' /> : null}
                </div>

                <div className='min-w-0'>
                  <div className='text-sm font-semibold text-sky-700'>Mot de passe temporaire</div>
                  <div className='mt-0.5 text-xs text-sky-700/80'>
                    Un mot de passe temporaire sera généré automatiquement et affiché après la
                    création.
                  </div>
                </div>
              </div>
            </button>
          ) : null}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4'>
          <Button variant='outline' onClick={onClose} disabled={busy} className='rounded-xl'>
            Annuler
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={busy || !isValid}
            className='rounded-xl bg-sky-500 hover:bg-sky-600 text-white'
          >
            <Check className='mr-2 h-4 w-4' />
            {busy ? (mode === 'create' ? 'Création...' : 'Mise à jour...') : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
