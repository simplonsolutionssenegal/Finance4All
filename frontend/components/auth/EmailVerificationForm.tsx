'use client';

import { useSignUp } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SignupPayload {
  signUpId: string;
  email: string;
  firstName: string;
  lastName: string;
  organisationId?: string | null;
}

interface EmailVerificationFormProps {
  clerkId?: string;
}

export default function EmailVerificationForm({ clerkId: _clerkId }: EmailVerificationFormProps) {
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [_email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const _clerkIdFromParams = searchParams?.get('clerkId') || _clerkId;

  useEffect(() => {
    // Récupérer l'email depuis l'URL ou le localStorage
    const emailFromUrl = searchParams?.get('email');
    const savedData = typeof window !== 'undefined' ? localStorage.getItem('signup_payload') : null;

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    } else if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as SignupPayload;
        setEmail(parsed.email || '');
      } catch (e) {
        console.warn('Failed to parse signup_payload from localStorage', e);
      }
    }
  }, [searchParams]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!code || code.length !== 6) {
      setErrorMessage('Veuillez entrer un code à 6 chiffres');
      setIsLoading(false);
      return;
    }

    try {
      // Récupérer le signUpId depuis localStorage
      const savedData =
        typeof window !== 'undefined' ? localStorage.getItem('signup_payload') : null;

      if (!savedData) {
        setErrorMessage("Données d'inscription manquantes. Veuillez recommencer l'inscription.");
        setIsLoading(false);
        return;
      }

      let signUpId: string;
      try {
        const parsed = JSON.parse(savedData) as SignupPayload;
        signUpId = parsed.signUpId;
        if (!signUpId) {
          throw new Error('signUpId manquant');
        }
      } catch (e) {
        console.warn('Failed to parse signup_payload from localStorage', e);
        setErrorMessage("Données d'inscription invalides. Veuillez recommencer l'inscription.");
        setIsLoading(false);
        return;
      }

      // Utiliser le SDK Clerk pour vérifier l'email (approche recommandée)
      if (!isSignUpLoaded || !signUp) {
        setErrorMessage('SDK Clerk non initialisé. Veuillez rafraîchir la page.');
        setIsLoading(false);
        return;
      }

      // Vérifier le code avec Clerk SDK
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

      if (completeSignUp.status === 'complete' && completeSignUp.createdUserId) {
        console.warn('✅ Email vérifié avec succès dans Clerk !');
        console.warn('👤 Utilisateur créé avec ID:', completeSignUp.createdUserId);

        // MAINTENANT: Appeler le backend pour enregistrer les métadonnées business
        try {
          const savedData =
            typeof window !== 'undefined' ? localStorage.getItem('signup_payload') : null;
          let userData: Partial<SignupPayload> = {};

          if (savedData) {
            userData = JSON.parse(savedData) as SignupPayload;
          }

          const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkUserId: completeSignUp.createdUserId,
              email: userData.email || '',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              organisationId: userData.organisationId || null,
            }),
          });

          if (response.ok) {
            console.warn('✅ Métadonnées sauvegardées dans le backend !');
          } else {
            console.warn('⚠️ Erreur backend, mais utilisateur créé dans Clerk');
          }
        } catch (backendError) {
          console.warn('⚠️ Erreur backend:', backendError);
          // On continue même si le backend échoue, car Clerk a réussi
        }

        // Nettoyer le localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('signup_payload');
        }

        // Activer la session Clerk
        if (completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId });
        }

        toast.success('Votre compte a été créé avec succès !');
        router.push('/dashboard');
      } else {
        throw new Error("La vérification n'est pas complète. Veuillez réessayer.");
      }
    } catch (error: unknown) {
      console.error('Erreur lors de la vérification:', error);
      const errorMessage =
        (error as Error)?.message || 'Code de vérification invalide ou expiré. Veuillez réessayer.';
      setErrorMessage(errorMessage);
      toast.error('Erreur lors de la vérification du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isSignUpLoaded) {
      toast.error('Initialisation en cours...');
      return;
    }

    try {
      setIsLoading(true);

      // Demander un nouveau code de vérification via Clerk
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      toast.success('Un nouveau code a été envoyé à votre adresse email');
    } catch (error: unknown) {
      console.error('Erreur renvoi code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Erreur lors de l'envoi d'un nouveau code: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Vérification de l&apos;email</h1>
        <p className='mt-2 text-sm text-gray-600'>
          Entrez le code à 6 chiffres envoyé à {_email || 'votre adresse email'}
        </p>
      </div>

      <form onSubmit={handleVerification} className='space-y-4'>
        <div>
          <label htmlFor='code' className='block text-sm font-medium text-gray-700'>
            Code de vérification
          </label>
          <input
            id='code'
            name='code'
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            autoComplete='one-time-code'
            required
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
            disabled={isLoading}
          />
          {errorMessage && <p className='mt-2 text-sm text-red-600'>{errorMessage}</p>}
        </div>

        <div>
          <button
            type='submit'
            disabled={isLoading || !code.trim()}
            className='flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
            style={{ backgroundColor: 'var(--primary-200)', color: 'white' }}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Vérification...
              </>
            ) : (
              'Vérifier le code'
            )}
          </button>
        </div>
      </form>

      <div className='text-center text-sm'>
        <button
          type='button'
          onClick={handleResendCode}
          disabled={isLoading}
          style={{ color: 'var(--primary-200)' }}
        >
          {isLoading ? 'Envoi en cours...' : 'Renvoyer le code'}
        </button>
      </div>
    </div>
  );
}
