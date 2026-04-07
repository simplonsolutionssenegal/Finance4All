'use client';

import { ArrowRight, Globe, Lock } from 'lucide-react';

// import EducationSection from '@/components/public/EducationSection';
import Cta from '@/components/public/cta';
import FeaturesSection from '@/components/public/FeaturesSection';
import HeroSection from '@/components/public/HeroSection';
import HowItWorks from '@/components/public/HowItWorks';
import PublicFooter from '@/components/public/layout/footer';
import PublicHeader from '@/components/public/layout/header';
import StatsSection from '@/components/public/StatsSection';
import TestimonialSection from '@/components/public/TestimonialSection';
import VisionSection from '@/components/public/VisionSection';

export default function Home() {
  return (
    <div className='min-h-screen'>
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Vision Section */}
      <VisionSection />

      {/* How it works */}
      <HowItWorks />

      {/* Testimonials Section */}
      <TestimonialSection />

      {/* Education Modules Section */}
      {/* <EducationSection /> */}

      {/* CTA Section */}
      <Cta
        dataTestId='cta-section'
        title='Prêt à transformer votre vie financière ?'
        description='Rejoignez plus de 10,000 utilisateurs qui ont déjà pris le contrôle de leurs finances avec Finance4All.'
        sectionClassName='relative py-32 px-6 lg:px-8 bg-gradient-primary overflow-hidden'
        containerClassName='max-w-4xl relative text-center space-y-8'
        titleClassName='text-4xl lg:text-6xl'
        descriptionClassName='text-xl text-white/90 max-w-2xl mx-auto'
        actionsClassName='pt-4 items-center'
        backgroundDecorations={
          <>
            <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
          </>
        }
        topContent={<div className='w-24 h-24 bg-white/20 rounded-3xl mx-auto' />}
        bottomContent={
          <div className='flex md:flex-row flex-col items-center justify-center gap-8 pt-8 text-white/90'>
            <div className='flex items-center gap-2'>
              <Lock className='w-5 h-5' aria-hidden='true' />
              <span>Données sécurisées</span>
            </div>
            <div className='flex items-center gap-2'>
              <Globe className='w-5 h-5' aria-hidden='true' />
              <span>🇸🇳 SN &amp; 🇨🇲 CM</span>
            </div>
          </div>
        }
        buttons={[
          {
            label: 'Créer mon compte gratuit',
            href: '/register',
            icon: <ArrowRight className='w-5 h-5 ml-2' aria-hidden='true' />,
            className:
              'px-8 py-4 h-auto rounded-lg w-fit hover:opacity-90 text-primary-400 shadow-2xl cursor-pointer',
          },
          {
            label: 'Essayer le comparateur',
            href: '/comparator',
            variant: 'outline',
            className:
              'px-8 py-4 h-auto rounded-lg w-fit hover:opacity-90 shadow-2xl text-primary-400 cursor-pointer',
          },
        ]}
      />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
