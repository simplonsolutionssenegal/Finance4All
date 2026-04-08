'use client';

import { motion } from 'framer-motion';

type Partner = {
  name: string;
  dotClassName: string;
};

const PARTNERS: Partner[] = [
  { name: 'Logoipsum', dotClassName: 'bg-indigo-500' },
  { name: 'Logoipsum', dotClassName: 'bg-rose-500' },
  { name: 'Logoipsum', dotClassName: 'bg-violet-500' },
  { name: 'Logoipsum', dotClassName: 'bg-amber-500' },
  { name: 'Logoipsum', dotClassName: 'bg-slate-700' },
];

const LOOPED_PARTNERS = [...PARTNERS, ...PARTNERS];

export default function PartnersSection() {
  return (
    <section
      id='partners'
      className='relative bg-grey-50 py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden'
    >
      <div className='max-w-7xl mx-auto space-y-12 relative'>
        <div className='text-center space-y-4'>
          <div className='inline-flex items-center rounded-full border border-primary-100 bg-white/80 backdrop-blur px-4 py-1.5 text-sm font-semibold text-primary-700 shadow-sm'>
            Partenaires de confiance
          </div>
          <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-grey-900'>
            Ils font confiance a <span className='text-gradient-primary'>Finance4All</span>
          </h2>
          <p className='text-base sm:text-lg text-grey-600 max-w-2xl mx-auto'>
            Institutions, fintechs et organisations nous accompagnent pour rendre l&apos;education
            financiere accessible a tous.
          </p>
        </div>

        <div className='relative'>
          <div className='pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-grey-50 to-transparent z-10' />
          <div className='pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-grey-50 to-transparent z-10' />

          <motion.div
            className='flex w-max items-center gap-6'
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          >
            {LOOPED_PARTNERS.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className='group shrink-0 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 backdrop-blur px-5 py-3 shadow-[0_12px_24px_-18px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_35px_-22px_rgba(0,0,0,0.45)] transition-all duration-300'
              >
                <span
                  className={`inline-block h-9 w-9 rounded-xl shadow-sm ${partner.dotClassName}`}
                  aria-hidden='true'
                />
                <span className='text-2xl sm:text-3xl font-semibold text-grey-900 tracking-tight group-hover:text-primary-700 transition-colors'>
                  {partner.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
