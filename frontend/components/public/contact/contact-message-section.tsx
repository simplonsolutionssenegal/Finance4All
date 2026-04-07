import { CheckCircle2, Globe2, Sparkles } from 'lucide-react';

import ContactForm from '@/components/public/contact/contact-form';

export default function ContactMessageSection() {
  return (
    <section className='py-14 px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start'>
        <div className='space-y-6'>
          <div className='space-y-3'>
            <h2 className='text-3xl font-bold text-grey-900'>Envoyez-nous un message</h2>
            <p className='text-grey-600 leading-relaxed'>
              Remplissez le formulaire ci-contre et notre équipe vous répondra dans les 24 heures
              ouvrées. Pour une assistance immédiate, n&apos;hésitez pas à nous appeler ou à
              utiliser notre chat en direct.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='flex items-start gap-3'>
              <CheckCircle2
                className='w-5 h-5 mt-0.5 text-primary-300 shrink-0'
                aria-hidden='true'
              />
              <div>
                <p className='font-semibold text-grey-900'>Réponse rapide</p>
                <p className='text-sm text-grey-600'>
                  Nous nous engageons à répondre à toutes les demandes dans les 24 heures
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Globe2 className='w-5 h-5 mt-0.5 text-primary-300 shrink-0' aria-hidden='true' />
              <div>
                <p className='font-semibold text-grey-900'>Support multilingue</p>
                <p className='text-sm text-grey-600'>
                  Notre équipe parle français, anglais et plusieurs langues locales
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Sparkles className='w-5 h-5 mt-0.5 text-primary-300 shrink-0' aria-hidden='true' />
              <div>
                <p className='font-semibold text-grey-900'>Suivi personnalisé</p>
                <p className='text-sm text-grey-600'>
                  Chaque demande est traitée avec attention par nos experts
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-primary-100 bg-primary-50/50 p-4'>
            <p className='font-semibold text-grey-900'>Vous êtes une organisation ?</p>
            <p className='text-sm text-grey-600 mt-1'>
              Contactez notre équipe dédiée aux partenaires pour discuter de solutions
              personnalisées pour votre organisation.
            </p>
            <p className='text-sm text-primary-300 mt-2'>partnerships@finance4all.com</p>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
