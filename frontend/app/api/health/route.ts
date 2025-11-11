import { NextResponse } from 'next/server';

/**
 * Route de healthcheck pour Docker et les orchestrateurs de conteneurs
 * Utilisée pour vérifier que l'application est en bonne santé
 */
export async function GET() {
  try {
    // Vérifications basiques - peut être étendu selon les besoins
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
