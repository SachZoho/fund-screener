const fetch = require('node-fetch');

// Simple in-memory cache
const cache = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (Fund list doesn't change often)

exports.handler = async (event) => {
  const { refresh } = event.queryStringParameters || {};
  const shouldRefresh = refresh === 'true';

  if (!shouldRefresh && cache.data && (Date.now() - cache.timestamp < CACHE_DURATION)) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(cache.data),
    };
  }

  try {
    // Use the stable, open MFAPI.in endpoint for the fund list
    const response = await fetch('https://api.mfapi.in/mf');

    if (!response.ok) {
      throw new Error(`MFAPI responded with ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    cache.data = data;
    cache.timestamp = Date.now();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching from MFAPI:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch fund data from MFAPI' }),
    };
  }
};
