import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/lead';

export async function PUT(request, { params }) {
  const { id } = params;
  const { status } = await request.json();

  await connectDB();
  const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });

  return NextResponse.json(lead);
}