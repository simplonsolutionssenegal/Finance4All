'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function AboutHero() {
  return (
    <section className='pt-28 pb-12 px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={stagger}
          className='text-center max-w-3xl mx-auto space-y-6'
        >
          <motion.h1
            variants={fadeInUp}
            className='text-4xl font-bold sm:text-5xl lg:text-6xl text-grey-900 leading-tight'
          >
            Finance pour tous, <span className='text-gradient-primary'>partout</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className='text-base sm:text-lg text-grey-600 leading-relaxed'
          >
            Finance4All est une plateforme d&apos;éducation financière et d&apos;accès aux services
            financiers. Notre mission est de rendre l&apos;éducation accessible, interactive et
            pertinente pour tous.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
