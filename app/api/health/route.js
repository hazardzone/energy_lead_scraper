import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate basic health checks (e.g., database connection, service availability)
    const isDatabaseConnected = true; // Replace with actual database check if needed
    const isServiceAvailable = true; // Replace with actual service check if needed

    if (!isDatabaseConnected || !isServiceAvailable) {
      return NextResponse.json(
        { status: 'DOWN', details: 'One or more services are unavailable' },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json({ status: 'UP', message: 'Server is running healthy' });
  } catch (error) {
    console.error('Error checking server health:', error);
    return NextResponse.json(
      { status: 'ERROR', details: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}