import { pipeline } from '@xenova/transformers';
import axios from 'axios';

// Load CamemBERT for French text classification
const classifier = await pipeline('text-classification', 'Xenova/camembert-base');

// In lib/scraper.js (check robots.txt)

export async function checkRobotsTxt(url) {
  const robotsUrl = new URL(url).origin + '/robots.txt';
  const response = await axios.get(robotsUrl);
  return response.data.includes('Disallow: /recherche'); // Block if disallowed
}

export async function detectSubsidyIntent(text) {
  const result = await classifier(text);
  return result[0].label === 'POSITIVE'; // Adjust based on your training
}