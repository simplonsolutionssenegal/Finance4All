// frontend/app/api/quizzes/[quizId]/progress/me/route.ts
// Proxy pour le quiz progress - récupère le token depuis la session Clerk (cookies)

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
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

    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json({ success: false, message: 'quizId manquant' }, { status: 400 });
    }

    const token = await getBackendToken(getToken);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/quizzes/${quizId}/progress/me`);
    url.searchParams.set('userId', userId);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        (data as { message?: string }).message || 'Erreur lors de la récupération du progrès quiz';
      return NextResponse.json({ success: false, message, ...data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API quiz progress:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération du progrès quiz' },
      { status: 500 }
    );
  }
}
