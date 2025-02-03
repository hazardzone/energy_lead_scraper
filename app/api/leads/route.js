import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/lead';

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find({});
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}