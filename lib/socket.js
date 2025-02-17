import { Server } from "socket.io";
import { io } from 'socket.io-client';

let socket = null;

const initializeSocket = async () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socket',
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ['websocket'],
      agent: false,
      upgrade: false,
      rejectUnauthorized: false
    });
  }
  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;

module.exports = function handler(req, res) {
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

  // Rate limiting map
  const clientRequests = new Map();

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    clientRequests.set(socket.id, { count: 0, timestamp: Date.now() });

    const checkRateLimit = () => {
      const client = clientRequests.get(socket.id);
      if (!client) return false;

      const now = Date.now();
      if (now - client.timestamp > RATE_LIMIT_WINDOW) {
        clientRequests.set(socket.id, { count: 1, timestamp: now });
        return true;
      }

      if (client.count >= MAX_REQUESTS) {
        return false;
      }

      client.count++;
      return true;
    };

    socket.on("scrape-leads", async ({ keyword, city }, callback) => {
      try {
        if (!keyword || !city) {
          throw new Error("Missing required parameters");
        }

        if (!checkRateLimit()) {
          throw new Error("Rate limit exceeded");
        }

        console.log(`🕵️ Client ${socket.id} scraping leads for: ${keyword} in ${city}`);
        
        // Simulate scraping (replace with your actual scraper logic)
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

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client ${socket.id} disconnected. Reason: ${reason}`);
      clientRequests.delete(socket.id);
    });

    socket.on("error", (error) => {
      console.error(`🔴 Socket error for client ${socket.id}:`, error);
    });
  });

  res.socket.server.io = io;
  res.end();
};

module.exports = {
  initializeSocket,
  disconnectSocket,
  getSocket
};