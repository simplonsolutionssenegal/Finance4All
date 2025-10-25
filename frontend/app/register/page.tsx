import { Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { RegisterForm } from '@/components/register-form';

export default function Register() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative flex flex-col justify-center items-center px-4 py-8'>
      {/* Gradient */}
      <div className='absolute inset-0 bg-gradient-to-tr from-primary-200/30 via-transparent to-primary-200/20 pointer-events-none' />
      <div className='absolute inset-0 bg-gradient-to-bl from-transparent via-white/40 to-primary-100/30 pointer-events-none' />

      {/* Close Button */}
      <div className='absolute top-6 right-6 z-20'>
        <Link
          href='/'
          className='w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20 flex items-center justify-center hover:bg-white/90 transition-colors'
        >
          <X className='h-5 w-5 text-gray-600' />
        </Link>
      </div>

      {/* Logo and Tagline */}
      <div className='mb-8 text-center relative z-10'>
        <div className='mb-4'>
          <Image
            src='/logo.svg'
            alt='Finance4All Logo'
            width={100}
            height={60}
            className='h-12 w-auto mx-auto'
            priority
          />
        </div>
        <div className='inline-flex items-center px-4 py-2 gap-2 bg-primary-200/10 border border-primary-200/20 rounded-full'>
          <Sparkles className='h-4 w-4 text-primary-200' />
          <span className='text-primary-200 text-sm font-medium'>
            Plateforme d&apos;inclusion financière
          </span>
        </div>
      </div>

      {/* Register Card */}
      <div className='w-full max-w-md mx-auto'>
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8'>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
