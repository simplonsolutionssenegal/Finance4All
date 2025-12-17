'use client';

import CTASection from '@/components/public/CTASection';
import EducationSection from '@/components/public/EducationSection';
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

      {/* Education Modules Section */}
      <EducationSection />

      {/* How it works */}
      <HowItWorks />

      {/* Vision Section */}
      <VisionSection />

      {/* Testimonials Section */}
      <TestimonialSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
