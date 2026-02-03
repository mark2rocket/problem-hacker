import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET() {
  try {
    // Test database connection
    await db.execute('SELECT 1');

    return NextResponse.json(
      { status: 'healthy', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
