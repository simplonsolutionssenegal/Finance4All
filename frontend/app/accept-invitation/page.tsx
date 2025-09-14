import Image from 'next/image';
import { Suspense } from 'react';

import { ClerkAcceptInvitation } from '@/components/clerk-accept-invitation';

interface AcceptInvitationPageProps {
  searchParams: Promise<{
    invitation_id: string;
    org_id: string;
  }>;
}

export default async function AcceptInvitationPage({ searchParams }: AcceptInvitationPageProps) {
  const params = await searchParams;

  return (
    <div className='min-h-screen flex flex-col lg:flex-row'>
      <div className='hidden lg:flex lg:w-1/2 bg-primary-400 relative overflow-hidden'>
        <div className='absolute inset-0'>
          <Image
            src='/assets/images/login-bg.svg'
            alt='Background image'
            fill
            className='object-cover opacity-50'
            priority
            sizes='(max-width: 1024px) 0px, 50vw'
          />
        </div>

        <div className='relative z-10 flex flex-col justify-center px-12 text-white'>
          <h1 className='text-4xl font-bold mb-6 leading-tight'>Rejoignez votre organisation</h1>
          <p className='text-lg text-white/90 leading-relaxed'>
            Vous avez été invité à rejoindre une organisation sur Finance4All. Acceptez votre
            invitation pour commencer à collaborer.
          </p>
        </div>
      </div>

      <div className='w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-0'>
        <div className='mb-8 max-w-md w-full mx-auto'>
          <Image
            src='/logo.svg'
            alt='Finance4All Logo'
            width={200}
            height={60}
            className='h-12 w-auto'
            priority
          />
        </div>

        <Suspense
          fallback={<div className='max-w-md w-full mx-auto text-center'>Chargement...</div>}
        >
          <ClerkAcceptInvitation invitationId={params.invitation_id} orgId={params.org_id} />
        </Suspense>
      </div>
    </div>
  );
}
