'use client'; // Ensure this page is treated as client-side

import { useEffect, useState } from 'react';
import LeadTable from '@/components/LeadTable'; // Assuming this component is used to display the leads
import StatsCards from '@/components/StatsCards'; // Assuming this component shows stats
import io from 'socket.io-client';

const socket = io();  // Connects to the same host as the app by default

export default function Dashboard() {
  const [leads, setLeads] = useState([]);

  // Trigger scraping when the button is clicked
  const triggerScrape = () => {
    socket.emit('scrape-leads', { keyword: 'particulier', city: 'Paris' }); // Trigger scraping on the server
  };

  // Fetch existing leads when the page loads
  useEffect(() => {
    // Fetch initial leads from the API
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch((error) => console.error('Error fetching leads:', error));

    // Listen for new leads from the server
    socket.on('new-lead', (newLead) => {
      console.log('Received new lead:', newLead);
      // Update the leads state with the new lead
      setLeads((prevLeads) => [...prevLeads, newLead]);
    });

    // Listen for any other relevant messages from the server
    socket.on('message', (data) => {
      console.log(data.text);
    });

    // Cleanup the socket connection when the component is unmounted
    return () => {
      socket.off('new-lead'); // Stop listening to 'new-lead' when the component unmounts
      socket.off('message'); // Stop listening to 'message' when the component unmounts
    };
  }, []); // Empty dependency array ensures this runs only once after the component mounts

  return (
    <div className="p-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
        <button 
          onClick={triggerScrape} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Start Scraping
        </button>
      </div>
      
      <StatsCards leads={leads} />
      <LeadTable leads={leads} />
    </div>
  );
}
