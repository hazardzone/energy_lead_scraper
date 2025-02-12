export interface Lead {
  _id: string;
  name: string;
  phone: string;
  address: string;
  status: 'uncontacted' | 'contacted' | 'converted';
  createdAt: string;
  updatedAt: string;
}

export interface LeadResponse {
  leads: Lead[];
  total: number;
  pages: number;
}
