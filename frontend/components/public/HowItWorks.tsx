import { Award, ChartColumn, Sparkles, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

const HowItWorks = () => {
  return (
    <section id='how-it-works' className='py-32 px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          {/* Left Side - Illustration */}
          <div className='relative'>
            <div className='relative p-12'>
              <div className='relative w-full aspect-square max-w-md mx-auto'>
                {/* Background circles */}
                <div className='absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full' />
                <div className='absolute inset-8 bg-white rounded-full shadow-xl' />

                {/* Center icon */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
                  <div className='w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl'>
                    <Sparkles className='w-12 h-12 text-white' aria-hidden='true' />
                  </div>
                </div>

                {/* Step 1 - Top */}
                <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                  <div className='relative'>
                    <div className='w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-lg rotate-12'>
                      <Users className='w-10 h-10 text-white' aria-hidden='true' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-8 h-8 bg-success-400 rounded-full flex items-center justify-center text-white shadow-md'>
                      1
                    </div>
                  </div>
                </div>

                {/* Step 2 - Bottom Left */}
                <div className='absolute bottom-8 left-0 -translate-x-1/2'>
                  <div className='relative'>
                    <div className='w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg -rotate-12'>
                      <ChartColumn className='w-10 h-10 text-white' aria-hidden='true' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white shadow-md'>
                      2
                    </div>
                  </div>
                </div>

                {/* Step 3 - Bottom Right */}
                <div className='absolute bottom-8 right-0 translate-x-1/2'>
                  <div className='relative'>
                    <div className='w-20 h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center shadow-lg rotate-12'>
                      <Award className='w-10 h-10 text-white' aria-hidden='true' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-8 h-8 bg-warning-400 rounded-full flex items-center justify-center text-white shadow-md'>
                      3
                    </div>
                  </div>
                </div>
              </div>

              {/* Background blur effects */}
              <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-primary rounded-full opacity-20 blur-2xl' />
              <div className='absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-success-400 to-primary-400 rounded-full opacity-20 blur-3xl' />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className='space-y-8'>
            <div className='space-y-4'>
              <Badge className='bg-success-100 text-success-700 border-success-200 px-4 py-2'>
                Simple et efficace
              </Badge>
              <h2 className='text-4xl lg:text-5xl text-grey-900'>Comment ça marche ?</h2>
              <p className='text-xl text-grey-600'>
                En 3 étapes simples, commencez votre parcours vers l&apos;indépendance financière
              </p>
            </div>

            {/* Steps List */}
            <div className='space-y-6'>
              {/* Step 1 */}
              <div className='flex gap-6 items-start'>
                <div className='w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0'>
                  <Users className='w-7 h-7 text-white' aria-hidden='true' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-semibold text-grey-900'>Créez votre compte</h3>
                  <p className='text-grey-600'>
                    Inscription gratuite en 2 minutes avec votre numéro de téléphone
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className='flex gap-6 items-start'>
                <div className='w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0'>
                  <ChartColumn className='w-7 h-7 text-white' aria-hidden='true' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-semibold text-grey-900'>Explorez et comparez</h3>
                  <p className='text-grey-600'>
                    Accédez au comparateur et trouvez les meilleures offres adaptées à vos besoins
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className='flex gap-6 items-start'>
                <div className='w-14 h-14 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0'>
                  <Award className='w-7 h-7 text-white' aria-hidden='true' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-semibold text-grey-900'>Apprenez et progressez</h3>
                  <p className='text-grey-600'>
                    Suivez des formations gratuites et obtenez des certificats reconnus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
