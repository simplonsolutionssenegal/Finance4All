import Image from "next/image";

import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPassword() {

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Section gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-400 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/login-bg.png"
            alt="Background image"
            fill
            className="object-cover opacity-50"
            priority
            sizes="(max-width: 1024px) 0px, 50vw"
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
        <div className="mb-8 max-w-md w-full mx-auto">
          <Image
            src="/logo.svg"
            alt="Finance4All Logo"
            width={200}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </div>
        
        <ForgotPasswordForm />
      </div>
    </div>
  );
}