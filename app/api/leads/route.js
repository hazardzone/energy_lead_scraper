import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/lead';
import scrapeLeads from '@/lib/scrape'; // Import your scraper function

export async function GET(request) {
  try {
    console.log('Handling GET request for /leads');

    // Connect to the database
    await connectDB();

    // Extract query parameter (optional)
    const query = request.nextUrl.searchParams.get('query') || 'restaurants'; // Default query
    console.log(`Scraping leads for query: ${query}`);

    // Scrape new leads based on the query
    const scrapedLeads = await scrapeLeads(query);

    if (scrapedLeads && scrapedLeads.length > 0) {
      console.log(`Scraped ${scrapedLeads.length} leads`);
      
      // Save scraped leads to the database
      await Lead.insertMany(scrapedLeads);
    } else {
      console.warn('No leads were scraped.');
    }

    // Fetch all leads from the database
    const leads = await Lead.find({});
    console.log(`Fetched ${leads.length} leads from the database`);

    // Return the leads as a JSON response
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching or scraping leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads', details: error.message }, { status: 500 });
  }
}