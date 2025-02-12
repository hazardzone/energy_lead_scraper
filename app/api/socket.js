import { Server } from 'socket.io';
import { scrapeLeads } from '@/lib/scraper';

let io;

export function initSocket(server) {
  io = new Server(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('scrape-leads', async (params) => {
      try {
        const leads = await scrapeLeads(params);
        socket.emit('scrape-results', leads);
      } catch (error) {
        socket.emit('scrape-error', error.message);
      }
    });

    socket.on('stop-scraping', () => {
      // Implement scraping cancellation logic
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
