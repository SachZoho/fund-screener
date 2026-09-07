const fetch = require('node-fetch');

// Simple in-memory cache
const cache = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

exports.handler = async (event) => {
  const { refresh } = event.queryStringParameters || {};
  const shouldRefresh = refresh === 'true';

  if (!shouldRefresh && cache.data && (Date.now() - cache.timestamp < CACHE_DURATION)) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cache.data),
    };
  }

  try {
    // Note: Groww's internal API endpoint discovered during exploration
    const response = await fetch('https://groww.in/v1/api/mutual-funds', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://groww.in/mutual-funds/filter',
      },
    });

    if (!response.ok) {
      throw new Error(`Groww API responded with ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    cache.data = data;
    cache.timestamp = Date.now();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Enable CORS for local dev
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching from Groww API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch fund data from Groww' }),
    };
  }
};
