// In app/api/leads/route.js
import { getCachedLeads, cacheLeads } from '@/lib/cache';

export async function GET() {
  const cachedLeads = await getCachedLeads('energy-leads');
  if (cachedLeads) return NextResponse.json(cachedLeads);

  const leads = await Lead.find({});
  await cacheLeads('energy-leads', leads);
  return NextResponse.json(leads);
}