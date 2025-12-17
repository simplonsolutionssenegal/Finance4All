import { ArrowRight, BookOpen, ChartColumn, Globe, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const VisionSection = () => {
  return (
    <section className='py-32 px-6 lg:px-8 bg-gradient-to-br from-grey-50 via-white to-primary-50 relative overflow-hidden'>
      {/* Background blur effects */}
      <div className='absolute top-20 right-0 w-96 h-96 bg-gradient-primary rounded-full opacity-10 blur-3xl' />
      <div className='absolute bottom-20 left-0 w-96 h-96 bg-gradient-primary rounded-full opacity-10 blur-3xl' />

      <div className='max-w-7xl mx-auto relative'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          {/* Left Side - Image */}
          <div className='relative'>
            <div className='rounded-3xl overflow-hidden shadow-2xl relative'>
              <Image
                src='/assets/images/vision_section.avif'
                alt='Professionnels africains et technologie financière'
                width={600}
                height={550}
                className='w-full h-[550px] object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent' />
            </div>

            {/* Floating card */}
            <div className='absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-2xl p-6 border border-primary-100'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg'>
                  <Sparkles className='w-7 h-7 text-white' aria-hidden='true' />
                </div>
                <div>
                  <p className='text-2xl font-semibold text-grey-900'>100%</p>
                  <p className='text-sm text-grey-600'>Innovation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className='space-y-8'>
            <div className='space-y-4'>
              <Badge className='bg-primary-100 text-primary-700 border-primary-200 px-4 py-2'>
                Notre Vision
              </Badge>
              <h2 className='text-4xl lg:text-5xl text-grey-900'>
                Technologie & Innovation au service de l&apos;inclusion financière
              </h2>
              <p className='text-xl text-grey-600'>
                Finance4All combine l&apos;intelligence artificielle, l&apos;analyse de données et
                une interface intuitive pour démocratiser l&apos;accès aux services financiers en
                Afrique.
              </p>
            </div>

            {/* Feature Cards */}
            <div className='space-y-6'>
              {/* Card 1 */}
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-grey-200 hover:shadow-lg transition-all'>
                <div className='flex gap-4 items-start'>
                  <div className='w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shrink-0'>
                    <ChartColumn className='w-6 h-6 text-white' aria-hidden='true' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-grey-900 mb-1'>Décisions éclairées</h3>
                    <p className='text-sm text-grey-600'>
                      Notre comparateur intelligent analyse des centaines d&apos;offres pour vous
                      recommander les solutions les plus adaptées à votre profil.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-grey-200 hover:shadow-lg transition-all'>
                <div className='flex gap-4 items-start'>
                  <div className='w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shrink-0'>
                    <BookOpen className='w-6 h-6 text-white' aria-hidden='true' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-grey-900 mb-1'>Apprentissage personnalisé</h3>
                    <p className='text-sm text-grey-600'>
                      Un parcours de formation sur mesure avec des modules interactifs, quiz et
                      certificats reconnus.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-grey-200 hover:shadow-lg transition-all'>
                <div className='flex gap-4 items-start'>
                  <div className='w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shrink-0'>
                    <Globe className='w-6 h-6 text-white' aria-hidden='true' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-grey-900 mb-1'>Accessible partout</h3>
                    <p className='text-sm text-grey-600'>
                      Une plateforme optimisée mobile-first, disponible au Sénégal et au Cameroun,
                      bientôt dans toute l&apos;Afrique.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className='pt-4'>
              <Button
                size='lg'
                className='bg-gradient-primary hover:opacity-90 text-white shadow-primary-lg group'
              >
                Découvrir la plateforme
                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
