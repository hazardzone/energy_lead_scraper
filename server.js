require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const scraper = require('./lib/scraper'); // Ensure the path is correct

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001; // Use PORT from env or default to 3001

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Endpoint to fetch leads from Les Pages Jaunes
app.get('/api/leads', async (req, res) => {
  try {
    const query = req.query.query || 'restaurants'; // Default query
    if (!query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Fetching leads for query: ${query}`);
    const leads = await scraper(query);

    if (!leads || leads.length === 0) {
      return res.status(200).json({ message: 'No leads found', data: [] });
    }

    res.status(200).json({ message: 'Leads fetched successfully', data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error.message);
    res.status(500).json({ error: 'Failed to fetch leads', details: error.message });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});