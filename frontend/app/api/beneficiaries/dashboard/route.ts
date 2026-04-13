import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { userId: sessionUserId, getToken } = await auth({
      treatPendingAsSignedOut: false,
    });

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const targetUserId = request.nextUrl.searchParams.get('userId');
    if (!targetUserId) {
      return NextResponse.json({ error: 'Le paramètre userId est requis' }, { status: 400 });
    }

    const token = await getBackendToken(getToken);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${process.env.NEXT_PUBLIC_API_URL}/beneficiaries/dashboard?userId=${encodeURIComponent(targetUserId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      let body: { message?: string; error?: string } = {};
      try {
        body = JSON.parse(text);
      } catch {
        body = { message: text || response.statusText };
      }
      return NextResponse.json(
        { error: body.error ?? body.message ?? 'Erreur lors de la récupération du dashboard' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API dashboard bénéficiaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
