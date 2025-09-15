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
  } catch (_e) {
    void 0;
  }

  const clerkId = signUp?.createdUserId || user?.id || '';
  const email = user?.primaryEmailAddress?.emailAddress || payload.email || '';
  const firstName =
    ((signUp?.unsafeMetadata as Record<string, unknown> | undefined)?.first_name as
      | string
      | undefined) ||
    user?.firstName ||
    payload.firstName ||
    '';
  const lastName =
    ((signUp?.unsafeMetadata as Record<string, unknown> | undefined)?.last_name as
      | string
      | undefined) ||
    user?.lastName ||
    payload.lastName ||
    '';

  if (clerkId && email && firstName && lastName) {
    await registerUser({ clerkId, email, firstName, lastName });
    try {
      window.localStorage.removeItem('signup_payload');
    } catch (_e) {
      void 0;
    }
    return true;
  }

  console.error('Missing data to register user in backend', {
    clerkId,
    email,
    firstName,
    lastName,
  });
  return false;
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
          } catch (_e) {
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
        // Activer la session
        if (completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId });
        }

        // Enregistrer l'utilisateur dans notre backend si pas encore fait
        try {
          if (!hasRegistered) {
            const didRegister = await registerFromContext(
              {
                createdUserId: completeSignUp.createdUserId,
                unsafeMetadata: signUp?.unsafeMetadata,
              },
              user ?? null
            );
            if (didRegister) setHasRegistered(true);
          }
        } catch (regErr) {
          console.error('Error registering user in backend after verification:', regErr);
          // On ne bloque pas la navigation, mais on notifie
          toast.error(
            "L'inscription a été vérifiée, mais l'enregistrement interne a échoué. Vous pourrez réessayer plus tard."
          );
        }
        toast.success('Email vérifié avec succès !');
        router.push('/dashboard');
      } else {
        setErrorMessage('Échec de la vérification. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      const clerkError = error as {
        errors?: Array<{ code?: string; message?: string }>;
        message?: string;
      };

      if (clerkError.message?.includes('already been verified')) {
        // Essayer d'activer la session si déjà vérifié
        try {
          if (signUp.createdSessionId) {
            await setActive({ session: signUp.createdSessionId });
            // Tentative d'enregistrement backend si pas encore fait
            try {
              if (!hasRegistered) {
                const didRegister = await registerFromContext(
                  { createdUserId: signUp.createdUserId, unsafeMetadata: signUp.unsafeMetadata },
                  user ?? null
                );
                if (didRegister) setHasRegistered(true);
              }
            } catch (regErr2) {
              console.error('Error registering user in backend (already verified path):', regErr2);
            }
            toast.success('Votre email a déjà été vérifié.');
            router.push('/dashboard');
          } else {
            toast.error('Vérification déjà effectuée. Veuillez vous connecter.');
            router.push('/sign-in');
          }
        } catch (sessionError) {
          console.error('Error activating session:', sessionError);
          toast.error('Erreur de connexion. Veuillez vous reconnecter.');
          router.push('/sign-in');
        }
      } else if (clerkError.errors?.[0]?.code === 'form_code_incorrect') {
        setErrorMessage('Code incorrect. Veuillez réessayer.');
      } else {
        setErrorMessage(clerkError.errors?.[0]?.message || 'Erreur lors de la vérification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.success('Nouveau code envoyé !');
    } catch (_error) {
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
