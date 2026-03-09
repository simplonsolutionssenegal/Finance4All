import { motion } from 'framer-motion';

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
const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const StatsSection = () => {
  return (
    <section className='py-16 px-6 lg:px-8 bg-white border-t border-grey-200'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className='grid grid-cols-2 md:grid-cols-4 gap-8'
        >
          <motion.div variants={scaleIn} className='text-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='text-5xl mb-2 text-gradient-primary font-bold'
            >
              10K+
            </motion.div>
            <p className='text-sm text-grey-600'>Utilisateurs actifs</p>
          </motion.div>
          <motion.div variants={scaleIn} className='text-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='text-5xl mb-2 text-gradient-primary font-bold'
            >
              50+
            </motion.div>
            <p className='text-sm text-grey-600'>Institutions partenaires</p>
          </motion.div>
          <motion.div variants={scaleIn} className='text-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-5xl mb-2 text-gradient-primary font-bold'
            >
              100+
            </motion.div>
            <p className='text-sm text-grey-600'>Modules de formation</p>
          </motion.div>
          <motion.div variants={scaleIn} className='text-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='text-5xl mb-2 text-gradient-primary font-bold'
            >
              4.8/5
            </motion.div>
            <p className='text-sm text-grey-600'>Note moyenne</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
