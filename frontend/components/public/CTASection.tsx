import { ArrowRight, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

const CTASection = () => {
  return (
    <section className='relative py-32 px-6 lg:px-8 bg-gradient-primary overflow-hidden'>
      {/* Background blur effects */}
      <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
      <div className='absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />

      <div className='max-w-4xl mx-auto relative text-center space-y-8'>
        {/* Icon */}
        <div className='w-24 h-24 bg-white/20 rounded-3xl mx-auto' />

        {/* Title */}
        <h2 className='text-4xl lg:text-6xl text-white'>
          Prêt à transformer votre vie financière ?
        </h2>

        {/* Description */}
        <p className='text-xl text-white/90 max-w-2xl mx-auto'>
          Rejoignez plus de 10,000 utilisateurs qui ont déjà pris le contrôle de leurs finances avec
          Finance4All.
        </p>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
          <Link
            href='/register'
            className='bg-white hover:bg-grey-100 flex flex-row items-center justify-center gap-2 px-8 py-4 rounded-lg w-fit hover:opacity-90 text-primary-600 shadow-2xl'
          >
            Créer mon compte gratuit
            <ArrowRight className='w-5 h-5 ml-2' aria-hidden='true' />
          </Link>
          <Link
            href='/register'
            className='border border-white text-white hover:bg-white/10 flex flex-row items-center justify-center gap-2 px-8 py-4 rounded-lg w-fit hover:opacity-90 shadow-2xl'
          >
            Essayer le comparateur
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className='flex md:flex-row flex-col items-center justify-center gap-8 pt-8 text-white/90'>
          <div className='flex items-center gap-2'>
            <Lock className='w-5 h-5' aria-hidden='true' />
            <span>Données sécurisées</span>
          </div>
          <div className='flex items-center gap-2'>
            <Globe className='w-5 h-5' aria-hidden='true' />
            <span>🇸🇳 SN & 🇨🇲 CM</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
