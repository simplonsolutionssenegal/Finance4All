import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HeroSection = () => {
  return (
    <section className='relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-primary-50 to-white'>
      {/* Background Blur Effects */}
      <div className='absolute top-20 right-0 w-[600px] h-[600px] bg-primary-100 rounded-full blur-3xl opacity-30' />
      <div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-200 rounded-full blur-3xl opacity-20' />

      <div className='max-w-7xl mx-auto relative z-10'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          {/* Left Content */}
          <motion.div
            initial='hidden'
            animate='visible'
            variants={staggerContainer}
            className='space-y-8'
          >
            <motion.div variants={fadeInUp} className='space-y-6'>
              <motion.h1
                variants={fadeInUp}
                className='text-5xl lg:text-7xl text-grey-900 leading-[1.1]'
              >
                Prenez le contrôle de{' '}
                <span className='text-gradient-primary'>votre avenir financier</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className='text-xl text-grey-600'>
                Finance4All vous accompagne dans votre parcours d&apos;inclusion financière avec des
                outils intelligents, des formations gratuites et un accompagnement personnalisé.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className='flex flex-col sm:flex-row gap-4'>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size='lg'
                  className='bg-gradient-primary hover:opacity-90 text-white shadow-primary-lg group'
                >
                  Commencer gratuitement
                  <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size='lg'
                  variant='outline'
                  className='border-primary-200 hover:bg-primary-50 text-primary-600'
                >
                  Voir le comparateur
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className='flex items-center gap-8 pt-4'>
              <div className='flex -space-x-4'>
                <Avatar className='w-12 h-12 border-4 border-white'>
                  <AvatarImage src='/assets/images/user1.avif' alt='User' />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className='w-12 h-12 border-4 border-white'>
                  <AvatarImage src='/assets/images/user2.avif' alt='User' />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className='w-12 h-12 border-4 border-white'>
                  <AvatarImage src='/assets/images/user3.avif' alt='User' />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className='flex items-center gap-1 mb-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-4 h-4 fill-warning-500 text-warning-500'
                      aria-hidden='true'
                    />
                  ))}
                </div>
                <p className='text-sm text-grey-600'>
                  <span className='font-semibold text-grey-900'>10,000+</span> utilisateurs
                  satisfaits
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image with Floating Cards */}
          <motion.div
            initial='hidden'
            animate='visible'
            variants={fadeInRight}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='relative lg:h-[658px] flex items-center justify-center'
          >
            <div className='absolute top-0 left-0 w-[550px] h-[550px] bg-gradient-primary rounded-full opacity-20 blur-2xl' />
            <div className='relative z-10'>
              <Image
                src='/assets/images/floatted_phone.webp'
                alt='Finance4All App'
                width={550}
                height={550}
                priority
                style={{ height: 'auto', width: 'auto' }}
                className='w-full max-w-[550px] object-contain'
              />
            </div>

            {/* Floating Card - Savings */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className='absolute top-20 -left-8'
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className='bg-white rounded-2xl shadow-xl p-4 border border-primary-100'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center'>
                    <TrendingUp className='w-6 h-6 text-success-600' aria-hidden='true' />
                  </div>
                  <div>
                    <p className='text-sm text-grey-600'>Économies</p>
                    <p className='text-lg font-semibold text-grey-900'>+35%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card - Modules */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className='absolute bottom-40 -right-8'
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className='bg-white rounded-2xl shadow-xl p-4 border border-primary-100'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center'>
                    <BookOpen className='w-6 h-6 text-primary-600' aria-hidden='true' />
                  </div>
                  <div>
                    <p className='text-sm text-grey-600'>Modules complétés</p>
                    <p className='text-lg font-semibold text-grey-900'>12/24</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
