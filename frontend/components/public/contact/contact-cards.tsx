import { Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ContactCardItem = {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  content: ReactNode;
};

type ContactCardsMode = 'help' | 'contact';

type ContactCardsProps = {
  mode?: ContactCardsMode;
  cards?: ContactCardItem[];
  title?: string;
  description?: string;
  sectionClassName?: string;
  containerClassName?: string;
  gridClassName?: string;
  cardClassName?: string;
  contentClassName?: string;
};

const HELP_CONTACT_CARDS: ContactCardItem[] = [
  {
    id: 'help-chat',
    icon: <MessageCircle className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Chat en direct',
    subtitle: 'Discutez avec notre équipe',
    content: 'Disponible Lun–Ven 9h–18h',
  },
  {
    id: 'help-email',
    icon: <Mail className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Email',
    subtitle: 'Envoyez-nous un message',
    content: (
      <Link href='/contact' className='hover:underline'>
        Disponible via le formulaire de contact
      </Link>
    ),
  },
  {
    id: 'help-phone-sn',
    icon: <Phone className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Téléphone Sénégal',
    subtitle: 'Appelez-nous directement',
    content: (
      <a href='tel:+22133XXXXXXX' className='hover:underline'>
        +221 33 XXX XX XX
      </a>
    ),
  },
  {
    id: 'help-phone-cm',
    icon: <Phone className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Téléphone Cameroun',
    subtitle: 'Appelez-nous directement',
    content: (
      <a href='tel:+2376XXXXXXXX' className='hover:underline'>
        +237 6XX XX XX XX
      </a>
    ),
  },
];

const CONTACT_PAGE_CARDS: ContactCardItem[] = [
  {
    id: 'contact-email',
    icon: <Mail className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Email',
    content: (
      <div className='space-y-1'>
        <span className='block'>support@finance4all.com</span>
        <span className='block'>contact@finance4all.com</span>
      </div>
    ),
  },
  {
    id: 'contact-phone',
    icon: <Phone className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Téléphone',
    content: (
      <div className='space-y-1'>
        <span className='block'>+221 33 XXX XX XX (Sénégal)</span>
        <span className='block'>+237 6XX XX XX XX (Cameroun)</span>
      </div>
    ),
  },
  {
    id: 'contact-office',
    icon: <MapPin className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Bureaux',
    content: (
      <div className='space-y-1'>
        <span className='block'>Dakar, Sénégal</span>
        <span className='block'>Douala, Cameroun</span>
      </div>
    ),
  },
  {
    id: 'contact-hours',
    icon: <Clock3 className='w-5 h-5 text-primary-600' aria-hidden='true' />,
    title: 'Horaires',
    content: (
      <div className='space-y-1'>
        <span className='block'>Lundi - Vendredi</span>
        <span className='block'>9h00 - 18h00 GMT</span>
      </div>
    ),
  },
];

export default function ContactCards({
  mode = 'help',
  cards,
  title,
  description,
  sectionClassName,
  containerClassName,
  gridClassName,
  cardClassName,
  contentClassName,
}: ContactCardsProps) {
  const resolvedCards = cards ?? (mode === 'contact' ? CONTACT_PAGE_CARDS : HELP_CONTACT_CARDS);
  const resolvedContentClassName = cn(
    mode === 'contact' ? 'text-gray-500' : 'text-primary-300',
    contentClassName
  );

  return (
    <section className={cn('py-10 px-6 lg:px-8 bg-gray-50', sectionClassName)}>
      <div className={cn('max-w-5xl mx-auto', containerClassName)}>
        {title || description ? (
          <div className='text-center mb-8 space-y-2'>
            {title ? <h2 className='text-3xl font-bold text-grey-900'>{title}</h2> : null}
            {description ? <p className='text-grey-600'>{description}</p> : null}
          </div>
        ) : null}

        <div className={cn('grid sm:grid-cols-2 lg:grid-cols-4 gap-5', gridClassName)}>
          {resolvedCards.map(card => (
            <Card
              key={card.id}
              className={cn(
                'border-grey-200 hover:shadow-lg transition-all duration-300',
                cardClassName
              )}
            >
              <CardContent className='p-6 space-y-3'>
                <div className='w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center'>
                  {card.icon}
                </div>
                <div className='space-y-1'>
                  <p className='font-semibold text-grey-900'>{card.title}</p>
                  {card.subtitle ? <p className='text-sm text-grey-600'>{card.subtitle}</p> : null}
                </div>
                <div className={cn('text-sm', resolvedContentClassName)}>{card.content}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
