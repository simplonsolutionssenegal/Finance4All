'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useContactEmail, type ContactFormPayload } from '@/hooks/contact/useContactEmail';

const contactFormSchema = z.object({
  firstName: z.string().trim().min(2, 'Le prénom est requis'),
  lastName: z.string().trim().min(2, 'Le nom est requis'),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().optional(),
  country: z.string().trim().min(2, 'Le pays est requis'),
  subject: z.string().trim().min(5, 'Le sujet est requis'),
  message: z.string().trim().min(20, 'Le message doit contenir au moins 20 caractères'),
  website: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const { sendContactEmail, isSending, attemptsRemaining } = useContactEmail();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      subject: '',
      message: '',
      website: '',
    },
  });
  const canSubmit = isValid && !isSending && attemptsRemaining > 0;

  const onSubmit = async (values: ContactFormValues) => {
    if (attemptsRemaining <= 0) return;

    const payload: ContactFormPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      subject: values.subject,
      message: values.message,
      website: values.website,
    };

    const result = await sendContactEmail(payload).catch(() => null);
    if (result?.success) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        subject: '',
        message: '',
        website: '',
      });
    }
  };

  return (
    <div className='rounded-2xl border border-grey-200 bg-white shadow-sm p-6 sm:p-7'>
      <form className='space-y-4' onSubmit={e => void handleSubmit(onSubmit)(e)}>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <label htmlFor='firstName' className='text-sm font-semibold text-grey-900'>
              Prénom *
            </label>
            <Input
              id='firstName'
              placeholder='Votre prénom'
              className='h-11 border-transparent bg-gray-50 text-grey-900 placeholder:text-grey-400 focus-visible:border-primary-200'
              {...register('firstName')}
            />
            {errors.firstName ? (
              <p className='text-xs text-red-500'>{errors.firstName.message}</p>
            ) : null}
          </div>
          <div className='space-y-1.5'>
            <label htmlFor='lastName' className='text-sm font-semibold text-grey-900'>
              Nom *
            </label>
            <Input
              id='lastName'
              placeholder='Votre nom'
              className='h-11 border-transparent bg-gray-50 text-grey-900 placeholder:text-grey-400 focus-visible:border-primary-200'
              {...register('lastName')}
            />
            {errors.lastName ? (
              <p className='text-xs text-red-500'>{errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='email' className='text-sm font-semibold text-grey-900'>
            Email *
          </label>
          <Input
            id='email'
            type='email'
            placeholder='votre.email@exemple.com'
            className='h-11 border-transparent bg-gray-50 text-grey-900 placeholder:text-grey-400 focus-visible:border-primary-200'
            {...register('email')}
          />
          {errors.email ? <p className='text-xs text-red-500'>{errors.email.message}</p> : null}
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='phone' className='text-sm font-semibold text-grey-900'>
            Téléphone
          </label>
          <Input
            id='phone'
            placeholder='+221 XX XX XX XX'
            className='h-11 border-transparent bg-gray-50 text-grey-900 placeholder:text-grey-400 focus-visible:border-primary-200'
            {...register('phone')}
          />
          {errors.phone ? <p className='text-xs text-red-500'>{errors.phone.message}</p> : null}
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='country' className='text-sm font-semibold text-grey-900'>
            Pays *
          </label>
          <Input
            id='country'
            placeholder='Votre pays'
            className='h-11 border-grey-200 bg-white text-grey-900 placeholder:text-grey-400 focus-visible:border-primary-200'
            {...register('country')}
          />
          {errors.country ? <p className='text-xs text-red-500'>{errors.country.message}</p> : null}
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='subject' className='text-sm font-semibold text-grey-900'>
            Sujet *
          </label>
          <Input
            id='subject'
            placeholder='Objet de votre message'
            className='h-11 border-transparent bg-gray-50 text-grey-900 placeholder:text-grey-400 focus-visible:border-primary-200'
            {...register('subject')}
          />
          {errors.subject ? <p className='text-xs text-red-500'>{errors.subject.message}</p> : null}
        </div>

        <div className='space-y-1.5'>
          <label htmlFor='message' className='text-sm font-semibold text-grey-900'>
            Message *
          </label>
          <Textarea
            id='message'
            placeholder='Décrivez votre demande en détail...'
            className='min-h-28 border-transparent bg-gray-50 text-grey-900 placeholder:text-grey-400 focus-visible:border-primary-200'
            {...register('message')}
          />
          {errors.message ? <p className='text-xs text-red-500'>{errors.message.message}</p> : null}
        </div>

        {/* Honeypot anti-bot (masque visuellement, doit rester vide) */}
        <div className='hidden' aria-hidden>
          <label htmlFor='website'>Website</label>
          <input
            id='website'
            type='text'
            tabIndex={-1}
            autoComplete='off'
            {...register('website')}
          />
        </div>

        <Button
          type='submit'
          disabled={!canSubmit}
          className='w-full h-11 rounded-xl bg-primary-300 cursor-pointer hover:bg-primary-400 text-white font-semibold'
        >
          <Send className='w-4 h-4' aria-hidden='true' />
          {isSending ? 'Envoi en cours...' : 'Envoyer le message'}
        </Button>
        {attemptsRemaining <= 0 ? (
          <p className='text-sm text-red-500 text-center'>Limite de tentatives atteinte (3).</p>
        ) : null}
        <p className='text-sm text-grey-500 text-center leading-relaxed'>
          En envoyant ce formulaire, vous acceptez que Finance4All traite vos données pour répondre
          à votre demande.
        </p>
      </form>
    </div>
  );
}
