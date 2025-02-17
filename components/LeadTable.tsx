import { useState, useEffect, useCallback, useMemo, FC } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { Lead, LeadResponse } from '../types/lead';
import { Spinner } from './Spinner';
import debounce from 'lodash.debounce';
import React from 'react';

// Configuration constants
const CONFIG = {
  ITEMS_PER_PAGE: 10,
  DEBOUNCE_DELAY: 300,
  DEFAULT_SORT_FIELD: 'createdAt' as keyof Lead,
  DEFAULT_SORT_DIRECTION: 'desc' as const,
  DEFAULT_SEARCH: 'restaurants',
} as const;

// Status style mappings
const STATUS_STYLES = {
  uncontacted: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  converted: 'bg-green-100 text-green-800',
} as const;

interface LeadTableProps {
  leads: Lead[];
  onError?: (error: Error) => void;
}

/**
 * LeadTable Component
 * Displays a paginated table of leads with search, sort, and status management capabilities
 * @returns {JSX.Element} Rendered component
 */
const LeadTable: FC<LeadTableProps> = ({ leads, onError }) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(CONFIG.DEFAULT_SEARCH);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<keyof Lead>(CONFIG.DEFAULT_SORT_FIELD);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(CONFIG.DEFAULT_SORT_DIRECTION);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /**
   * Fetches leads from the API with debouncing
   */
  const debouncedFetchLeads = useMemo(
    () => debounce(async (query: string, page: number) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<LeadResponse>('/api/leads', {
          params: { 
            query, 
            page,
            limit: CONFIG.ITEMS_PER_PAGE,
            sortField,
            sortDirection
          },
        });
        setTotalPages(Math.max(1, response.data.pages));
      } catch (err) {
        const error = err as AxiosError;
        setError((error.response?.data as { message?: string })?.message || 'Failed to fetch leads');
        toast.error('Error loading leads');
      } finally {
        setLoading(false);
      }
    }, CONFIG.DEBOUNCE_DELAY),
    [sortField, sortDirection]
  );

  // Fetch leads when search, page, or sort changes
  useEffect(() => {
    debouncedFetchLeads(searchQuery, currentPage);
    return () => {
      debouncedFetchLeads.cancel();
    };
  }, [searchQuery, currentPage, debouncedFetchLeads]);

  /**
   * Updates the status of a lead
   * @param id - Lead ID
   * @param status - New status
   */
  const markLeadAs = useCallback(async (id: string, status: Lead['status']) => {
    try {
      setActionLoading(id);
      await axios.put(`/api/leads/${id}`, { status });
      toast.success('Lead status updated successfully');
      debouncedFetchLeads(searchQuery, currentPage);
    } catch (error) {
      toast.error('Failed to update lead status');
    } finally {
      setActionLoading(null);
    }
  }, [searchQuery, currentPage, debouncedFetchLeads]);

  /**
   * Handles sorting when a column header is clicked
   */
  const handleSort = useCallback((field: keyof Lead) => {
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  }, []);

  // Optimize search handler with useCallback
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Optimize pagination handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPage(page => Math.max(1, page - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(page => Math.min(totalPages, page + 1));
  }, [totalPages]);

  if (error) {
    onError?.(new Error(error));
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

  // Helper function to render status badge
  const renderStatusBadge = (status: Lead['status']) => (
    <span className={`px-2 py-1 text-sm rounded ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );

  // Main render
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto" role="region" aria-label="Leads table">
      {/* Search Bar */}
      <div className="p-4 border-b flex items-center justify-between">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={loading}
          aria-label="Search leads"
          role="searchbox"
        />
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Table Container */}
          <table className="w-full text-sm md:text-base" role="table" aria-label="Leads">
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
                <tr 
                  key={lead._id} 
                  className="border-b block md:table-row hover:bg-gray-50"
                  role="row"
                >
                  <td className="p-3 md:table-cell">{lead.name}</td>
                  <td className="p-3 md:table-cell">{lead.phone}</td>
                  <td className="p-3 md:table-cell">{lead.address}</td>
                  <td className="p-3 md:table-cell">
                    {renderStatusBadge(lead.status)}
                  </td>
                  <td className="p-3 md:table-cell">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-green-500 hover:bg-green-50 rounded disabled:opacity-50 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        onClick={() => markLeadAs(lead._id, 'contacted')}
                        disabled={lead.status === 'contacted' || actionLoading === lead._id}
                        aria-label={`Mark ${lead.name} as contacted`}
                        aria-busy={actionLoading === lead._id}
                      >
                        {actionLoading === lead._id ? <Spinner size="sm" /> : 'Mark Contacted'}
                      </button>
                      <button
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onClick={() => markLeadAs(lead._id, 'converted')}
                        disabled={lead.status === 'converted' || actionLoading === lead._id}
                        aria-label={`Mark ${lead.name} as converted`}
                      >
                        {actionLoading === lead._id ? <Spinner size="sm" /> : 'Mark Converted'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t" role="navigation" aria-label="Pagination">
            <button
              className="px-4 py-2 border rounded disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 border rounded disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Add prop types validation
LeadTable.defaultProps = {
  onError: undefined,
};

export default LeadTable;
