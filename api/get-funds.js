const fetch = require('node-fetch');

// Simple in-memory cache
const cache = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

exports.handler = async (req, res) => {
  const { refresh } = req.query || {};
  const shouldRefresh = refresh === 'true';

  if (!shouldRefresh && cache.data && (Date.now() - cache.timestamp < CACHE_DURATION)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(cache.data);
  }

  try {
    const response = await fetch('https://api.mfapi.in/mf', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`MFAPI responded with ${response.status}`);
    }

    const data = await response.json();
    cache.data = data;
    cache.timestamp = Date.now();

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from MFAPI:', error);
    return res.status(500).json({ error: 'Failed to fetch fund data from MFAPI', details: error.message });
  }
};
