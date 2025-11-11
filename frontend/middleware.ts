import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export default clerkMiddleware((auth, req: NextRequest) => {
  // Skip authentication for health check endpoint
  if (req.nextUrl.pathname === '/api/health') {
    return NextResponse.next();
  }

  // Apply default Clerk authentication for all other routes
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes, EXCEPT health check
    '/(api|trpc)(?!/health)(.*)',
  ],
};
