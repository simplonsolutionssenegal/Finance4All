import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const logout = async () => {
    if (!user) {
      console.warn("Aucune session active trouvée.");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading,
    isUserLoaded: isLoaded,
    hasActiveSession: !!user,
  };
}
