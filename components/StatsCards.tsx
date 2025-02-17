import { FC } from 'react';
import type { Lead } from '../types/lead';

interface StatsCardsProps {
  leads: Lead[];
}

const StatsCards: FC<StatsCardsProps> = ({ leads }) => {
  const stats = {
    total: leads.length,
    uncontacted: leads.filter(lead => lead.status === 'uncontacted').length,
    contacted: leads.filter(lead => lead.status === 'contacted').length,
    converted: leads.filter(lead => lead.status === 'converted').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
