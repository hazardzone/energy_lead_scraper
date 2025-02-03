// pages/api/socket.js
import { initSocket } from '../../server/socket'; // Import socket server logic

let httpServer;

export const handler = (req, res) => {
  if (!httpServer) {
    httpServer = res.socket.server;
    initSocket(httpServer);  // Initialize socket server
    console.log('Socket initialized');
  }
  res.end();
};

export default handler;
