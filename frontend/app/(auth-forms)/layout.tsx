'use client';

import { Sparkles, X, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import {
  RegisterFormProvider,
  useRegisterFormStepOptional,
} from '@/contexts/register-form-context';

interface AuthFormsLayoutProps {
  children: React.ReactNode;
}

function SecurityMessage() {
  const pathname = usePathname();
  const registerFormContext = useRegisterFormStepOptional();
  const registerStep = registerFormContext?.step ?? null;

  const securityMessage = useMemo(() => {
    if (pathname?.includes('/login')) {
      return 'Connexion sécurisée par code OTP ou réseaux sociaux';
    }
    if (pathname?.includes('/register')) {
      // Si on est à l'étape 2 (vérification OTP), afficher le texte spécifique
      if (registerStep === 2) {
        return 'Données sécurisées • Connexion par code OTP (SMS & Email)';
      }
      // Sinon, texte par défaut pour l'étape 1
      return 'Connexion sécurisée par code OTP ou réseaux sociaux';
    }
    return 'Connexion sécurisée par code OTP ou réseaux sociaux';
  }, [pathname, registerStep]);

  return (
    <div className='mt-4 w-full max-w-md mx-auto'>
      <div className='bg-white shadow-sm rounded-lg p-4 flex items-center gap-3'>
        <Shield className='h-5 w-5 text-green-600 flex-shrink-0' />
        <p className='text-sm text-gray-600 font-medium'>{securityMessage}</p>
      </div>
    </div>
  );
}

export default function AuthFormsLayout({ children }: AuthFormsLayoutProps) {
  const pathname = usePathname();

  // Déterminer le backHref selon la route actuelle
  const getBackHref = () => {
    if (pathname?.includes('/register')) return '/login';
    return '/';
  };

  // Déterminer le tagline selon la route
  const tagline = useMemo(() => {
    if (pathname?.includes('/register')) {
      return 'Rejoignez Finance4All';
    }
    return "Plateforme d'inclusion financière";
  }, [pathname]);

  return (
    <RegisterFormProvider>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative flex flex-col justify-center items-center px-4 py-8'>
        {/* Gradient Circle - Glow effect top right */}
        <div className='absolute top-10 right-10 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl pointer-events-none' />

        {/* Close Button */}
        <div className='absolute top-6 right-6 z-20'>
          <Link
            href={getBackHref()}
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
          <div className='inline-flex items-center px-4 py-2 gap-2 bg-primary-300/10 border border-primary-200/20 rounded-full'>
            <Sparkles className='h-4 w-4 text-primary-300' />
            <span className='text-primary-300 text-sm font-medium'>{tagline}</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className='w-full max-w-md mx-auto'>
          <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-8'>
            {children}
          </div>
        </div>
        {/* Security Message */}
        <SecurityMessage />
      </div>
    </RegisterFormProvider>
  );
}
