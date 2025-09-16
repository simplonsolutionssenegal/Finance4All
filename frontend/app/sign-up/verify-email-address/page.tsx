'use client';

import { useSignUp, useSession, useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { registerUser } from '@/lib/api/auth';

type MaybeString = string | null | undefined;

async function registerFromContext(
  signUp: {
    createdUserId?: MaybeString;
    unsafeMetadata?: Record<string, unknown>;
  } | null,
  user: {
    id?: MaybeString;
    firstName?: MaybeString;
    lastName?: MaybeString;
    primaryEmailAddress?: { emailAddress?: MaybeString } | null;
  } | null
): Promise<boolean> {
  let payload: { email?: string; firstName?: string; lastName?: string } = {};
  try {
    const raw = window.localStorage.getItem('signup_payload');
    payload = raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to parse signup payload from localStorage', error);
    return false;
  }

  const clerkId = signUp?.createdUserId || user?.id || '';
  const email = user?.primaryEmailAddress?.emailAddress || payload.email || '';
  const firstName =
    (signUp?.unsafeMetadata && typeof signUp.unsafeMetadata.first_name === 'string'
      ? signUp.unsafeMetadata.first_name
      : null) ||
    user?.firstName ||
    payload.firstName ||
    '';
  const lastName =
    (signUp?.unsafeMetadata && typeof signUp.unsafeMetadata.last_name === 'string'
      ? signUp.unsafeMetadata.last_name
      : null) ||
    user?.lastName ||
    payload.lastName ||
    '';

  if (clerkId && email && firstName && lastName) {
    try {
      await registerUser({ clerkId, email, firstName, lastName });
      try {
        window.localStorage.removeItem('signup_payload');
      } catch (error) {
        console.error('Failed to remove signup payload from localStorage', error);
      }
      return true;
    } catch (error) {
      console.error('Failed to register user in backend', error);
      return false;
    }
  }

  console.error('Missing data to register user in backend', {
    clerkId,
    email,
    firstName,
    lastName,
  });
  return false;
}

async function handleSuccessfulVerification(
  signUp: any,
  setActive: any,
  user: any,
  hasRegistered: boolean,
  setHasRegistered: React.Dispatch<React.SetStateAction<boolean>>
): Promise<boolean> {
  try {
    if (signUp.createdSessionId) {
      await setActive({ session: signUp.createdSessionId });
    }

    if (!hasRegistered) {
      const didRegister = await registerFromContext(
        {
          createdUserId: signUp.createdUserId,
          unsafeMetadata: signUp.unsafeMetadata,
        },
        user ?? null
      );
      if (didRegister) {
        setHasRegistered(true);
      }
      return didRegister;
    }
    return true;
  } catch (error) {
    console.error('Error in post-verification process:', error);
    throw error;
  }
}

async function handleAlreadyVerifiedCase(
  signUp: any,
  setActive: any,
  userData: {
    user: any;
    hasRegistered: boolean;
    setHasRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  },
  router: any
) {
  try {
    if (signUp.createdSessionId) {
      await setActive({ session: signUp.createdSessionId });

      if (!userData.hasRegistered) {
        const didRegister = await registerFromContext(
          { createdUserId: signUp.createdUserId, unsafeMetadata: signUp.unsafeMetadata },
          userData.user ?? null
        );
        if (didRegister) userData.setHasRegistered(true);
      }

      toast.success('Votre email a déjà été vérifié.');
      router.push('/dashboard');
    } else {
      toast.error('Vérification déjà effectuée. Veuillez vous connecter.');
      router.push('/sign-in');
    }
  } catch (error) {
    console.error('Error activating session for already verified email:', error);
    toast.error('Erreur de connexion. Veuillez vous reconnecter.');
    router.push('/sign-in');
  }
}

async function handleVerificationError(
  error: unknown,
  signUp: any,
  setActive: any,
  userData: {
    user: any;
    hasRegistered: boolean;
    setHasRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  },
  navigation: {
    router: any;
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  }
): Promise<void> {
  console.error('Error verifying email:', error);
  const clerkError = error as {
    errors?: Array<{ code?: string; message?: string }>;
    message?: string;
  };

  if (clerkError.message?.includes('already been verified')) {
    await handleAlreadyVerifiedCase(signUp, setActive, userData, navigation.router);
  } else if (clerkError.errors?.[0]?.code === 'form_code_incorrect') {
    navigation.setErrorMessage('Code incorrect. Veuillez réessayer.');
  } else {
    navigation.setErrorMessage(clerkError.errors?.[0]?.message || 'Erreur lors de la vérification');
  }
}

export default function VerifyEmailPage() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { session } = useSession();
  const { user } = useUser();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasRegistered, setHasRegistered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Vérifier l'état de signUp
  useEffect(() => {
    if (signUp && signUp.status === 'complete') {
      // Si déjà complété mais pas de session, essayer d'activer
      if (signUp.createdSessionId) {
        (async () => {
          try {
            await setActive({ session: signUp.createdSessionId });
            toast.success('Connexion réussie !');
            router.push('/dashboard');
          } catch (error) {
            console.error('Error activating session:', error);
            toast.error('Erreur de connexion. Veuillez vous reconnecter.');
            router.push('/sign-in');
          }
        })();
      }
    }
  }, [signUp, setActive, router]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.warn('Verification result status:', completeSignUp.status);

      if (completeSignUp.status === 'complete') {
        await handleSuccessfulVerification(
          completeSignUp,
          setActive,
          user,
          hasRegistered,
          setHasRegistered
        );
        toast.success('Email vérifié avec succès !');
        router.push('/dashboard');
      } else {
        setErrorMessage('Échec de la vérification. Veuillez réessayer.');
      }
    } catch (error) {
      await handleVerificationError(
        error,
        signUp,
        setActive,
        { user, hasRegistered, setHasRegistered },
        { router, setErrorMessage }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.success('Nouveau code envoyé !');
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error("Impossible d'envoyer un nouveau code");
    }
  };

  if (!isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Vérifiez votre email</h1>
          <p className='text-gray-600'>
            Nous avons envoyé un code à 6 chiffres à votre adresse email.
          </p>
        </div>

        <form onSubmit={handleVerification} className='space-y-4'>
          <div>
            <label htmlFor='code' className='mb-2 block text-sm font-medium'>
              Code de vérification
            </label>
            <input
              id='code'
              type='text'
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className='flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm'
              placeholder='Entrez le code à 6 chiffres'
              maxLength={6}
              required
            />
          </div>

          {errorMessage && (
            <div
              className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm'
              role='alert'
              aria-live='polite'
            >
              {errorMessage}
            </div>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
            style={{ background: 'var(--primary-200)' }}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Vérification...
              </>
            ) : (
              'Vérifier mon email'
            )}
          </button>
        </form>

        <div className='text-center text-sm text-gray-600'>
          <p>
            Vous n&apos;avez pas reçu de code ?{' '}
            <button
              type='button'
              onClick={handleResendCode}
              className='font-medium underline underline-offset-4 hover:underline'
              style={{ color: 'var(--primary-200)' }}
            >
              Renvoyer le code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
