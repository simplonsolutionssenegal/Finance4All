import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { success: false, message: 'API URL manquante', attemptsRemaining: 0 },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Payload invalide', attemptsRemaining: 0 },
        { status: 400 }
      );
    }

    const forwardedFor = req.headers.get('x-forwarded-for') ?? '';

    const response = await fetch(`${apiUrl}/contact/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': forwardedFor,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const json = await response.json().catch(() => ({}));
    return NextResponse.json(json, { status: response.status });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de l'envoi du message",
        attemptsRemaining: 0,
      },
      { status: 500 }
    );
  }
}
