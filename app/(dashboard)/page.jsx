'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">French Energy Leads</h1>
      <button 
        onClick={() => fetch('/api/scrape').then(fetchLeads)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Scrape New Leads
      </button>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-b">
              <td className="p-2">{lead.name}</td>
              <td className="p-2">{lead.phone}</td>
              <td className="p-2">{lead.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}