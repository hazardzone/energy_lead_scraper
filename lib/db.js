import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
let isConnected = false;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
    });
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export function getConnection() {
  return mongoose.connection;
}