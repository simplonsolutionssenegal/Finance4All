import Image from 'next/image';
import Link from 'next/link';

import SignUpForm from '@/components/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex'>
      {/* Section gauche*/}
      <div
        className='hidden lg:flex lg:w-3/4 text-white p-12 flex-col justify-center relative overflow-hidden'
        style={{ background: 'var(--primary-400)' }}
      >
        <div className="absolute inset-0 bg-[url('/ImageInscription.png')] bg-cover bg-center opacity-10" />
        <div className='relative z-10'>
          <h1 className='text-4xl lg:text-4xl font-bold mb-6 leading-tight'>
            Rejoignez notre communauté d&apos;apprenants en finance
          </h1>
          <p className='text-sm opacity-90 max-w-lg'>
            Accédez à des formations pratiques, des ressources exclusives et un accompagnement
            personnalisé pour booster vos compétences financières.
          </p>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo et titre */}
          <div className='mb-2 flex flex-col items-start px-8'>
            <Image
              src='/logoF4A.jpg'
              alt='Logo Finance4All'
              width={200}
              height={96}
              className='mb-2'
              style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
              priority
            />
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>S&apos;inscrire</h2>
            <p className='text-gray-600'>Lorem ipsum is simply dummy text</p>
          </div>

          {/* Formulaire */}
          <Card className='border-0'>
            <CardContent className='p-8'>
              <SignUpForm />

              {/* Conditions et politique */}
              <p className='text-sm text-gray-600 text-left mt-6'>
                En créant un compte, vous acceptez nos{' '}
                <Link
                  href='/legal/terms'
                  style={{ color: 'var(--primary-200)' }}
                  className='underline'
                >
                  Conditions utilisation
                </Link>{' '}
                et notre{' '}
                <Link
                  href='/legal/privacy'
                  style={{ color: 'var(--primary-200)' }}
                  className='underline'
                >
                  Politique de confidentialité
                </Link>
                .
              </p>

              {/* Lien connexion */}
              <div className='text-left mt-4'>
                <p className='text-sm text-gray-600'>
                  Déjà membre?{' '}
                  <Link
                    href='/sign-in'
                    className='text-teal-500 hover:text-teal-600 font-medium'
                    style={{ color: 'var(--primary-200)' }}
                  >
                    connectez-vous
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
