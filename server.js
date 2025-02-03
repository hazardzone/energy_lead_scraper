const express = require('express');
const next = require('next');
const http = require('http');
const socketIo = require('socket.io');

// Set up Next.js
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Import your scrapeLeads function (Ensure it's correctly exported in './lib/scraper')
const { scrapeLeads } = require('./lib/scraper');

app.prepare().then(() => {
  const server = express();

  // Create an HTTP server
  const httpServer = http.createServer(server);

  // Setup Socket.IO with the HTTP server
  const io = socketIo(httpServer, {
    path: '/socket.io',  // This will handle the socket.io path for the client
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle scrape-leads event
    socket.on('scrape-leads', async ({ keyword, city }) => {
      console.log(`Scraping leads for keyword: ${keyword}, city: ${city}`);
      
      try {
        // Call the scrapeLeads function and get leads
        const leads = await scrapeLeads(keyword, city);
        
        // Emit the leads to the client
        socket.emit('scrape-results', leads);
      } catch (err) {
        console.error('Error while scraping:', err);
        socket.emit('scrape-results', { error: 'Error while scraping leads' });
      }
    });

    // Handle socket disconnect
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  // Use the Next.js request handler for all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server on a specified port
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
