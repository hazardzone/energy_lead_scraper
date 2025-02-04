import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/lead';

export async function PUT(request, { params }) {
  try {
    console.log('Handling PUT request for /leads/[id]');

    // Extract ID from params and validate
    const { id } = params;
    if (!id || id.trim() === '') {
      console.warn('ID is missing or invalid in the request');
      return NextResponse.json({ error: 'ID is required', details: 'The lead ID must be provided.' }, { status: 400 });
    }

    // Parse request body
    const { status } = await request.json();
    if (!status || typeof status !== 'string') {
      console.warn('Invalid status value in the request');
      return NextResponse.json({ error: 'Invalid status', details: 'The status field must be a valid string.' }, { status: 400 });
    }

    // Connect to the database
    await connectDB();

    // Update the lead's status
    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });

    if (!lead) {
      console.warn(`Lead with ID ${id} not found`);
      return NextResponse.json({ error: 'Lead not found', details: `No lead exists with ID: ${id}` }, { status: 404 });
    }

    console.log(`Updated lead with ID: ${id} and status: ${status}`);
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error.message);
    return NextResponse.json(
      { error: 'Failed to update lead', details: error.message },
      { status: 500 }
    );
  }
}

// Ensure the route is correctly defined in your Express server setup
// filepath: /c:/Users/USER/Desktop/Builds/lead_generation_bot/energy_lead_scraper/server.js
const express = require('express');
const next = require('next');
const http = require('http');
const socketIo = require('socket.io');
const leadRoutes = require('@/app/api/leads/[id]/route'); // Ensure the correct path

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Middleware
  server.use(express.json());

  // Define your routes
  server.use('/api/leads/:id', leadRoutes);

  // Handle other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});