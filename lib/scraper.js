// filepath: /c:/Users/USER/Desktop/Builds/lead_generation_bot/energy_lead_scraper/lib/scraper.js
import puppeteer from 'puppeteer';
import axios from 'axios';
import { saveLead } from '@/lib/saveLead';  // Function to save lead in DB
import { detectSubsidyIntent } from '@/lib/detectSubsidyIntent';  // Function to detect subsidy intent
import { io } from '@/lib/socket';  // WebSocket for real-time updates

const BASE_URL = 'https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui={KEYWORD}&ou={CITY}';

// Function to scrape leads
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
      lead.subsidy = await detectSubsidyIntent(lead.name);  // Detect subsidy intent for each lead
      await saveLead(lead);  // Save to MongoDB
      console.log(JSON.stringify(lead, null, 2));  // Log each lead as JSON
      io.emit('new-lead', lead);  // Send real-time update to dashboard
    }

    console.log(`✅ Scraped ${leads.length} leads from ${city}`);
    return leads;
  } catch (error) {
    console.error('❌ Scraping error:', error);
    return [];
  }
}

// Function to check robots.txt
async function checkRobotsTxt(url) {
  try {
    const robotsUrl = new URL('/robots.txt', url).href;
    const response = await axios.get(robotsUrl);
    const robotsText = response.data.toLowerCase();
    return robotsText.includes('disallow') && robotsText.includes('scraping');
  } catch (error) {
    console.error('Error checking robots.txt:', error);
    return true;  // Assume blocking if we fail to check
  }
}

// Function to detect subsidy intent (example placeholder logic)
async function detectSubsidyIntent(name) {
  // Placeholder logic for subsidy detection (e.g., check name patterns or external APIs)
  const subsidyKeywords = ['subsidy', 'grant', 'funding'];
  return subsidyKeywords.some(keyword => name.toLowerCase().includes(keyword));
}

// Function to save lead (example using MongoDB)
async function saveLead(lead) {
  try {
    // Example MongoDB insert (adjust as necessary for your database)
    const db = await getDatabaseConnection();  // Replace with actual DB connection logic
    await db.collection('leads').insertOne(lead);
    console.log(`Lead saved: ${lead.name}`);
  } catch (error) {
    console.error('Error saving lead:', error);
  }
}

// WebSocket setup for real-time updates
const io = {
  emit: (event, data) => {
    // Example placeholder for WebSocket (you can integrate with a real WebSocket server)
    console.log(`Emitting event: ${event}`, data);
  }
};

// Function to simulate getting a database connection (example)
async function getDatabaseConnection() {
  // Replace this with actual MongoDB connection logic
  return {
    collection: (name) => ({
      insertOne: async (data) => {
        console.log(`Simulating DB insert for ${name}:`, data);
      }
    })
  };
}