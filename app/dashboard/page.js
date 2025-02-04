'use client';
import { useEffect, useState } from 'react';
import LeadTable from '@/components/LeadTable';
import StatsCards from '@/components/StatsCards';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection only on the client side
    const newSocket = io('http://localhost:3001', { 
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    // Handle incoming data
    newSocket.on('scrape-results', (data) => {
      setLeads(Array.isArray(data) ? data : []);
      setIsScraping(false);
    });

    setSocket(newSocket);

    // Cleanup socket connection on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const triggerScrape = () => {
    if (socket) {
      setIsScraping(true);
      socket.emit('scrape-leads', { keyword: 'particulier', city: 'Paris' });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button 
        onClick={triggerScrape} 
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={isScraping}
      >
        {isScraping ? 'Scraping...' : 'Start Scraping'}
      </button>

      <StatsCards leads={Array.isArray(leads) ? leads : []} />
      <LeadTable leads={leads} />
    </div>
  );
}
