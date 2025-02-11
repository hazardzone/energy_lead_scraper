const puppeteer = require('puppeteer');
const axios = require('axios');

// Function to check robots.txt
async function checkRobotsTxt(url) {
  try {
    const robotsUrl = new URL('/robots.txt', url).href;
    const response = await axios.get(robotsUrl);
    const robotsText = response.data.toLowerCase();
    return robotsText.includes('disallow') && robotsText.includes('scraping');
  } catch (error) {
    console.error('Error checking robots.txt:', error.message);
    return true; // Assume blocking if we fail to check
  }
}

// Main scraping function
async function scrapeLeads(query) {
  try {
    const searchUrl = `https://www.pagesjaunes.fr/recherche/${encodeURIComponent(query)}`;
    
    // Check robots.txt before scraping
    const isBlocked = await checkRobotsTxt(searchUrl);
    if (isBlocked) {
      console.log('Scraping blocked by robots.txt');
      return [];
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      // Navigate to the search page
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Extract lead information
      const leads = await page.evaluate(() => {
        const leadElements = Array.from(document.querySelectorAll('.bi-item'));
        return leadElements.map((el) => {
          const name = el.querySelector('.denomination-light')?.textContent?.trim() || 'N/A';
          const phone = el.querySelector('.phone')?.textContent?.trim() || 'N/A';
          const address = el.querySelector('.adresse-container')?.textContent?.trim() || 'N/A';
          return { name, phone, address };
        });
      });

      return leads;
    } catch (error) {
      console.error('Error scraping data:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error during scraping process:', error.message);
    return [];
  }
}

module.exports = scrapeLeads;