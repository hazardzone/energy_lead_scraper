'use client';
import { useEffect, useState } from 'react';
import LeadTable from '@/components/LeadTable';
import StatsCards from '@/components/StatsCards';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(data));
  }, []);

  return (
    <div className="p-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
      </div>
      <StatsCards leads={leads} />
      <LeadTable leads={leads} />
    </div>
  );
     
}