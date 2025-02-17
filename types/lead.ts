export interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  source: string;
  createdAt: string;
  status: 'uncontacted' | 'contacted' | 'converted';
  updatedAt?: string;
}

export interface LeadResponse {
  leads: Lead[];
  total: number;
  pages: number;
}

export interface LeadFilter {
  page: number;
  limit: number;
  search?: string;
  sortField?: keyof Lead;
  sortDirection?: 'asc' | 'desc';
}
