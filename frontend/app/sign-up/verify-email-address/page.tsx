import EmailVerificationForm from '@/components/auth/EmailVerificationForm';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const clerkIdFromParams = params.clerkId as string;

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4'>
      <EmailVerificationForm clerkId={clerkIdFromParams} />
    </div>
  );
}
