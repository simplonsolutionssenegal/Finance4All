import { useSession } from "next-auth/react";

export function useRole(role: string) {
  const { data: session } = useSession();
  return session?.roles?.includes(role);
}
