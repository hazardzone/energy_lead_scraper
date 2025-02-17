import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;

/** @type {mongoose.ConnectOptions} */
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
};

/**
 * @returns {Promise<void>}
 */
async function attemptConnection() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    isConnected = true;
    reconnectAttempts = 0;
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection attempt failed:', error);
    throw error;
  }
}

export async function connectDB() {
  if (isConnected) return;

  while (reconnectAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      await attemptConnection();
      break;
    } catch (error) {
      reconnectAttempts++;
      if (reconnectAttempts === MAX_RETRY_ATTEMPTS) {
        logger.error('Max reconnection attempts reached. Exiting...');
        process.exit(1);
      }
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      logger.warn(`Retrying connection in ${delay}ms... (Attempt ${reconnectAttempts}/${MAX_RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error:', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    isConnected = false;
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

/**
 * @returns {mongoose.Connection}
 */
export function getConnection() {
  return mongoose.connection;
}

async function shutdown() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
}