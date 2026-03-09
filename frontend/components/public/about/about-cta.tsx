import { ArrowRight } from 'lucide-react';

import Cta from '@/components/public/cta';

export default function AboutCta() {
  return (
    <Cta
      title='Prêt à commencer votre parcours financier ?'
      description="Rejoignez des milliers d'utilisateurs et profitez d'outils gratuits pour mieux gérer votre argent."
      sectionClassName='py-20 md:py-24 px-6 lg:px-8 bg-primary-400'
      titleClassName='text-3xl sm:text-4xl lg:text-5xl'
      buttons={[
        {
          label: 'Créer mon compte gratuit',
          href: '/register',
          icon: <ArrowRight className='w-4 h-4' aria-hidden='true' />,
          className: 'cursor-pointer',
        },
        {
          label: 'Découvrir nos modules',
          href: '/modules-formation',
          variant: 'outline',
          className: 'cursor-pointer',
        },
      ]}
    />
  );
}
