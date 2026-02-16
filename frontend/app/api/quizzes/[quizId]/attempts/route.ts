import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';

interface RouteParams {
  params: Promise<{ quizId: string }>;
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

    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json({ success: false, message: 'quizId manquant' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const answers = body?.answers;
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, message: 'answers manquant ou invalide' },
        { status: 400 }
      );
    }

    const token = await getBackendToken(getToken);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/quizzes/${quizId}/attempts`);
    url.searchParams.set('userId', userId);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ answers }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        (data as { message?: string }).message || 'Erreur lors de la soumission du quiz';
      return NextResponse.json({ success: false, message, ...data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API quiz attempts:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la soumission du quiz' },
      { status: 500 }
    );
  }
}
