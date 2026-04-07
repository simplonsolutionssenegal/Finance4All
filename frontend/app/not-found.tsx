'use client';

import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className='min-h-screen bg-[#f8f9fb] px-6 py-16 flex items-center'>
      <div className='max-w-4xl mx-auto w-full'>
        <div className='max-w-xl'>
          <p className='text-[112px] leading-[0.9] font-extrabold text-[#171734]'>404</p>
          <div className='h-px bg-grey-200 my-4' />
          <h1 className='text-[56px] leading-[1.05] font-bold text-[#171734]'>Page introuvable</h1>
          <p className='mt-3 text-xl sm:text-2xl leading-[1.25] text-grey-600'>
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className='mt-8 flex items-center gap-4 flex-wrap'>
            <Link href='/'>
              <Button className='bg-primary-400 hover:bg-primary-300 text-white rounded-lg inline-flex items-center gap-2'>
                <Home className='w-4 h-4' aria-hidden='true' />
                Retour à l&apos;accueil
              </Button>
            </Link>

            <Button
              variant='ghost'
              className='text-grey-700 inline-flex items-center gap-2'
              onClick={() => router.back()}
            >
              <ArrowLeft className='w-4 h-4' aria-hidden='true' />
              Page précédente
            </Button>
          </div>

          <p className='mt-8 text-sm text-grey-600'>
            Un problème ?{' '}
            <Link href='/contact' className='text-primary-400 font-semibold hover:underline'>
              Contactez le support
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
