'use client';

import { CheckCircle2, Loader2, Mail, Users, XCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClerkAcceptInvitationProps {
  invitationId?: string;
  orgId?: string;
  clerkTicket?: string;
}

interface InvitationMetadata {
  firstName: string;
  lastName: string;
  emailAddress: string;
  organizationName?: string;
  role?: string;
}

type PageState = 'loading' | 'ready' | 'sending-otp' | 'otp' | 'verifying' | 'success' | 'error';

export function ClerkAcceptInvitation({
  invitationId,
  orgId,
  clerkTicket,
}: Readonly<ClerkAcceptInvitationProps>) {
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<InvitationMetadata | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resolvedInvitationId, setResolvedInvitationId] = useState<string | undefined>(
    invitationId
  );
  const [resolvedOrgId, setResolvedOrgId] = useState<string | undefined>(orgId);

  // ── Fetch invitation on mount ──
  useEffect(() => {
    const fetchInvitationData = async () => {
      let currentInvitationId = invitationId;
      let currentOrgId = orgId;

      // Si on a un clerkTicket mais pas les IDs, résoudre via l'API
      if (!currentInvitationId && clerkTicket && currentOrgId) {
        try {
          const ticketResponse = await fetch('/api/accept-invitation/resolve-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket: clerkTicket, orgId: currentOrgId }),
          });
          if (ticketResponse.ok) {
            const ticketData = await ticketResponse.json();
            if (ticketData.success) {
              currentInvitationId = ticketData.invitationId;
              currentOrgId = ticketData.orgId;
              setResolvedInvitationId(currentInvitationId);
              setResolvedOrgId(currentOrgId);
            }
          }
        } catch {
          // Fallback: continue sans résolution du ticket
        }
      }

      if (!currentInvitationId || !currentOrgId) {
        setError("Lien d'invitation invalide. Paramètres manquants.");
        setState('error');
        return;
      }

      try {
        const response = await fetch('/api/get-invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationId: currentInvitationId, orgId: currentOrgId }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || "Impossible de charger l'invitation");
        }

        const data = await response.json();

        if (data.success && data.invitation) {
          const { publicMetadata, emailAddress, organizationName, role } = data.invitation;
          setInvitationData({
            firstName: publicMetadata?.firstName || '',
            lastName: publicMetadata?.lastName || '',
            emailAddress,
            organizationName,
            role,
          });
          setState('ready');
        } else {
          throw new Error('Invitation introuvable ou expirée');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        setState('error');
      }
    };

    fetchInvitationData();
  }, [invitationId, orgId, clerkTicket]);

  // ── Send OTP ──
  const handleSendOtp = useCallback(async () => {
    if (!invitationData) return;

    setState('sending-otp');
    setError(null);

    try {
      const response = await fetch('/api/accept-invitation/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitationData.emailAddress,
          firstName: invitationData.firstName,
          organizationName: invitationData.organizationName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Impossible d'envoyer le code");
      }

      setOtpToken(data.token);
      setOtpDigits(['', '', '', '', '', '']);
      setState('otp');

      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setState('ready');
    }
  }, [invitationData]);

  // ── OTP input handlers ──
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const newDigits = [...otpDigits];

      if (value.length > 1) {
        // Handle paste
        const chars = value.slice(0, 6).split('');
        chars.forEach((char, i) => {
          if (index + i < 6) newDigits[index + i] = char;
        });
        setOtpDigits(newDigits);
        const nextIndex = Math.min(index + chars.length, 5);
        inputRefs.current[nextIndex]?.focus();
      } else {
        newDigits[index] = value;
        setOtpDigits(newDigits);
        if (value && index < 5) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    },
    [otpDigits]
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits]
  );

  const otpCode = otpDigits.join('');
  const isOtpComplete = otpCode.length === 6;

  // ── Verify OTP & accept invitation ──
  const handleVerifyOtp = useCallback(async () => {
    if (!invitationData || !otpToken || !isOtpComplete) return;

    setState('verifying');
    setError(null);

    try {
      const response = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: resolvedInvitationId,
          orgId: resolvedOrgId,
          firstName: invitationData.firstName,
          lastName: invitationData.lastName,
          emailAddress: invitationData.emailAddress,
          otpCode,
          otpToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Erreur lors de l'acceptation");
      }

      setState('success');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setState('otp');
    }
  }, [
    invitationData,
    otpToken,
    isOtpComplete,
    otpCode,
    resolvedInvitationId,
    resolvedOrgId,
    router,
  ]);

  // ── Helpers ──
  const roleFrench = (role?: string) => {
    switch (role) {
      case 'org:admin':
        return 'Administrateur';
      case 'org:member':
        return 'Membre';
      case 'org:recipient':
        return 'Bénéficiaire';
      default:
        return 'Membre';
    }
  };

  // ── Loading ──
  if (state === 'loading') {
    return (
      <div className='flex flex-col items-center py-8'>
        <Loader2 className='w-8 h-8 text-primary-300 animate-spin mb-4' />
        <p className='text-neutral-500 text-sm'>Chargement de l&apos;invitation...</p>
      </div>
    );
  }

  // ── Success ──
  if (state === 'success') {
    return (
      <div className='flex flex-col items-center py-8'>
        <div className='w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6'>
          <CheckCircle2 className='w-8 h-8 text-green-500' />
        </div>
        <h2 className='text-xl font-semibold text-neutral-900 mb-2'>Invitation acceptée !</h2>
        <p className='text-neutral-500 text-center text-sm mb-4'>
          Votre compte a été créé avec succès.
          <br />
          Redirection vers la page de connexion...
        </p>
        <p className='text-neutral-400 text-xs'>
          Connectez-vous avec votre email pour recevoir un code OTP.
        </p>
      </div>
    );
  }

  // ── Fatal error (invitation not found) ──
  if (state === 'error' && !invitationData) {
    return (
      <div className='flex flex-col items-center py-8'>
        <div className='w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6'>
          <XCircle className='w-8 h-8 text-red-500' />
        </div>
        <h2 className='text-xl font-semibold text-neutral-900 mb-2'>Erreur</h2>
        <p className='text-red-500 text-center text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4'>
          {error}
        </p>
        <Button onClick={() => router.push('/login')} variant='outline' className='cursor-pointer'>
          Retour à la connexion
        </Button>
      </div>
    );
  }

  // ── OTP verification screen ──
  if (state === 'otp' || state === 'verifying') {
    return (
      <div className='max-w-md w-full mx-auto'>
        <div className='flex flex-col items-center mb-8'>
          <div className='w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6'>
            <Mail className='w-8 h-8 text-primary-300' strokeWidth={1.5} />
          </div>
          <h1 className='text-2xl font-semibold text-neutral-900 mb-2'>Vérification</h1>
          <p className='text-neutral-500 text-center text-sm px-4'>
            Un code à 6 chiffres a été envoyé à<br />
            <span className='font-medium text-neutral-700'>{invitationData?.emailAddress}</span>
          </p>
        </div>

        {/* OTP input */}
        <div className='flex justify-center gap-3 mb-6'>
          {otpDigits.map((digit, i) => (
            <Input
              key={i}
              ref={el => {
                inputRefs.current[i] = el;
              }}
              type='text'
              inputMode='numeric'
              maxLength={i === 0 ? 6 : 1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              disabled={state === 'verifying'}
              className='w-12 h-14 text-center text-xl font-semibold border-neutral-200 focus:border-primary-300 focus:ring-primary-200 rounded-xl'
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
            />
          ))}
        </div>

        {error && (
          <div className='text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4 text-center'>
            {error}
          </div>
        )}

        <Button
          onClick={handleVerifyOtp}
          disabled={!isOtpComplete || state === 'verifying'}
          className='w-full h-12 bg-primary-300 hover:bg-primary-300/90 text-white font-medium rounded-md cursor-pointer'
        >
          {state === 'verifying' ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-5 w-5 animate-spin' />
              Vérification...
            </span>
          ) : (
            'Vérifier et accepter'
          )}
        </Button>

        <div className='flex items-center justify-between mt-4'>
          <button
            onClick={() => {
              setState('ready');
              setError(null);
            }}
            className='text-neutral-400 text-sm hover:text-neutral-600 flex items-center gap-1 cursor-pointer'
          >
            <ArrowLeft className='w-3 h-3' /> Retour
          </button>
          <button
            onClick={handleSendOtp}
            disabled={state === 'verifying'}
            className='text-primary-300 text-sm hover:text-primary-400 cursor-pointer disabled:opacity-50'
          >
            Renvoyer le code
          </button>
        </div>
      </div>
    );
  }

  // ── Ready — show invitation details ──
  return (
    <div className='max-w-md w-full mx-auto'>
      <div className='flex flex-col items-center mb-8'>
        <div className='w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6'>
          <Users className='w-8 h-8 text-primary-300' strokeWidth={1.5} />
        </div>
        <h1 className='text-2xl font-semibold text-neutral-900 mb-2'>
          Rejoindre {invitationData?.organizationName || "l'organisation"}
        </h1>
        <p className='text-neutral-500 text-center text-sm px-4'>
          Vous avez été invité(e) en tant que{' '}
          <span className='font-medium text-neutral-700'>{roleFrench(invitationData?.role)}</span>
        </p>
      </div>

      <div className='space-y-3 mb-8'>
        <div className='flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100'>
          <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm'>
            <Mail className='w-5 h-5 text-neutral-400' />
          </div>
          <div>
            <p className='text-xs text-neutral-400 font-medium'>Adresse email</p>
            <p className='text-sm text-neutral-900 font-medium'>{invitationData?.emailAddress}</p>
          </div>
        </div>

        {(invitationData?.firstName || invitationData?.lastName) && (
          <div className='flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100'>
            <div className='w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm'>
              <Users className='w-5 h-5 text-neutral-400' />
            </div>
            <div>
              <p className='text-xs text-neutral-400 font-medium'>Nom complet</p>
              <p className='text-sm text-neutral-900 font-medium'>
                {invitationData?.firstName} {invitationData?.lastName}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className='text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4 text-center'>
          {error}
        </div>
      )}

      <Button
        onClick={handleSendOtp}
        disabled={state === 'sending-otp'}
        className='w-full h-12 bg-primary-300 hover:bg-primary-300/90 text-white font-medium text-base rounded-md cursor-pointer'
      >
        {state === 'sending-otp' ? (
          <span className='flex items-center gap-2'>
            <Loader2 className='h-5 w-5 animate-spin' />
            Envoi du code...
          </span>
        ) : (
          "Accepter l'invitation"
        )}
      </Button>

      <p className='text-neutral-400 text-xs text-center mt-4'>
        Un code de vérification sera envoyé à votre adresse email.
      </p>
    </div>
  );
}
