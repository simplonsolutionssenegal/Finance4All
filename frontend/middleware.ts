import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { resolveAppRole, canAccessRoute } from '@/lib/role-access';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/health', '/accept-invitation'];

// Routes d'auth — accessibles uniquement aux utilisateurs NON connectes
const AUTH_ROUTES = ['/login', '/register'];

const PUBLIC_PREFIXES = [
  '/about',
  '/faq',
  '/contact',
  '/help',
  '/privacy',
  '/terms',
  '/simulator',
  '/comparator',
  '/formations',
  '/modules-formation',
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 1. Auth check anticipé pour les routes d'auth (login/register)
  // Un utilisateur connecte ne doit pas accéder aux pages de connexion/inscription
  if (AUTH_ROUTES.includes(pathname)) {
    const { userId } = await auth({ treatPendingAsSignedOut: false });
    if (userId) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 2. Routes publiques — pass through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 3. API routes — pass through (backend gere sa propre auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 4. Auth check — treatPendingAsSignedOut: false pour que les beneficiaires
  //    sans organisation (session "pending") ne soient pas bloques
  const { userId, orgRole, sessionClaims } = await auth({ treatPendingAsSignedOut: false });
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 5. Auth redirect page — accessible a tous les authentifies
  if (pathname === '/auth-redirect') {
    return NextResponse.next();
  }

  // 6. Resoudre le role applicatif
  const claims = sessionClaims as Record<string, unknown> | undefined;
  const orgPublicMetadata =
    (claims?.org_public_metadata as Record<string, unknown>) ??
    (claims?.organizationMetadata as Record<string, unknown>) ??
    null;
  const userMetadata = {
    unsafeMetadata: (claims?.metadata as Record<string, unknown>) ?? undefined,
    publicMetadata: (claims?.publicMetadata as Record<string, unknown>) ?? undefined,
  };

  const appRole = resolveAppRole(orgPublicMetadata, orgRole ?? null, userMetadata);

  // 7. Verifier l'acces a la route
  if (!canAccessRoute(appRole, pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|avif|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
