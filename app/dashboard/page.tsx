'use client';

import { useEffect, useState } from 'react';
import { initializeSocket } from '../../lib/socket';
import LeadTable from '../../components/LeadTable';
import StatsCards from '../../components/StatsCards';
import React from 'react';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupSocket = async () => {
      const socket = await initializeSocket();

      socket.on('scrape-results', (data) => {
        console.log('Received scrape results:', data);
        setLeads(Array.isArray(data) ? data : []);
        setIsScraping(false);
      });

      socket.on('scrape-error', (errorMessage) => {
        setError(errorMessage);
        setIsScraping(false);
      });
    };

    setupSocket();
  }, []);

  return (
    <div>
      <StatsCards leads={leads} />
      <LeadTable leads={leads} />
      {isScraping && <p>Scraping in progress...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}