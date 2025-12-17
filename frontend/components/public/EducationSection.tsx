import { ArrowRight, ChevronRight, Clock, Star, Users } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EducationSection = () => {
  return (
    <section className='py-32 px-6 lg:px-8 bg-white border-t border-grey-200'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16'>
          <Badge className='bg-success-100 text-success-700 border-success-200 px-4 py-2'>
            Formation gratuite
          </Badge>
          <h2 className='text-4xl lg:text-6xl text-grey-900'>Modules d&apos;éducation</h2>
          <h2 className='text-4xl lg:text-6xl text-gradient-primary'>les plus populaires</h2>
          <p className='text-xl text-grey-600 max-w-3xl mx-auto'>
            Découvrez nos formations les plus suivies et commencez votre parcours
            d&apos;apprentissage dès aujourd&apos;hui
          </p>
        </div>

        {/* Module Cards */}
        <div className='grid md:grid-cols-3 gap-8 mb-12'>
          {/* Card 1 - Mobile Money */}
          <div>
            <Card className='group overflow-hidden border-grey-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer'>
              <div className='relative h-48 overflow-hidden'>
                <Image
                  src='https://images.unsplash.com/photo-1556742049-0cfed4f6a45d'
                  alt='Mobile Money avancé'
                  width={400}
                  height={192}
                  style={{ height: 'auto', width: 'auto' }}
                  className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                <Badge className='border-transparent absolute top-4 left-4 bg-white/90 text-grey-900'>
                  Digital
                </Badge>
              </div>
              <CardContent className='p-6'>
                <h3 className='text-xl mb-3 text-grey-900'>Mobile Money avancé</h3>
                <div className='flex items-center gap-4 text-sm text-grey-600 mb-4'>
                  <div className='flex items-center gap-1'>
                    <Clock className='w-4 h-4' aria-hidden='true' />
                    <span>60 min</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Users className='w-4 h-4' aria-hidden='true' />
                    <span>312</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star
                      className='w-4 h-4 fill-warning-500 text-warning-500'
                      aria-hidden='true'
                    />
                    <span>4.8</span>
                  </div>
                </div>
                <Button className='w-full bg-gradient-primary hover:opacity-90 text-white'>
                  Découvrir
                  <ChevronRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Card 2 - Épargne et Budget */}
          <div>
            <Card className='group overflow-hidden border-grey-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer'>
              <div className='relative h-48 overflow-hidden'>
                <Image
                  src='https://images.unsplash.com/photo-1579621970563-ebec7560ff3e'
                  alt='Épargne et Budget'
                  width={400}
                  height={192}
                  style={{ height: 'auto', width: 'auto' }}
                  className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                <Badge className='border-transparent absolute top-4 left-4 bg-white/90 text-grey-900'>
                  Gestion
                </Badge>
              </div>
              <CardContent className='p-6'>
                <h3 className='text-xl mb-3 text-grey-900'>Épargne et Budget</h3>
                <div className='flex items-center gap-4 text-sm text-grey-600 mb-4'>
                  <div className='flex items-center gap-1'>
                    <Clock className='w-4 h-4' aria-hidden='true' />
                    <span>98 min</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Users className='w-4 h-4' aria-hidden='true' />
                    <span>189</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star
                      className='w-4 h-4 fill-warning-500 text-warning-500'
                      aria-hidden='true'
                    />
                    <span>4.6</span>
                  </div>
                </div>
                <Button className='w-full bg-gradient-primary hover:opacity-90 text-white'>
                  Découvrir
                  <ChevronRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Card 3 - Bases Finance Personnelle */}
          <div>
            <Card className='group overflow-hidden border-grey-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer'>
              <div className='relative h-48 overflow-hidden'>
                <Image
                  src='https://images.unsplash.com/photo-1554224311-beee4f770498'
                  alt='Bases Finance Personnelle'
                  width={400}
                  height={192}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                <Badge className='border-transparent absolute top-4 left-4 bg-white/90 text-grey-900'>
                  Fondamentaux
                </Badge>
              </div>
              <CardContent className='p-6'>
                <h3 className='text-xl mb-3 text-grey-900'>Bases Finance Personnelle</h3>
                <div className='flex items-center gap-4 text-sm text-grey-600 mb-4'>
                  <div className='flex items-center gap-1'>
                    <Clock className='w-4 h-4' aria-hidden='true' />
                    <span>63 min</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Users className='w-4 h-4' aria-hidden='true' />
                    <span>245</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star
                      className='w-4 h-4 fill-warning-500 text-warning-500'
                      aria-hidden='true'
                    />
                    <span>4.7</span>
                  </div>
                </div>
                <Button className='w-full bg-gradient-primary hover:opacity-90 text-white'>
                  Découvrir
                  <ChevronRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* View All Button */}
        <div className='text-center'>
          <Button
            size='lg'
            variant='outline'
            className='border-grey-300 text-grey-900 hover:bg-grey-50'
          >
            Voir tous les modules
            <ArrowRight className='w-5 h-5 ml-2' aria-hidden='true' />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
