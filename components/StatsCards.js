import PropTypes from 'prop-types';
import { memo } from 'react';

/**
 * StatsCards Component - Displays lead statistics in card format
 * @param {Object} props - Component props
 * @param {Array} props.leads - Array of lead objects
 * @returns {JSX.Element} Statistics cards grid
 */
const StatsCards = memo(({ leads = [] }) => {
  try {
    // Ensure leads is always an array
    const leadsArray = Array.isArray(leads) ? leads : [];

    // Calculate statistics safely with null checks
    const totalLeads = leadsArray.length;
    const contactedLeads = leadsArray.filter((lead) => 
      lead?.status?.toLowerCase() === 'contacted'
    ).length;
    const convertedLeads = leadsArray.filter((lead) => 
      lead?.status?.toLowerCase() === 'converted'
    ).length;

    const StatCard = ({ title, value }) => (
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" data-testid="stats-cards">
        <StatCard title="Total Leads" value={totalLeads} />
        <StatCard title="Contacted Leads" value={contactedLeads} />
        <StatCard title="Converted Leads" value={convertedLeads} />
      </div>
    );
  } catch (error) {
    console.error('Error in StatsCards:', error);
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded">
        Error loading statistics. Please try again later.
      </div>
    );
  }
});

StatsCards.propTypes = {
  leads: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string,
    })
  ),
};

StatsCards.displayName = 'StatsCards';

export default StatsCards;