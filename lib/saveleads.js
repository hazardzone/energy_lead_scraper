import { leadsCollection } from '@/lib/db';
import { redis } from '@/lib/db';

export async function saveLead(lead) {
  const { name, phone, address, source, subsidy } = lead;

  // Save to MongoDB
  await leadsCollection.insertOne(lead);

  // Cache in Redis for quick access
  await redis.set(`lead:${phone}`, JSON.stringify(lead), 'EX', 3600 * 24); // Expires in 24 hours

  return { success: true, message: 'Lead saved!' };
}
