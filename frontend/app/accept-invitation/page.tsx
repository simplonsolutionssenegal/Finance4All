import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';

import { ClerkAcceptInvitation } from '@/components/clerk-accept-invitation';

interface AcceptInvitationPageProps {
  searchParams: Promise<{
    invitation_id: string;
    org_id: string;
  }>;
}

export default async function AcceptInvitationPage({
  searchParams,
}: Readonly<AcceptInvitationPageProps>) {
  const params = await searchParams;

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative flex flex-col justify-center items-center px-4 py-8'>
      {/* Gradient Circle - Glow effect top right */}
      <div className='absolute top-10 right-10 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl pointer-events-none' />

      {/* Logo */}
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
          <span className='text-primary-300 text-sm font-medium'>
            Plateforme d&apos;inclusion financière
          </span>
        </div>
      </div>

      {/* Auth Card */}
      <div className='w-full max-w-md mx-auto'>
        <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-8'>
          <Suspense fallback={<div className='text-center'>Chargement...</div>}>
            <ClerkAcceptInvitation invitationId={params.invitation_id} orgId={params.org_id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
