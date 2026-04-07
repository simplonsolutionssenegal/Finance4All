'use client';

import { ArrowRight, ChevronRight, Clock, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EducationSection = () => {
  const modules = [
    {
      title: 'Mobile Money avancé',
      tag: 'Digital',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
      duration: '60 min',
      users: '312',
      rating: '4.8',
    },
    {
      title: 'Épargne et Budget',
      tag: 'Gestion',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e',
      duration: '98 min',
      users: '189',
      rating: '4.6',
    },
    {
      title: 'Bases Finance Personnelle',
      tag: 'Fondamentaux',
      image: 'https://images.unsplash.com/photo-1554224311-beee4f770498',
      duration: '63 min',
      users: '245',
      rating: '4.7',
    },
  ];

  return (
    <section className='py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-grey-200'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header - Adapté pour mobile */}
        <div className='text-center space-y-4 mb-10 md:mb-16'>
          <div className='flex justify-center'>
            <Badge className='bg-success-100 text-success-700 border-success-200 px-4 py-2 text-sm font-medium'>
              Formation gratuite
            </Badge>
          </div>
          <h2 className='text-3xl sm:text-4xl lg:text-6xl font-bold text-grey-900 leading-tight'>
            Modules d&apos;éducation <br className='sm:hidden' />
            <span className='text-gradient-primary'>les plus populaires</span>
          </h2>
          <p className='text-base sm:text-lg md:text-xl text-grey-600 max-w-2xl mx-auto leading-relaxed'>
            Découvrez nos formations les plus suivies et commencez votre parcours
            d&apos;apprentissage dès aujourd&apos;hui.
          </p>
        </div>

        {/* Module Cards Grid - Responsive de 1 à 3 colonnes */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12'>
          {modules.map((module, index) => (
            <Card
              key={index}
              className='group overflow-hidden border-grey-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col h-full'
            >
              <div className='relative h-48 sm:h-52 overflow-hidden'>
                <Image
                  src={module.image}
                  alt={module.title}
                  fill
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  className='object-cover group-hover:scale-110 transition-transform duration-700'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
                <Badge className='border-transparent absolute top-4 left-4 bg-white/95 text-grey-900 shadow-sm'>
                  {module.tag}
                </Badge>
              </div>

              <CardContent className='p-5 md:p-6 flex flex-col flex-grow'>
                <h3 className='text-xl font-bold mb-3 text-grey-900 group-hover:text-primary-600 transition-colors'>
                  {module.title}
                </h3>

                {/* Stats Container - Wrap on very small screens */}
                <div className='flex flex-wrap items-center gap-3 md:gap-4 text-sm text-grey-600 mb-6'>
                  <div className='flex items-center gap-1.5'>
                    <Clock className='w-4 h-4 text-primary-500' />
                    <span>{module.duration}</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Users className='w-4 h-4 text-primary-500' />
                    <span>{module.users}</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Star className='w-4 h-4 fill-warning-500 text-warning-500' />
                    <span className='font-medium text-grey-900'>{module.rating}</span>
                  </div>
                </div>

                <div className='mt-auto'>
                  <Button className='w-full bg-gradient-primary hover:opacity-90 text-white shadow-md active:scale-95 transition-all'>
                    Découvrir
                    <ChevronRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className='flex items-center justify-center pt-4'>
          <Link
            href='/modules-formation'
            className='w-fit flex flex-row items-center justify-center gap-2 border-grey-300 border-2 text-grey-900 hover:bg-grey-50 px-8 py-3 rounded-xl transition-all'
          >
            Voir tous les modules
            <ArrowRight className='w-5 h-5 ml-2' aria-hidden='true' />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
