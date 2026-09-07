const fetch = require('node-fetch');

// Simple in-memory cache
const cache = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export default async function handler(req, res) {
  // Vercel functions can receive query parameters in req.query
  const { refresh } = req.query || {};
  const shouldRefresh = refresh === 'true';

  if (!shouldRefresh && cache.data && (Date.now() - cache.timestamp < CACHE_DURATION)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(cache.data);
  }

  try {
    const response = await fetch('https://groww.in/v1/api/mutual-funds', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://groww.in/mutual-funds/filter',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Groww API responded with ${response.status}: ${await response.text()}`);
      throw new Error(`Groww API responded with ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    cache.data = data;
    cache.timestamp = Date.now();

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Groww API:', error);
    return res.status(500).json({
      error: 'Failed to fetch fund data from Groww',
      details: error.message
    });
  }
}
