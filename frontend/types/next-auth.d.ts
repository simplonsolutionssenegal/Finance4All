// types/next-auth.d.ts

export {};

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    roles?: string[];
    user?: {
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    token: string;
    refreshToken: string;
    roles: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    roles?: string[];
    name?: string;
    email?: string;
  }
}
