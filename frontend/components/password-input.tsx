"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Input } from "./ui/input";

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  showPasswordToggle?: boolean;
}

function PasswordInputComponent(
  { className, showPasswordToggle = true, ...props }: PasswordInputProps,
  ref: React.Ref<HTMLInputElement>
) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn(
          showPasswordToggle && "pr-10",
          className
        )}
        ref={ref}
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}

const PasswordInput = React.forwardRef(PasswordInputComponent);

export { PasswordInput };
