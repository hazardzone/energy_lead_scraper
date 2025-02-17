'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeSocket } from '../../lib/socket';
import LeadTable from '../../components/LeadTable';
import StatsCards from '../../components/StatsCards';
import type { Lead } from '../../types/lead';
import type { Socket } from 'socket.io-client';
import logger from '../../lib/logger';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const setupSocket = useCallback(async () => {
    try {
      const socketInstance = await initializeSocket();
      
      socketInstance.on('scrape-results', (data: Lead[]) => {
        logger.info('Received scrape results', { count: data.length });
        setLeads(data);
        setIsScraping(false);
        setError(null);
      });

      socketInstance.on('scrape-error', (errorMessage: string) => {
        logger.error({ error: errorMessage }, 'Scraping error occurred');
        setError(errorMessage);
        setIsScraping(false);
      });

      socketInstance.on('connect_error', () => {
        logger.error('Socket connection failed');
        setError('Failed to connect to server');
      });

      setSocket(socketInstance);
      logger.info('Socket connection established');

      return () => {
        logger.info('Disconnecting socket');
        socketInstance.disconnect();
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize socket connection';
      logger.error({ error: err }, errorMessage);
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    const cleanup = setupSocket();
    return () => {
      cleanup?.();
    };
  }, [setupSocket]);

  return (
    <main className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <StatsCards leads={leads} />
      
      {isScraping ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Scraping in progress...</span>
        </div>
      ) : (
        <div className="mt-8">
          <LeadTable leads={leads} />
        </div>
      )}
    </main>
  );
}