import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth({ treatPendingAsSignedOut: false });

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const token = await getBackendToken(getToken);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${process.env.NEXT_PUBLIC_API_URL}/beneficiaries/self-register`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, clerkUserId: userId }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorBody: { message?: string; error?: string } = {};
      try {
        errorBody = JSON.parse(text);
      } catch {
        errorBody = { message: text || response.statusText };
      }
      return NextResponse.json(
        { error: errorBody.error ?? errorBody.message ?? 'Erreur' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API self-register bénéficiaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
