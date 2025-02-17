import { Server } from 'socket.io';

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;

const SocketHandler = (req, res) => {
  if (!req.headers || !req.socket) {
    res.status(400).end();
    return;
  }

  if (res.socket.server.io) {
    console.log("⚡ WebSocket server is already running");
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    pingTimeout: 60000,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : "*",
      methods: ["GET", "POST"]
    }
  });

  const clientRequests = new Map();

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    clientRequests.set(socket.id, { count: 0, timestamp: Date.now() });

    socket.on("scrape-leads", async ({ keyword, city }, callback) => {
      try {
        const client = clientRequests.get(socket.id);
        const now = Date.now();
        
        if (!client || now - client.timestamp > RATE_LIMIT_WINDOW) {
          clientRequests.set(socket.id, { count: 1, timestamp: now });
        } else if (client.count >= MAX_REQUESTS) {
          throw new Error("Rate limit exceeded");
        } else {
          client.count++;
        }

        if (!keyword || !city) {
          throw new Error("Missing required parameters");
        }

        console.log(`🕵️ Client ${socket.id} scraping leads for: ${keyword} in ${city}`);
        
        // Simulate scraping (replace with actual scraper logic)
        const leads = [{ name: "Test Lead", phone: "1234567890", address: "123 Test St" }];
        
        socket.emit("scrape-results", leads);
        if (typeof callback === 'function') callback({ success: true, leads });
      } catch (error) {
        console.error(`🔴 Scraping error for client ${socket.id}:`, error);
        if (typeof callback === 'function') callback({ 
          success: false, 
          error: error.message 
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client ${socket.id} disconnected`);
      clientRequests.delete(socket.id);
    });
  });

  res.socket.server.io = io;
  res.end();
};

module.exports = SocketHandler;
