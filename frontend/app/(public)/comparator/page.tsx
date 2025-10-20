// export default function Comparator() {
//   return <div>Page de Comparateur</div>;
// }

import { Check } from 'lucide-react';
import Image from 'next/image';

import ServiceListComparison from '@/components/public/ServiceListComparison';

export default async function Finance4AllHomepage() {
  return (
    <div className='min-h-screen bg-white'>
      <section className='bg-gradient-to-r from-teal-900 to-teal-700 text-white py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            <div>
              <h1 className='text-4xl font-bold mb-8'>Comparateur de banques</h1>
              <div className='space-y-4 mb-8'>
                <div className='flex items-start'>
                  <Check className='w-6 h-6 text-teal-300 mr-3 flex-shrink-0 mt-1' />
                  <p>Lorem ipsum cursus elit ut facilisis porta sapien dignissim nunc.</p>
                </div>
                <div className='flex items-start'>
                  <Check className='w-6 h-6 text-teal-300 mr-3 flex-shrink-0 mt-1' />
                  <p>Lorem ipsum cursus elit ut facilisis porta sapien dignissim nunc.</p>
                </div>
                <div className='flex items-start'>
                  <Check className='w-6 h-6 text-teal-300 mr-3 flex-shrink-0 mt-1' />
                  <p>Lorem ipsum cursus elit ut facilisis porta sapien dignissim nunc.</p>
                </div>
              </div>
              <a
                href='#compare'
                className='inline-block bg-white text-teal-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100'
              >
                Comparer des services
              </a>
            </div>
            <div className='flex justify-center'>
              <div className='rounded-lg p-8 w-full max-w-md'>
                <Image
                  src='/imageComporaison.png'
                  alt="Graphique d'analyse financière"
                  width={600}
                  height={400}
                  className='h-full w-full object-cover hover:scale-105 transition-transform duration-500'
                  quality={90}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <ServiceListComparison />
      <section className='bg-gray-50 py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-center mb-12'>Les avantages de la comparaison</h2>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            <div className='bg-white p-8 rounded-lg shadow-sm'>
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <div className='text-6xl mb-4'>👍</div>
                  <h3 className='text-xl font-bold mb-4'>ADVANTAGES</h3>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-center'>
                      <Check className='w-5 h-5 text-teal-500 mr-2' />
                      <div className='w-32 h-2 bg-gray-200 rounded' />
                    </div>
                    <div className='flex items-center justify-center'>
                      <Check className='w-5 h-5 text-teal-500 mr-2' />
                      <div className='w-32 h-2 bg-gray-200 rounded' />
                    </div>
                    <div className='flex items-center justify-center'>
                      <Check className='w-5 h-5 text-teal-500 mr-2' />
                      <div className='w-32 h-2 bg-gray-200 rounded' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md'>
                <span>Lorem ipsum cursus elit ut facilisis porta ?</span>
                <span className='text-2xl'>+</span>
              </div>
              <div className='bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md'>
                <span>Lorem ipsum cursus elit ut facilisis porta ?</span>
                <span className='text-2xl'>+</span>
              </div>
              <div className='bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md'>
                <span>Lorem ipsum cursus elit ut facilisis porta ?</span>
                <span className='text-2xl'>+</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
