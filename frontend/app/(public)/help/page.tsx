'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import ContactCards from '@/components/public/contact/contact-cards';
import Cta from '@/components/public/cta';
import HelpFaq from '@/components/public/help/help-faq';
import HelpHero from '@/components/public/help/help-hero';

export default function HelpPage() {
  const [query, setQuery] = useState('');

  return (
    <div>
      <HelpHero query={query} onQueryChange={setQuery} />
      <ContactCards mode='help' />
      <HelpFaq query={query} />
      <Cta
        title='Vous ne trouvez pas de réponse ?'
        description='Notre équipe est là pour vous aider. Contactez-nous !'
        buttons={[
          {
            label: 'Contacter le support',
            href: '/contact',

            icon: <ArrowRight className='w-4 h-4' aria-hidden='true' />,
            className: 'rounded-lg px-6',
          },
        ]}
      />
    </div>
  );
}
