'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeSocket } from '../../lib/socket';
import { LeadStorage } from '../../lib/storage';
import LeadTable from '../../components/LeadTable';
import StatsCards from '../../components/StatsCards';
import ScrapeButton from '../../components/ScrapeButton';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { Lead } from '../../types/lead';
import type { Socket } from 'socket.io-client';
import logger from '../../lib/logger';
import { handleApiError, isNetworkError, formatErrorMessage } from '../../lib/errorUtils';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>(() => LeadStorage.getLeads());
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleError = useCallback((error: unknown) => {
    const handledError = handleApiError(error);
    logger.error({ error: handledError }, 'Dashboard error occurred');
    
    if (isNetworkError(error)) {
      setError('Network connection issue. Please check your internet connection.');
      return;
    }
    
    setError(formatErrorMessage(handledError));
  }, []);

  useEffect(() => {
    LeadStorage.saveLeads(leads);
  }, [leads]);

  const handleNewLeads = useCallback((newLeads: Lead[]) => {
    setLeads(prevLeads => {
      const uniqueLeads = newLeads.filter(newLead => 
        !prevLeads.some(existingLead => existingLead.id === newLead.id)
      );
      return [...prevLeads, ...uniqueLeads];
    });
  }, []);

  const setupSocket = useCallback(async () => {
    try {
      const socketInstance = await initializeSocket();
      
      socketInstance.on('scrape-results', (data: Lead[]) => {
        try {
          logger.info('Received scrape results', { count: data.length });
          handleNewLeads(data);
          setIsScraping(false);
          setError(null);
        } catch (error) {
          handleError(error);
        }
      });

      socketInstance.on('scrape-error', (errorMessage: string) => {
        handleError(new Error(errorMessage));
      });

      socketInstance.on('connect_error', (error) => {
        handleError(error);
      });

      setSocket(socketInstance);
      logger.info('Socket connection established');

      return () => {
        logger.info('Disconnecting socket');
        socketInstance.disconnect();
      };
    } catch (err) {
      handleError(err);
      return undefined;
    }
  }, [handleError, handleNewLeads]);

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    setupSocket().then(cleanup => {
      cleanupFn = cleanup;
    });
    return () => {
      cleanupFn?.();
    };
  }, [setupSocket]);

  return (
    <ErrorBoundary 
      fallback={({ error }) => (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="text-sm text-red-600">{formatErrorMessage(error)}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Reload Page
          </button>
        </div>
      )}
    >
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        <ErrorBoundary fallback={<div>Failed to load stats</div>}>
          <StatsCards leads={leads} isLoading={isScraping} />
        </ErrorBoundary>
        
        {isScraping ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Scraping in progress...</span>
          </div>
        ) : (
          <div className="mt-8">
            <ScrapeButton 
              socket={socket} 
              onScrapeStart={() => setIsScraping(true)} 
            />
            <LeadTable leads={leads} />
          </div>
        )}
      </main>
    </ErrorBoundary>
  );
}

import React from 'react';
import { Lead } from '../types/lead';

export type Lead = {
  companyName: string;
};

interface StatsCardsProps {
  leads: Lead[];
  isLoading: boolean;
}

export default function StatsCards({ leads, isLoading }: StatsCardsProps) {
  const totalLeads = leads.length;
  const uniqueCompanies = new Set(leads.map(lead => lead.companyName)).size;
  const averageEmployees = leads.reduce((acc, lead) => acc + (lead.employeeCount || 0), 0) / totalLeads || 0;

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads.toString(),
      description: 'Total number of leads collected'
    },
    {
      title: 'Unique Companies',
      value: uniqueCompanies.toString(),
      description: 'Number of distinct companies'
    },
    {
      title: 'Avg. Employees',
      value: Math.round(averageEmployees).toString(),
      description: 'Average employee count per company'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <dt className="text-sm font-medium text-gray-500 truncate">
            {stat.title}
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stat.value}
          </dd>
          <p className="mt-2 text-sm text-gray-600">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}