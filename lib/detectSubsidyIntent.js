import axios from 'axios';

/**
 * Function to detect subsidy intent based on the lead's name.
 * @param {string} name - The name of the lead.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating subsidy intent.
 */
export async function detectSubsidyIntent(name) {
  try {
    // Example API call to detect subsidy intent
    const response = await axios.post('https://api.example.com/detect-subsidy-intent', { name });
    return response.data.hasSubsidyIntent;
  } catch (error) {
    console.error('Error detecting subsidy intent:', error);
    return false;
  }
}