require('module-alias/register');
const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');

// Set up Next.js
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Import scraper function
const { scrapeLeads } = require('./lib/scraper');

app.prepare().then(() => {
  const server = express();

  // Create an HTTP server
  const httpServer = http.createServer(server);

  // Setup Socket.IO with proper CORS settings
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Replace with frontend URL in production
      methods: ['GET', 'POST'],
    },
    path: '/socket.io/', // Ensure correct path
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle scraping request
    socket.on('scrape-leads', async ({ keyword, city }) => {
      console.log(`Scraping leads for keyword: ${keyword}, city: ${city}`);

      try {
        if (!keyword || !city) {
          throw new Error('Invalid parameters: keyword and city are required');
        }

        const leads = await scrapeLeads(keyword, city);

        if (!Array.isArray(leads)) {
          console.error('scrapeLeads did not return an array:', leads);
          socket.emit('scrape-results', []);
        } else {
          socket.emit('scrape-results', leads);
        }
      } catch (err) {
        console.error('Error while scraping:', err);
        socket.emit('scrape-results', []);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Log incoming HTTP requests
  server.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  // Use Next.js for frontend routes
  server.all('*', (req, res) => handle(req, res));

  // Start the server
  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
});
