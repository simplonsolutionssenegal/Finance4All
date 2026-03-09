'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, BookOpen, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HeroSection = () => {
  return (
    <section className='relative pt-28 pb-20 px-4 md:px-8 overflow-hidden bg-gradient-to-b from-primary-50 to-white'>
      {/* Background Blur Effects - Desktop only */}
      <div className='hidden md:block absolute top-20 right-0 w-[600px] h-[600px] bg-primary-100 rounded-full blur-3xl opacity-30' />
      <div className='hidden md:block absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-200 rounded-full blur-3xl opacity-20' />

      <div className='max-w-7xl mx-auto relative z-10'>
        <div className='grid md:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Left Content */}
          <motion.div
            initial='hidden'
            animate='visible'
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className='flex flex-col gap-6 md:gap-8'
          >
            <motion.h1
              variants={fadeInUp}
              className='text-5xl lg:text-7xl text-grey-900 leading-[1.1]'
            >
              Prenez le contrôle de{' '}
              <span className='text-gradient-primary block md:inline'>votre avenir financier</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className='text-lg md:text-xl text-slate-600 max-w-[600px] leading-relaxed'
            >
              Finance4All vous accompagne dans votre parcours d&apos;inclusion financière avec des
              outils intelligents, des formations gratuites et un accompagnement personnalisé.
            </motion.p>

            <motion.div variants={fadeInUp} className='flex flex-col sm:flex-row gap-4 pt-2'>
              <Link
                href='/register'
                className='bg-primary-300 flex flex-row items-center justify-center gap-2 hover:bg-primary-400 cursor-pointer text-white px-8 h-14 rounded-xl text-base font-medium transition-all shadow-md group w-full sm:w-auto'
              >
                Commencer gratuitement
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </Link>
              <Link
                href='/comparator'
                className='border-primary-400 border-2 bg-white flex flex-row items-center justify-center gap-2 text-primary-300 cursor-pointer hover:bg-primary-400 hover:text-white px-8 h-14 rounded-xl text-base font-medium transition-all w-full sm:w-auto'
              >
                Voir le comparateur
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className='flex items-center gap-6 pt-4'>
              <div className='flex -space-x-3'>
                {[1, 2, 3].map(i => (
                  <Avatar
                    key={i}
                    className='w-10 h-10 md:w-12 md:h-12 border-3 md:border-4 border-white shadow-sm'
                  >
                    <AvatarImage src={`/assets/images/user${i}.avif`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className='flex flex-col'>
                <div className='flex gap-0.5 mb-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='w-4 h-4 fill-orange-400 text-orange-400' />
                  ))}
                </div>
                <p className='text-sm font-medium text-slate-600'>
                  <span className='font-bold text-slate-900'>10,000+</span> utilisateurs satisfaits
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image Section */}
          <div className='relative flex items-center justify-center md:justify-end mt-8 md:mt-0'>
            {/* Background circle - Desktop only */}
            <div className='hidden md:block absolute w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-primary-100/60 rounded-full translate-x-10 translate-y-10' />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className='relative z-10 w-full max-w-[400px] md:max-w-[450px] lg:max-w-[500px]'
            >
              {/* Rotating Phone - Desktop only */}
              <div className='hidden md:block relative transform rotate-[15deg] transition-transform hover:rotate-[12deg] duration-700 ease-in-out'>
                <Image
                  src='/assets/images/floatted_phone.webp'
                  alt='Finance4All App'
                  width={550}
                  height={550}
                  priority
                  sizes='(max-width: 768px) 400px, (max-width: 1024px) 450px, 500px'
                  className='w-full h-auto object-contain'
                />
              </div>

              {/* Mobile image for small screens */}
              <div className='md:hidden relative'>
                <Image
                  src='/assets/images/floatted_phone.webp'
                  alt='Finance4All App'
                  width={400}
                  height={400}
                  priority
                  className='w-full h-auto object-contain'
                />
              </div>

              {/* Savings Card (Left) */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className='absolute top-1/4 md:top-1/3 left-2 md:-left-12 z-20 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 flex items-center gap-4 border border-slate-100 w-[160px] md:w-[180px] lg:w-[200px]'
              >
                <div className='p-2 bg-emerald-100 rounded-lg'>
                  <TrendingUp className='w-5 h-5 md:w-6 md:h-6 text-emerald-600' />
                </div>
                <div>
                  <p className='text-xs text-slate-400 font-bold uppercase'>Économies</p>
                  <p className='text-lg md:text-xl font-bold text-slate-900'>+35%</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className='absolute bottom-1/4 right-2 md:-right-12 z-20 bg-white/95 backdrop-blur shadow-xl rounded-2xl p-4 flex items-center gap-4 border border-slate-100 w-[160px] md:w-[180px] lg:w-[200px]'
              >
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <BookOpen className='w-5 h-5 md:w-6 md:h-6 text-blue-600' />
                </div>
                <div>
                  <p className='text-xs text-slate-400 font-bold uppercase leading-tight'>
                    Modules complétés
                  </p>
                  <p className='text-lg md:text-xl font-bold text-slate-900'>12/24</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
