import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeadTable() {
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('restaurants'); // Default search query

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get('/api/leads', { params: { query: searchQuery } });
        setLeads(response.data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, [searchQuery]);

  const markLeadAs = async (id, status) => {
    // This function can remain unchanged unless you want to implement additional logic
    console.log('Mark lead as:', id, status);
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
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {leads.map((lead, index) => (
            <tr
              key={index}
              className="border-b block md:grid md:grid-cols-4"
            >
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

              {/* Actions */}
              <td className="p-3 flex space-x-2 md:border-b-0 border-b border-gray-200">
                <button
                  className="p-2 text-green-500 hover:bg-green-50 rounded"
                  onClick={() => markLeadAs(index, 'contacted')}
                >
                  Contacted
                </button>
                <button
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                  onClick={() => markLeadAs(index, 'converted')}
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