// components/LeadTable.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeadTable() {
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('restaurants');

  useEffect(() => {
    fetchLeads();
  }, [searchQuery]);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('/api/leads', {
        params: { query: searchQuery },
      });
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const markLeadAs = async (id, status) => {
    try {
      await axios.put(`/api/leads/${id}`, { status });
      fetchLeads(); // Refresh leads after update
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Table Container */}
      <table className="w-full text-sm md:text-base">
        {/* Table Header */}
        <thead className="bg-gray-50 sticky top-0 z-10 hidden md:table-header-group">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Address</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-b block md:grid md:grid-cols-5">
              {/* Name */}
              <td className="p-3 md:border-r md:border-b-0 border-b border-gray-200">
                <span className="hidden md:inline">Name:</span> {lead.name}
              </td>

              {/* Phone */}
              <td className="p-3 md:border-r md:border-b-0 border-b border-gray-200">
                <span className="hidden md:inline">Phone:</span> {lead.phone}
              </td>

              {/* Address */}
              <td className="p-3 md:border-r md:border-b-0 border-b border-gray-200">
                <span className="hidden md:inline">Address:</span> {lead.address}
              </td>

              {/* Status */}
              <td className="p-3 md:border-r md:border-b-0 border-b border-gray-200">
                <span className="hidden md:inline">Status:</span>{' '}
                <span
                  className={`px-2 py-1 text-sm rounded ${
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

              {/* Actions */}
              <td className="p-3 flex space-x-2 md:border-b-0 border-b border-gray-200">
                <button
                  className="p-2 text-green-500 hover:bg-green-50 rounded"
                  onClick={() => markLeadAs(lead._id, 'contacted')}
                >
                  Contacted
                </button>
                <button
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                  onClick={() => markLeadAs(lead._id, 'converted')}
                >
                  Converted
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}