import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';

interface RouteParams {
  params: Promise<{ moduleId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId, getToken } = await auth({
      treatPendingAsSignedOut: false,
    });

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé - session invalide ou expirée' },
        { status: 401 }
      );
    }

    const { moduleId } = await params;
    if (!moduleId) {
      return NextResponse.json({ success: false, message: 'moduleId manquant' }, { status: 400 });
    }

    const token = await getBackendToken(getToken);
    // Toujours passer userId en query : le backend l'utilise en secours si le token est absent ou invalide
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/modules/${moduleId}/enroll`);
    url.searchParams.set('userId', userId);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        (data as { message?: string }).message || `Erreur lors de l'inscription au module`;
      return NextResponse.json({ success: false, message, ...data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API enrollment module:', error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'inscription au module" },
      { status: 500 }
    );
  }
}
