import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/monitoring';

export async function GET() {
  try {
    const health = await getHealthStatus();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 503 : 500;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Failed to check health status',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      },
      { status: 500 }
    );
  }
}