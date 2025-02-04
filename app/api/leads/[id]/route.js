import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/lead';

export async function PUT(request, { params }) {
  try {
    console.log('Handling PUT request for /leads/[id]');

    const { id } = params;
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await connectDB();

    // Update the lead's status
    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    console.log(`Updated lead with ID: ${id}`);
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}