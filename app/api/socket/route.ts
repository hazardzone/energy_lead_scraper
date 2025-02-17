import { NextResponse } from 'next/server';
// import { Server as SocketServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiRequest } from 'next';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';
import { z } from 'zod';
import { scrapeLeads } from '../../../lib/scraper';

interface SocketServer extends HTTPServer {
  io?: IOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiRequest {
  socket: SocketWithIO;
}

// Validation schema for scraping parameters
const ScrapeParamsSchema = z.object({
  query: z.string().min(2).max(100),
  location: z.string().optional(),
  maxPages: z.number().min(1).max(10).default(1)
});

export function GET(req: NextApiResponseWithSocket) {
  if (!req.socket.server.io) {
    const io = new SocketServer(req.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    // Track active scraping sessions
    const activeSessions = new Map<string, boolean>();

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('scrape-leads', async (params) => {
        try {
          // Validate parameters
          const validParams = ScrapeParamsSchema.parse(params);
          
          // Check if already scraping
          if (activeSessions.get(socket.id)) {
            socket.emit('scrape-error', 'A scraping session is already in progress');
            return;
          }

          activeSessions.set(socket.id, true);
          socket.emit('scrape-status', 'Starting scraping process...');

          const leads = await scrapeLeads(validParams.query, {
            location: validParams.location,
            maxPages: validParams.maxPages,
            onProgress: (status: string) => {
              socket.emit('scrape-status', status);
            }
          });

          socket.emit('scrape-results', leads);
        } catch (error) {
          console.error('Scraping error:', error);
          socket.emit('scrape-error', error instanceof Error ? error.message : 'Unknown error occurred');
        } finally {
          activeSessions.delete(socket.id);
        }
      });

      socket.on('stop-scraping', () => {
        if (activeSessions.get(socket.id)) {
          // Implement stop logic in scraper
          activeSessions.delete(socket.id);
          socket.emit('scrape-status', 'Scraping stopped by user');
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        activeSessions.delete(socket.id);
      });
    });

    req.socket.server.io = io;
  }

  return NextResponse.json({ 
    success: true,
    message: 'Socket server initialized'
  });
}
