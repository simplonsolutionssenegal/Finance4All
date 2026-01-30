'use client';

import { motion } from 'framer-motion';
import { Award, ChartColumn, Sparkles, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

const HowItWorks = () => {
  return (
    <section
      id='how-it-works'
      className='py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden'
    >
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          <div className='relative order-first'>
            <div className='relative p-8 sm:p-12 scale-90 sm:scale-100 transition-transform'>
              <div className='relative w-full aspect-square max-w-[280px] sm:max-w-md mx-auto'>
                {/* Background circles */}
                <div className='absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full shadow-inner' />
                <div className='absolute inset-6 sm:inset-8 bg-white rounded-full shadow-xl' />

                {/* Center icon - Sparkles */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className='w-16 h-16 sm:w-24 sm:h-24 bg-gradient-primary rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl'
                  >
                    <Sparkles className='w-8 h-8 sm:w-12 sm:h-12 text-white' />
                  </motion.div>
                </div>

                <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 sm:-translate-y-1/2'>
                  <div className='relative'>
                    <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg rotate-12'>
                      <Users className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-success-400 rounded-full flex items-center justify-center text-white text-xs sm:text-base font-bold shadow-md'>
                      1
                    </div>
                  </div>
                </div>

                <div className='absolute bottom-4 sm:bottom-8 left-0 -translate-x-1/4 sm:-translate-x-1/2'>
                  <div className='relative'>
                    <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg -rotate-12'>
                      <ChartColumn className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-primary-400 rounded-full flex items-center justify-center text-white text-xs sm:text-base font-bold shadow-md'>
                      2
                    </div>
                  </div>
                </div>

                <div className='absolute bottom-4 sm:bottom-8 right-0 translate-x-1/4 sm:translate-x-1/2'>
                  <div className='relative'>
                    <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg rotate-12'>
                      <Award className='w-8 h-8 sm:w-10 sm:h-10 text-white' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-warning-400 rounded-full flex items-center justify-center text-white text-xs sm:text-base font-bold shadow-md'>
                      3
                    </div>
                  </div>
                </div>
              </div>

              <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-primary rounded-full opacity-20 blur-2xl' />
              <div className='absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-success-400 to-primary-400 rounded-full opacity-20 blur-3xl' />
            </div>
          </div>

          <div className='flex flex-col gap-8 text-center lg:text-left'>
            <div className='space-y-4'>
              <div className='flex justify-center lg:justify-start'>
                <Badge className='bg-success-100 text-success-700 border-success-200 px-4 py-2 text-sm'>
                  Simple et efficace
                </Badge>
              </div>
              <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-grey-900 leading-tight'>
                Comment ça marche ?
              </h2>
              <p className='text-lg sm:text-xl text-grey-600 max-w-lg mx-auto lg:mx-0'>
                En 3 étapes simples, commencez votre parcours vers l&apos;indépendance financière.
              </p>
            </div>

            {/* Steps List */}
            <div className='space-y-6 text-left'>
              {[
                {
                  step: 1,
                  icon: Users,
                  color: 'from-success-500 to-success-600',
                  title: 'Créez votre compte',
                  desc: 'Inscription gratuite en 2 minutes avec votre numéro de téléphone.',
                },
                {
                  step: 2,
                  icon: ChartColumn,
                  color: 'from-primary-500 to-primary-600',
                  title: 'Explorez et comparez',
                  desc: 'Accédez au comparateur et trouvez les meilleures offres adaptées à vos besoins.',
                },
                {
                  step: 3,
                  icon: Award,
                  color: 'from-warning-500 to-warning-600',
                  title: 'Apprenez et progressez',
                  desc: 'Suivez des formations gratuites et obtenez des certificats reconnus.',
                },
              ].map((item, idx) => (
                <div key={idx} className='flex gap-4 sm:gap-6 items-start group'>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
                  </div>
                  <div className='space-y-1 sm:space-y-2'>
                    <h3 className='text-lg sm:text-xl font-bold text-grey-900'>{item.title}</h3>
                    <p className='text-sm sm:text-base text-grey-600 leading-relaxed'>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
