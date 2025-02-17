export interface Lead {
  id: string;
  companyName: string;
  employeeCount?: number;
  revenue?: string;
  industry?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  dateAdded: string;
  lastUpdated: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  score?: number;
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
