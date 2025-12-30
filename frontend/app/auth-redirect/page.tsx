'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useGetUserRedirect } from '@/lib/get-user-redirect';

export default function AuthRedirectPage() {
  const { redirectUrl, isLoaded } = useGetUserRedirect();
  const router = useRouter();

  useEffect(() => {
    // Attendre que les données soient chargées avant de rediriger
    if (isLoaded) {
      router.replace(redirectUrl);
    }
  }, [redirectUrl, isLoaded, router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='inline-flex size-12 animate-spin rounded-full border-4 border-primary-300 border-b-transparent mb-4' />
        <p className='text-gray-600 text-sm'>Redirection en cours...</p>
      </div>
    </div>
  );
}
