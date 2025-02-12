import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = async () => {
  if (!socket) {
    // First initialize the WebSocket connection
    await fetch('/api/socket');
    
    socket = io({
      path: '/api/socket',
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};
