import { CheckCircle2, Goal, Globe, Award } from 'lucide-react';

import { ABOUT_MISSION_BULLETS } from '@/types/utils/about-data';

export default function AboutMission() {
  return (
    <section className='py-16 md:py-20 px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch'>
          <div className='space-y-6 h-full'>
            <div className='flex items-center gap-2 text-sm text-primary-400 bg-primary-100/40 w-fit px-4 py-2 rounded-full'>
              <Goal className='w-4 h-4 text-primary-400' />
              <span>Nos missions</span>
            </div>

            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-grey-900 leading-tight'>
              Démocratiser l&apos;éducation financière en Afrique
            </h2>

            <p className='text-grey-600 leading-relaxed'>
              Nous croyons que chacun mérite d&apos;avoir accès à des connaissances financières de
              qualité. Finance4All offre une plateforme d&apos;apprentissage complète et des outils
              intelligents pour aider à prendre de meilleures décisions.
            </p>

            <div className='space-y-3'>
              {ABOUT_MISSION_BULLETS.map(item => (
                <div key={item.title} className='flex gap-3 items-start'>
                  <CheckCircle2 className='w-5 h-5 text-success-600 mt-0.5 shrink-0' />
                  <div>
                    <p className='font-semibold text-grey-900'>{item.title}</p>
                    <p className='text-sm text-grey-600'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='relative h-full'>
            <div className='rounded-3xl overflow-hidden border border-grey-200 bg-primary-50 h-full min-h-[320px] flex items-center justify-center'>
              <Globe className='w-44 h-44 text-primary-300/40' aria-hidden='true' />
            </div>

            <div className='absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-xl border border-grey-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center'>
                  <Award className='w-5 h-5 text-primary-600' aria-hidden='true' />
                </div>
                <div className='leading-tight'>
                  <p className='text-sm font-semibold text-grey-900'>2 pays</p>
                  <p className='text-xs text-grey-600'>Sénégal &amp; Cameroun</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
