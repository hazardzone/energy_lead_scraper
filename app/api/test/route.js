import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/lead';

export async function GET() {
  try {
    await connectDB(); // Ensure the database is connected

    // Create a test lead
    const testLead = new Lead({
      name: 'Test Lead',
      phone: '1234567890',
      address: '123 Test St, Paris',
      source: 'Test',
      keywords: ['subvention énergie'],
    });

    // Save the test lead to the database
    await testLead.save();

    // Fetch all leads to verify
    const leads = await Lead.find({});

    return NextResponse.json({ message: 'Database connection successful!', leads });
  } catch (error) {
    return NextResponse.json({ error: 'Database connection failed', details: error.message }, { status: 500 });
  }
}