import { MessageCircle } from 'lucide-react';

export default function ContactHero() {
  return (
    <section className='pt-28 pb-12 px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-5xl mx-auto text-center'>
        <div className='flex items-center justify-center'>
          <MessageCircle className='w-10 h-10 text-primary-300' aria-hidden='true' />
        </div>

        <h1 className='mt-6 text-4xl font-bold sm:text-5xl text-grey-900 leading-tight'>
          Contactez-nous
        </h1>
        <p className='mt-3 text-base sm:text-lg text-grey-600 leading-relaxed max-w-2xl mx-auto'>
          Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner
          dans votre parcours financier
        </p>
      </div>
    </section>
  );
}
