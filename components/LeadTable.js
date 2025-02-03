import { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function LeadTable({ leads }) {
  const [search, setSearch] = useState('');

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.address.toLowerCase().includes(search.toLowerCase())
  );

  const markLeadAs = async (id, status) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    // Refresh leads after update
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search leads..."
          className="w-full p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Address</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead) => (
            <tr key={lead._id} className="border-b">
              <td className="p-3">{lead.name}</td>
              <td className="p-3">{lead.phone}</td>
              <td className="p-3">{lead.address}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    lead.status === 'uncontacted'
                      ? 'bg-yellow-100 text-yellow-800'
                      : lead.status === 'contacted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {lead.status}
                </span>
              </td>
              <td className="p-3">
                <button
                  className="p-2 text-green-500 hover:bg-green-50 rounded"
                  onClick={() => markLeadAs(lead._id, 'contacted')}
                >
                  <FaCheck />
                </button>
                <button
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                  onClick={() => markLeadAs(lead._id, 'converted')}
                >
                  <FaTimes />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}