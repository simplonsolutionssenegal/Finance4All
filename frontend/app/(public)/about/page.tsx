'use client';

import AboutCta from '@/components/public/about/about-cta';
import AboutHero from '@/components/public/about/about-hero';
import AboutMission from '@/components/public/about/about-mission';
import AboutStats from '@/components/public/about/about-stats';
import AboutTimeline from '@/components/public/about/about-timeline';
import AboutValues from '@/components/public/about/about-values';

export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      <AboutStats />
      <AboutMission />
      <AboutValues />
      <AboutTimeline />
      <AboutCta />
    </div>
  );
}
