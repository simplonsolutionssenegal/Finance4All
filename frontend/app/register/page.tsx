"use client";

import { useSignUp } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema } from '@/lib/validation/auth';

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Créer l'utilisateur avec Clerk
      const result = await signUp?.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (result) {
        // Envoyer l'email de vérification
        await result.prepareEmailAddressVerification({ strategy: 'email_code' });
        
        // Sauvegarder les données utilisateur dans notre backend
        await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: result.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          }),
        });
        
        // Redirection vers la page de vérification
        router.push('/auth/verify-email');
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      setError('root', {
        type: 'server',
        message: 'Une erreur est survenue lors de l\'inscription',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Image et texte */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Rejoignez notre communauté d'apprenants en finance
          </h1>
          <p className="text-xl opacity-90 max-w-lg">
            Accédez à des formations pratiques, des ressources exclusives et un 
            accompagnement personnalisé pour booster vos compétences financières.
          </p>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Logo et titre */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="text-3xl font-bold">
                <span className="text-teal-600">Finance4</span>
                <span className="text-teal-400 italic">ALL</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">S'inscrire</h2>
            <p className="text-gray-600">Lorem ipsum is simply dummy text</p>
          </div>

          {/* Formulaire */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Erreur globale */}
                {errors.root && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {errors.root.message}
                  </div>
                )}

                {/* Nom et prénom combinés */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">Nom et prénom*</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium sr-only">Nom*</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom et prénom"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Votre email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Mot de passe*</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      {...register('password')}
                      className={errors.password ? 'border-red-500' : 'pr-10'}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password.message}</p>
                  )}
                </div>

                {/* Bouton d'inscription */}
                <Button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Inscription en cours...' : "S'inscrire"}
                </Button>

                {/* Conditions et politique */}
                <p className="text-sm text-gray-600 text-center">
                  En créant un compte, vous acceptez nos{' '}
                  <Link 
                    href="/legal/terms" 
                    className="text-teal-600 hover:text-teal-700 underline"
                  >
                    Conditions utilisation
                  </Link>{' '}
                  et notre{' '}
                  <Link 
                    href="/legal/privacy" 
                    className="text-teal-600 hover:text-teal-700 underline"
                  >
                    Politique de confidentialité
                  </Link>
                  .
                </p>

                {/* Lien connexion */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Déjà membre ? {' '}
                    <Link 
                      href="/auth/login" 
                      className="text-teal-500 hover:text-teal-600 font-medium"
                    >
                      connectez-vous
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}