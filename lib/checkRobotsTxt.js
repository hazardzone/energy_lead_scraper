import axios from 'axios';

// Function to check robots.txt for scraping rules
export async function checkRobotsTxt(url) {
  try {
    const robotsUrl = new URL('/robots.txt', url).href;  // Construct robots.txt URL
    const response = await axios.get(robotsUrl);  // Fetch robots.txt file
    const robotsText = response.data.toLowerCase();  // Convert text to lowercase for easier matching

    // Check if the robots.txt contains "Disallow" rules for scraping
    // This is a simplified check, you can customize this logic as needed
    if (robotsText.includes('disallow') && robotsText.includes('scraping')) {
      return true;  // Scraping is blocked
    }
    return false;  // Scraping is allowed
  } catch (error) {
    console.error('Error fetching or parsing robots.txt:', error);
    return true;  // If we can't fetch robots.txt, assume scraping is blocked
  }
}
