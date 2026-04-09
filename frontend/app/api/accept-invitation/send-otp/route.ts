import { createHmac, randomInt } from 'crypto';

import { NextResponse, type NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

const SECRET = process.env.CLERK_SECRET_KEY ?? 'fallback-secret';
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function hashCode(code: string, email: string): string {
  return createHmac('sha256', SECRET).update(`${email}:${code}`).digest('hex');
}

function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    secure: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, organizationName } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email requis' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const code = String(randomInt(100000, 999999));
    const expiry = Date.now() + OTP_TTL_MS;
    const codeHash = hashCode(code, email);

    // Create signed token (no code inside — only hash)
    const token = signToken({ email, codeHash, expiry });

    // Send OTP email
    const fromEmail =
      process.env.MAIL_FROM ?? process.env.MAIL_USERNAME ?? 'noreply@finance4all.com';
    const fromName = process.env.MAIL_FROM_NAME ?? 'Finance4All';

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Code de vérification — Finance4All',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="font-size: 20px; color: #111827; margin: 0 0 8px;">Confirmez votre invitation</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
              Bonjour${firstName ? ` ${firstName}` : ''}, utilisez le code ci-dessous pour accepter votre invitation
              ${organizationName ? `à <strong>${organizationName}</strong>` : ''} sur Finance4All.
            </p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827;">${code}</span>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Ce code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Votre code de vérification Finance4All : ${code} (valide 10 minutes)`,
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Erreur envoi OTP:', error);
    return NextResponse.json(
      { success: false, message: "Impossible d'envoyer le code de vérification" },
      { status: 500 }
    );
  }
}
