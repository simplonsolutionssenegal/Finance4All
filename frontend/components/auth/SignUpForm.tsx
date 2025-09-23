'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isLoaded || !signUp) {
        toast.error("Clerk n'est pas encore chargé. Veuillez rafraîchir la page.");
        return;
      }

      console.warn('Starting Clerk SignUp process:', formData);

      // Créer le SignUp directement avec Clerk (cela envoie automatiquement l'email)
      const signUpAttempt = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });

      console.warn('Clerk SignUp created:', signUpAttempt);

      // Mettre à jour avec les noms (optionnel)
      try {
        await signUp.update({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        console.warn('Names updated successfully');
      } catch (updateError) {
        console.warn('Could not update names, but continuing:', updateError);
      }

      // Préparer la vérification d'email (cela envoie l'email de vérification)
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      console.warn('📧 Email de vérification envoyé !');

      // Sauvegarder les infos pour la page de vérification
      try {
        window.localStorage.setItem(
          'signup_payload',
          JSON.stringify({
            signUpId: signUpAttempt.id,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
          })
        );
      } catch (e) {
        console.warn('Failed to write signup_payload to localStorage', e);
      }

      toast.success('Un code de vérification a été envoyé à votre email !');
      router.push('/sign-up/verify-email-address');
    } catch (error: unknown) {
      console.error('Clerk SignUp error:', error);

      let errorMessage = "Une erreur inattendue s'est produite";

      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        Array.isArray(error.errors) &&
        error.errors[0]
      ) {
        const clerkError = error.errors[0];
        if (clerkError.code === 'form_identifier_exists') {
          errorMessage = 'Un compte avec cette adresse email existe déjà';
        } else if (clerkError.code === 'form_password_pwned') {
          errorMessage = 'Ce mot de passe a été compromis. Veuillez en choisir un autre.';
        } else if (clerkError.code === 'form_password_validation_failed') {
          errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité requis';
        } else {
          errorMessage = clerkError.message || errorMessage;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='firstName' className='text-sm font-medium'>
            Prénom*
          </Label>
          <Input
            id='firstName'
            name='firstName'
            type='text'
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className='w-full'
            placeholder='Entrez votre prénom'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='lastName' className='text-sm font-medium'>
            Nom*
          </Label>
          <Input
            id='lastName'
            name='lastName'
            type='text'
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className='w-full'
            placeholder='Entrez votre nom'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-medium'>
          Email*
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleInputChange}
          required
          className='w-full'
          placeholder='Entrez votre adresse email'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password' className='text-sm font-medium'>
          Mot de passe*
        </Label>
        <Input
          id='password'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleInputChange}
          required
          className='w-full'
          placeholder='Créez un mot de passe'
        />
      </div>

      <Button
        type='submit'
        className='w-full'
        disabled={isLoading || !isLoaded}
        style={{ backgroundColor: 'var(--primary-200)', color: 'white' }}
      >
        {isLoading ? 'Inscription en cours...' : "S'inscrire"}
      </Button>
    </form>
  );
}
