"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
      console.log("Email soumis:", email);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Section gauche*/}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-400 relative overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/assets/images/login-bg.png"
            alt="Background image"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Réinitialisez votre mot de passe
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Pas d&apos;inquiétude, ça arrive à tout le monde ! Indiquez simplement l&apos;adresse e-mail associée à votre compte, et nous vous enverrons un lien pour créer un nouveau mot de passe.
          </p>
        </div>
      </div>

      {/* Section droite */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-0">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <Image
              src="/logo.svg"
              alt="Finance4All Logo"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-500 mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-neutral-400 text-sm">
              Entrez votre adresse e-mail pour recevoir un lien de réinitialisation sécurisé
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-500 font-medium">
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 border-neutral-400 focus:border-brand-200 focus:ring-brand-200"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-brand-300 hover:bg-brand-300 text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </Button>

            <p className="text-sm text-neutral-400 text-center">
              Assurez-vous de vérifier vos courriers indésirables si vous ne recevez pas notre e-mail dans quelques minutes.
            </p>
          </form>

          <div className="mt-8 text-center">
            <a
              href="/login"
              className="text-brand-200 hover:text-brand-300 text-sm font-medium transition-colors"
            >
              ← Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
