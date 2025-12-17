import { Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const TestimonialSection = () => {
  return (
    <section
      id='testimonials'
      className='py-32 px-6 lg:px-8 bg-gradient-to-b from-primary-50 to-white'
    >
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-20'>
          <Badge className='bg-warning-100 text-warning-700 border-warning-200 px-4 py-2'>
            Témoignages
          </Badge>
          <h2 className='text-4xl lg:text-6xl text-grey-900'>Ils ont transformé leur vie</h2>
          <h2 className='text-4xl lg:text-6xl text-gradient-primary'>avec Finance4All</h2>
        </div>

        {/* Testimonial Cards */}
        <div className='grid md:grid-cols-3 gap-8'>
          {/* Testimonial 1 */}
          <div>
            <Card className='h-full border-grey-200 hover:shadow-xl transition-all duration-300'>
              <CardContent className='p-8 space-y-6'>
                {/* Stars */}
                <div className='flex gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-5 h-5 fill-warning-500 text-warning-500'
                      aria-hidden='true'
                    />
                  ))}
                </div>
                {/* Testimonial Text */}
                <p className='text-grey-700 italic'>
                  &#34;Grâce au comparateur, j&apos;ai trouvé un crédit avec un taux 30% plus bas.
                  Les modules m&apos;ont appris à gérer mon business efficacement.&#34;
                </p>
                {/* Author */}
                <Separator className='bg-grey-200' />
                <div className='flex items-center gap-4 pt-4'>
                  <Avatar className='w-14 h-14'>
                    <AvatarImage src='/assets/images/user1.avif' alt='Fatou Diop' />
                    <AvatarFallback>FD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-semibold text-grey-900'>Fatou Diop</p>
                    <p className='text-sm text-grey-600'>Entrepreneure • Dakar, Sénégal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonial 2 */}
          <div>
            <Card className='h-full border-grey-200 hover:shadow-xl transition-all duration-300'>
              <CardContent className='p-8 space-y-6'>
                {/* Stars - 4 stars */}
                <div className='flex gap-1'>
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-5 h-5 fill-warning-500 text-warning-500'
                      aria-hidden='true'
                    />
                  ))}
                  <Star className='w-5 h-5 fill-grey-200 text-grey-200' aria-hidden='true' />
                </div>
                {/* Testimonial Text */}
                <p className='text-grey-700 italic'>
                  &quot;Finance4All m&apos;a permis de comprendre l&apos;épargne et
                  l&apos;investissement. J&apos;ai commencé à mettre de l&apos;argent de côté chaque
                  mois.&quot;
                </p>
                {/* Author */}
                <Separator className='bg-grey-200' />
                <div className='flex items-center gap-4 pt-4'>
                  <Avatar className='w-14 h-14'>
                    <AvatarImage src='/assets/images/user2.avif' alt='Amadou Niang' />
                    <AvatarFallback>AN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-semibold text-grey-900'>Amadou Niang</p>
                    <p className='text-sm text-grey-600'>Étudiant • Yaoundé, Cameroun</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonial 3 */}
          <div>
            <Card className='h-full border-grey-200 hover:shadow-xl transition-all duration-300'>
              <CardContent className='p-8 space-y-6'>
                {/* Stars */}
                <div className='flex gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-5 h-5 fill-warning-500 text-warning-500'
                      aria-hidden='true'
                    />
                  ))}
                </div>
                {/* Testimonial Text */}
                <p className='text-grey-700 italic'>
                  &quot;Les simulations m&apos;ont aidée à planifier l&apos;agrandissement de ma
                  boutique. Aujourd&apos;hui, je gère 3 points de vente !&quot;
                </p>
                {/* Author */}
                <Separator className='bg-grey-200' />
                <div className='flex items-center gap-4 pt-4'>
                  <Avatar className='w-14 h-14'>
                    <AvatarImage src='/assets/images/user2.avif' alt='Aissatou Kane' />
                    <AvatarFallback>AK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-semibold text-grey-900'>Aissatou Kane</p>
                    <p className='text-sm text-grey-600'>Commerçante • Thiès, Sénégal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
export default TestimonialSection;
