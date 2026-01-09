import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json({ success: false, message: 'API_URL manquant' }, { status: 500 });
  }

  const { getToken, orgId } = await auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }
  if (!orgId) {
    return NextResponse.json(
      { success: false, message: 'Aucune organisation active' },
      { status: 400 }
    );
  }

  const res = await fetch(`${apiUrl}/api/v1/beneficiaries/${orgId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...body,
      organizationId: orgId,
    }),
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
