import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lead, LeadResponse } from '../types/lead';
import { Spinner } from './Spinner';
import debounce from 'lodash/debounce';
import React from 'react';


const ITEMS_PER_PAGE = 10;

export default function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('restaurants');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const debouncedFetchLeads = useMemo(
    () => debounce(async (query: string, page: number) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<LeadResponse>('/api/leads', {
          params: { 
            query, 
            page,
            limit: ITEMS_PER_PAGE,
            sortField,
            sortDirection
          },
        });
        setLeads(response.data.leads);
        setTotalPages(response.data.pages);
      } catch (err) {
        setError('Failed to fetch leads');
        toast.error('Error loading leads');
      } finally {
        setLoading(false);
      }
    }, 300),
    [sortField, sortDirection]
  );

  useEffect(() => {
    debouncedFetchLeads(searchQuery, currentPage);
    return () => {
      debouncedFetchLeads.cancel();
    };
  }, [searchQuery, currentPage, debouncedFetchLeads]);

  const markLeadAs = useCallback(async (id: string, status: Lead['status']) => {
    try {
      await axios.put(`/api/leads/${id}`, { status });
      toast.success('Lead status updated successfully');
      debouncedFetchLeads(searchQuery, currentPage);
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  }, [searchQuery, currentPage, debouncedFetchLeads]);

  const handleSort = useCallback((field: keyof Lead) => {
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded">
        {error}
        <button 
          onClick={() => debouncedFetchLeads(searchQuery, currentPage)}
          className="ml-4 text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      {/* Search Bar */}
      <div className="p-4 border-b flex items-center justify-between">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading}
        />
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Table Container */}
          <table className="w-full text-sm md:text-base">
            {/* Table Header */}
            <thead className="bg-gray-50 sticky top-0 z-10 hidden md:table-header-group">
              <tr>
                {['Name', 'Phone', 'Address', 'Status', 'Actions'].map((header) => (
                  <th
                    key={header}
                    onClick={() => header !== 'Actions' && handleSort(header.toLowerCase() as keyof Lead)}
                    className={`p-3 text-left ${header !== 'Actions' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  >
                    {header}
                    {sortField === header.toLowerCase() && (
                      <span className="ml-2">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-b block md:table-row">
                  <td className="p-3 md:table-cell">{lead.name}</td>
                  <td className="p-3 md:table-cell">{lead.phone}</td>
                  <td className="p-3 md:table-cell">{lead.address}</td>
                  <td className="p-3 md:table-cell">
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
                  <td className="p-3 md:table-cell">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-green-500 hover:bg-green-50 rounded disabled:opacity-50"
                        onClick={() => markLeadAs(lead._id, 'contacted')}
                        disabled={lead.status === 'contacted'}
                      >
                        Mark Contacted
                      </button>
                      <button
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded disabled:opacity-50"
                        onClick={() => markLeadAs(lead._id, 'converted')}
                        disabled={lead.status === 'converted'}
                      >
                        Mark Converted
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage(page => page - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage(page => page + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
