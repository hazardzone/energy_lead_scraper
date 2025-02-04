const express = require('express');
const cors = require('cors');
const scrapeLeads = require('./scraper');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Endpoint to fetch leads from Les Pages Jaunes
app.get('/api/leads', async (req, res) => {
  try {
    const query = req.query.query || 'restaurants'; // Default query
    const leads = await scrapeLeads(query);
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});