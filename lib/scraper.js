import 'module-alias/register.js';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { saveLead } from '@/lib/saveLead';
import { checkRobotsTxt } from '@/lib/checkRobotsTxt';
import { detectSubsidyIntent } from '@/lib/detectSubsidyIntent';
import { io } from '@/lib/socket'; // WebSocket for real-time updates

const BASE_URL = 'https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui={KEYWORD}&ou={CITY}';

export async function scrapeLeads(keyword = 'particulier', city = 'Paris') {
  try {
    const url = BASE_URL.replace('{KEYWORD}', keyword).replace('{CITY}', city);

    // Check robots.txt before scraping
    const isBlocked = await checkRobotsTxt(url);
    if (isBlocked) {
      console.log('Scraping blocked by robots.txt');
      return [];
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract leads
    const leads = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.bi-bloc')).map(el => ({
        name: el.querySelector('.bi-name')?.innerText.trim() || 'Unknown',
        phone: el.querySelector('.bi-phone a')?.innerText.trim() || 'N/A',
        address: el.querySelector('.bi-address')?.innerText.trim() || 'Unknown',
        source: window.location.href,
      }));
    });

    await browser.close();

    // Detect subsidy intent and send updates
    for (const lead of leads) {
      lead.subsidy = await detectSubsidyIntent(lead.name);
      await saveLead(lead); // Save to MongoDB
      console.log(JSON.stringify(lead, null, 2)); // Log each lead as JSON
      io.emit('new-lead', lead); // Send real-time update to dashboard
    }

    console.log(`✅ Scraped ${leads.length} leads from ${city}`);
    return leads;
  } catch (error) {
    console.error('❌ Scraping error:', error);
    return [];
  }
}