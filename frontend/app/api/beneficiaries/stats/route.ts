import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

import { getBackendToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { userId, getToken } = await auth({ treatPendingAsSignedOut: false });

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const orgId = request.nextUrl.searchParams.get('orgId') ?? '';
    const token = await getBackendToken(getToken);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
    const url = `${process.env.NEXT_PUBLIC_API_URL}/beneficiaries/stats${params}`;

    const response = await fetch(url, { method: 'GET', headers, cache: 'no-store' });

    if (!response.ok) {
      const text = await response.text();
      let body: { message?: string; error?: string } = {};
      try {
        body = JSON.parse(text);
      } catch {
        body = { message: text || response.statusText };
      }
      return NextResponse.json(
        { error: body.error ?? body.message ?? 'Erreur' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API stats bénéficiaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
