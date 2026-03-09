import { render, screen } from '@testing-library/react';
import { ArrowRight, Globe, Lock } from 'lucide-react';

import Cta from '@/components/public/cta';

function LandingCta() {
  return (
    <Cta
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
            'px-8 py-4 h-auto rounded-lg w-fit hover:opacity-90 text-primary-600 shadow-2xl',
        },
        {
          label: 'Essayer le comparateur',
          href: '/comparator',
          variant: 'outline',
          className:
            'px-8 py-4 h-auto rounded-lg w-fit hover:opacity-90 shadow-2xl text-white hover:bg-white/10',
        },
      ]}
    />
  );
}

describe('Cta', () => {
  it('should render without crashing', () => {
    render(<LandingCta />);
    expect(screen.getByText(/Prêt à transformer votre vie financière ?/)).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<LandingCta />);
    expect(screen.getByText(/Prêt à transformer votre vie financière ?/)).toBeInTheDocument();
  });

  it('should display the description', () => {
    render(<LandingCta />);
    expect(screen.getByText(/Rejoignez plus de 10,000 utilisateurs/)).toBeInTheDocument();
  });

  it('should render CTA buttons', () => {
    render(<LandingCta />);
    expect(screen.getByText('Créer mon compte gratuit')).toBeInTheDocument();
    expect(screen.getByText('Essayer le comparateur')).toBeInTheDocument();
  });

  it('should display trust indicators', () => {
    render(<LandingCta />);
    expect(screen.getByText('Données sécurisées')).toBeInTheDocument();
    expect(screen.getByText(/SN & 🇨🇲 CM/)).toBeInTheDocument();
  });

  it('should have proper section structure', () => {
    const { container } = render(<LandingCta />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('relative', 'py-32', 'bg-gradient-primary');
  });

  it('should render the icon placeholder', () => {
    const { container } = render(<LandingCta />);
    const iconPlaceholder = container.querySelector('.w-24.h-24.bg-white\\/20');
    expect(iconPlaceholder).toBeInTheDocument();
  });
});
