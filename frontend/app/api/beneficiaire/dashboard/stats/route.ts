// frontend/app/api/beneficiaire/dashboard/stats/route.ts

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { userId, getToken } = await auth({
      treatPendingAsSignedOut: false,
    });

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé - session invalide ou expirée' },
        { status: 401 }
      );
    }

    const token = await getBackendToken(getToken);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${process.env.NEXT_PUBLIC_API_URL}/beneficiaries/dashboard?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      let body: { message?: string; error?: string; path?: string } = {};
      try {
        body = JSON.parse(text);
      } catch {
        body = { message: text || response.statusText };
      }
      const is404 = response.status === 404;
      const backendPath = body.path ?? url;
      const errorMessage =
        is404 && (body.error ?? body.message) === 'Route not found'
          ? `Backend non trouvé (404). Vérifiez que le backend est démarré et que NEXT_PUBLIC_API_URL pointe vers l’API (ex. http://localhost:4002 ou http://localhost:4002/api/v1). Appel: ${backendPath}`
          : (body.error ?? body.message) || 'Erreur lors de la récupération du dashboard';
      return NextResponse.json({ error: errorMessage }, { status: response.status });
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
