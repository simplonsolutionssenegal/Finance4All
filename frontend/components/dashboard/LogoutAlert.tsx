"use client";

import { LogOut, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLogout } from "@/hooks/useLogout";

interface LogoutAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutAlert({ isOpen, onClose }: LogoutAlertProps) {
  const { logout, isLoading } = useLogout();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Empêcher la fermeture du dialog pendant le chargement
  const handleOpenChange = (open: boolean) => {
    if (!isLoading && !open) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md border-0 space-y-4">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl text-red-600">
              Confirmer la déconnexion
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base leading-relaxed">
            Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-3 sm:gap-0">
          <AlertDialogCancel 
            onClick={() => !isLoading && onClose()}
            disabled={isLoading}
            className="flex-1 sm:flex-initial cursor-pointer"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1 cursor-pointer sm:flex-initial bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{isLoading ? "Déconnexion..." : "Se déconnecter"}</span>
            </div>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}