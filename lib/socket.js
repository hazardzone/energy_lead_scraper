// server/socket.js
import { Server } from 'socket.io';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    path: '/socket.io',  // This is where your client will try to connect
    transports: ['websocket', 'polling'],  // WebSocket and Polling are enabled
  });

  io.on('connection', (socket) => {
    console.log('New WebSocket connection');
    
    // Emit a message to the client when a lead is scraped
    socket.emit('message', { text: 'Welcome to the WebSocket server!' });

    // Listen for messages from client-side
    socket.on('new-lead', (data) => {
      console.log('Received lead:', data);
      socket.broadcast.emit('new-lead', data);  // Broadcast the lead to other clients
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });
}
