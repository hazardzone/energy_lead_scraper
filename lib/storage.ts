import { Lead } from '../types/lead';

export class LeadStorage {
  private static readonly STORAGE_KEY = 'leads_data';

  static saveLeads(leads: Lead[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }

  static getLeads(): Lead[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving leads:', error);
      return [];
    }
  }
}
