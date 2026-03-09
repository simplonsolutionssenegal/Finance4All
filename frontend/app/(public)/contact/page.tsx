import ContactCards from '@/components/public/contact/contact-cards';
import ContactHero from '@/components/public/contact/contact-hero';
import ContactMessageSection from '@/components/public/contact/contact-message-section';
import Cta from '@/components/public/cta';

export default function ContactPage() {
  return (
    <div>
      <ContactHero />
      <ContactCards mode='contact' sectionClassName='py-8 px-6 lg:px-8' />
      <ContactMessageSection />
      <Cta
        title="Consultez d'abord notre centre d'aide"
        description='Vous trouverez peut-être une réponse immédiate à votre question dans notre FAQ'
        sectionClassName='py-16 px-6 lg:px-8 bg-white'
        containerClassName='max-w-5xl mx-auto text-center text-grey-900 bg-white'
        titleClassName='text-3xl font-bold text-grey-900'
        descriptionClassName='mt-0 text-grey-600'
        actionsClassName='mt-2'
        buttons={[
          {
            label: "Accéder au centre d'aide",
            href: '/help',
            variant: 'outline',
            className:
              'rounded-lg border-primary-200 cursor-pointer text-primary-300 hover:bg-primary-50 bg-white',
          },
        ]}
      />
    </div>
  );
}
