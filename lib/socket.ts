import { io, Socket } from 'socket.io-client';
import logger from './logger';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

let socket: Socket | null = null;

export const initializeSocket = async (): Promise<Socket> => {
  let attempts = 0;
  
  const connect = async (): Promise<Socket> => {
    try {
      const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      return new Promise((resolve, reject) => {
        socket.on('connect', () => {
          logger.info('Socket connected successfully');
          resolve(socket);
        });

        socket.on('connect_error', (error) => {
          logger.error({ error }, 'Socket connection error');
          if (attempts >= RETRY_ATTEMPTS) {
            reject(error);
          }
        });
      });
    } catch (error) {
      if (attempts < RETRY_ATTEMPTS) {
        attempts++;
        logger.warn(`Retrying socket connection, attempt ${attempts}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return connect();
      }
      throw error;
    }
  };

  return connect();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};
