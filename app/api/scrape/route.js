// app/api/scrape/route.js
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core'; // Use 'core' for serverless compatibility
import Lead from '../../../models/lead';
import { detectSubsidyIntent } from '@/lib/scraper';
import { z } from 'zod';

// Input validation schema
const ScrapeSchema = z.object({
  location: z.string().min(2).max(100),
  maxPages: z.number().int().min(1).max(5).default(1)
});

// Use Chrome AWS Lambda layer or browserless.io for production
const CHROME_WS_ENDPOINT = process.env.CHROME_WS_ENDPOINT || '';

export async function POST(request) {
  try {
    // Validate input
    const body = await request.json();
    const validation = ScrapeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    const { location, maxPages } = validation.data;

    // Configure browser for serverless environments
    const browser = await puppeteer.connect({
      browserWSEndpoint: CHROME_WS_ENDPOINT || await getBrowserWSEndpoint(),
      headless: true
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...');

    let filteredLeads = [];
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://www.pagesjaunes.fr/recherche/${location}/energie?page=${pageNum}`;
      
      // Add polite scraping delay
      await page.waitForTimeout(2000 + Math.random() * 3000);
      
      await page.goto(url, { waitUntil: 'networkidle2' });

      const leads = await page.evaluate(() => 
        Array.from(document.querySelectorAll('.bi-content')).map((el) => ({
          name: el.querySelector('.bi-company')?.innerText?.trim() || '',
          phone: el.querySelector('.bi-phone')?.innerText?.trim() || '',
          address: el.querySelector('.bi-adresse')?.innerText?.trim() || '',
          source: 'PagesJaunes',
        }))
      );

      // NLP filtering
      for (const lead of leads) {
        const textToAnalyze = `${lead.name} ${lead.address}`.toLowerCase();
        if (await detectSubsidyIntent(textToAnalyze)) {
          filteredLeads.push({
            ...lead,
            keywords: ['proprietes', 'energetiques'],
            status: 'uncontacted'
          });
        }
      }
    }

    // GDPR-compliant save (phone hashing handled in Lead model)
    if (filteredLeads.length > 0) {
      await Lead.insertMany(filteredLeads);
    }

    await browser.close();

    return NextResponse.json({
      message: `Successfully processed ${filteredLeads.length} qualified leads`,
      newLeads: filteredLeads.length
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Scraping failed', details: error.message },
      { status: 500 }
    );
  }
}

// Helper for browserless.io integration
async function getBrowserWSEndpoint() {
  const res = await fetch('https://chrome.browserless.io/json/version');
  const data = await res.json();
  return data.webSocketDebuggerUrl;
}