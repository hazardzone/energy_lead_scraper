export default function StatsCards({ leads }) {
    const totalLeads = leads.length;
    const contactedLeads = leads.filter((lead) => lead.status === 'contacted').length;
    const convertedLeads = leads.filter((lead) => lead.status === 'converted').length;
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Leads</h3>
          <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Contacted Leads</h3>
          <p className="text-2xl font-bold text-gray-900">{contactedLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Converted Leads</h3>
          <p className="text-2xl font-bold text-gray-900">{convertedLeads}</p>
        </div>
      </div>
    );
  }