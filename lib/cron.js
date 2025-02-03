import { scrapeLeads } from '@/lib/scraper';

async function runScraper() {
  const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse'];
  for (let city of cities) {
    console.log(`Scraping leads in ${city}...`);
    await scrapeLeads('particulier', city);
    await new Promise(res => setTimeout(res, 5000)); // Wait 5s to avoid detection
  }
}

runScraper().then(() => console.log('Scraper finished!'));
