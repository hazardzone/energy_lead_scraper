import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Lead } from '../types/lead';
import { handleApiError } from '../lib/errorUtils';
import logger from '../lib/logger';

interface StatsCardsProps {
  leads: Lead[];
  isLoading?: boolean;
}

export default function StatsCards({ leads, isLoading = false }: StatsCardsProps) {
  const statistics = useMemo(() => {
    try {
      const totalLeads = leads.length;
      const uniqueCompanies = new Set(leads.map(lead => lead.companyName)).size;
      const avgEmployees = leads.reduce((acc, lead) => acc + (lead.employeeCount || 0), 0) / totalLeads || 0;
      const recentLeads = leads.filter(lead => {
        const leadDate = new Date(lead.scrapedAt);
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return leadDate >= lastWeek;
      }).length;
      const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
      const conversionRate = (leads.filter(lead => lead.status === 'converted').length / totalLeads) * 100;

      return [
        {
          title: 'Total Leads',
          value: totalLeads.toString(),
          description: 'Total number of leads collected',
          trend: '+' + recentLeads + ' this week'
        },
        {
          title: 'Unique Companies',
          value: uniqueCompanies.toString(),
          description: 'Number of distinct companies',
          trend: Math.round((uniqueCompanies / totalLeads) * 100) + '% unique ratio'
        },
        {
          title: 'Qualified Leads',
          value: qualifiedLeads.toString(),
          description: 'Number of qualified leads'
        },
        {
          title: 'Conversion Rate',
          value: `${conversionRate.toFixed(1)}%`,
          description: 'Percentage of converted leads'
        },
        {
          title: 'Avg. Employees',
          value: Math.round(avgEmployees).toLocaleString(),
          description: 'Average employee count per company',
          trend: 'Company size indicator'
        }
      ];
    } catch (error) {
      logger.error({ error }, 'Failed to calculate statistics');
      return [
        {
          title: 'Error',
          value: 'N/A',
          description: 'Failed to load statistics',
          trend: 'Data unavailable'
        }
      ];
    }
  }, [leads]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse bg-gray-100 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {statistics.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
            stat.title === 'Error' ? 'border-red-300' : ''
          }`}
        >
          <dt className="text-sm font-medium text-gray-500 truncate">
            {stat.title}
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stat.value}
          </dd>
          <p className="mt-2 text-sm text-gray-600">
            {stat.description}
          </p>
          <p className="mt-1 text-xs text-blue-600 font-medium">
            {stat.trend}
          </p>
          {stat.title === 'Error' && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              Please try refreshing the page
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
