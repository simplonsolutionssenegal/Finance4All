import { motion } from 'framer-motion';
import { BookOpen, Building2, ChartColumn, ChevronRight, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeaturesSection = () => {
  return (
    <section id='features' className='py-32 px-6 lg:px-8 bg-grey-50'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className='text-center space-y-4 mb-20'
        >
          <motion.div variants={scaleIn}>
            <Badge className='bg-primary-100 text-primary-700 border-primary-200 px-4 py-2'>
              Nos Services
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeInUp} className='text-4xl lg:text-6xl text-grey-900'>
            Tout ce dont vous avez besoin
          </motion.h2>
          <motion.h2 variants={fadeInUp} className='text-4xl lg:text-6xl text-gradient-primary'>
            pour réussir financièrement
          </motion.h2>
          <motion.p variants={fadeInUp} className='text-xl text-grey-600 max-w-3xl mx-auto'>
            Une plateforme complète qui combine éducation, comparaison et simulation pour vous aider
            à prendre les meilleures décisions financières.
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'
        >
          {/* Card 1 - Education */}
          <motion.div variants={fadeInUp} className='cursor-pointer'>
            <motion.div whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <Card className='h-full border-grey-200 hover:shadow-lg transition-all duration-300'>
                <CardContent className='p-8 space-y-6'>
                  <div className='w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center'>
                    <BookOpen className='w-8 h-8 text-primary-600' aria-hidden='true' />
                  </div>
                  <div className='space-y-3'>
                    <h3 className='text-xl font-semibold text-grey-900'>Éducation financière</h3>
                    <p className='text-grey-600'>
                      Plus de 100 modules interactifs pour maîtriser la gestion de vos finances
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    className='text-primary-600 hover:text-primary-700 p-0 h-auto group'
                  >
                    En savoir plus
                    <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Card 2 - Comparator */}
          <motion.div variants={fadeInUp} className='cursor-pointer'>
            <motion.div whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <Card className='h-full border-grey-200 hover:shadow-lg transition-all duration-300'>
                <CardContent className='p-8 space-y-6'>
                  <div className='w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center'>
                    <ChartColumn className='w-8 h-8 text-primary-600' aria-hidden='true' />
                  </div>
                  <div className='space-y-3'>
                    <h3 className='text-xl font-semibold text-grey-900'>Comparateur intelligent</h3>
                    <p className='text-grey-600'>
                      Comparez tous les services financiers en temps réel et trouvez les meilleures
                      offres
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    className='text-primary-600 hover:text-primary-700 p-0 h-auto group'
                  >
                    En savoir plus
                    <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Card 3 - Simulator */}
          <motion.div variants={fadeInUp} className='cursor-pointer'>
            <motion.div whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <Card className='h-full border-grey-200 hover:shadow-lg transition-all duration-300'>
                <CardContent className='p-8 space-y-6'>
                  <div className='w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center'>
                    <Building2 className='w-8 h-8 text-accent' aria-hidden='true' />
                  </div>
                  <div className='space-y-3'>
                    <h3 className='text-xl font-semibold text-grey-900'>Simulateur de services</h3>
                    <p className='text-grey-600'>
                      Choisissez votre institution, sélectionnez un service et calculez vos frais
                      instantanément
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    className='text-primary-600 hover:text-primary-700 p-0 h-auto group'
                  >
                    En savoir plus
                    <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Card 4 - Security */}
          <motion.div variants={fadeInUp}>
            <motion.div whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <Card className='h-full border-grey-200 hover:shadow-lg transition-all duration-300'>
                <CardContent className='p-8 space-y-6'>
                  <div className='w-16 h-16 bg-grey-200 rounded-2xl flex items-center justify-center'>
                    <Shield className='w-8 h-8 text-grey-700' aria-hidden='true' />
                  </div>
                  <div className='space-y-3'>
                    <h3 className='text-xl font-semibold text-grey-900'>Sécurité garantie</h3>
                    <p className='text-grey-600'>
                      Vos données sont protégées avec les normes de sécurité les plus élevées
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    className='text-primary-600 hover:text-primary-700 p-0 h-auto group'
                  >
                    En savoir plus
                    <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
