const fetch = require('node-fetch');
const cheerio = require('cheerio');

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
    // We attempt to fetch the HTML of the filter page.
    // Note: Since Groww is a heavy SPA, simple fetch might not get all data.
    // If this returns empty, we will need a headless browser like Puppeteer.
    const response = await fetch('https://groww.in/mutual-funds/filter', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://groww.in/mutual-funds/filter',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`Groww page responded with ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const funds = [];

    // Use the selectors discovered by the agent
    // Note: Selectors are based on utility classes which can be unstable.
    // We iterate through the fund containers.
    $('div.pos-rel.f22Link').each((i, el) => {
      const name = $(el).find('.fs14.clrText.fw500.f22LH34.f22Mb4.truncate').text().trim();
      const category = $(el).find('.fs12.fw500.clrSubText.f22Ls2').text().trim();
      const nav = $(el).find('.fd12Cell.clrText130.fs16.fw500').text().trim();

      // Returns are usually in a series of divs
      const returnsElements = $(el).find('.fs14.clrText.fw500.center-align.f22Mb4');
      const returns = [];
      returnsElements.each((_, retEl) => {
        returns.push(parseFloat(parseFloat($(retEl).text().replace(/[%+,]/g, '')) || 0));
      });

      if (name) {
        funds.push({
          id: i + 1,
          name: name,
          amc: name.split(' ')[0], // Approximate AMC
          amcShort: name.split(' ')[0],
          category: category || 'Equity',
          subCategory: category || 'Diversified',
          nav: parseFloat(nav.replace(/[^0-9.]/g, '')) || 0,
          aum: 0, // Not available in list view
          expenseRatio: 0, // Not available in list view
          returns1Y: returns[0] || 0,
          returns3Y: returns[1] || 0,
          returns5Y: returns[2] || 0,
          maxDrawdown: -10,
          volatility: 15,
          sharpeRatio: 1,
          sortinoRatio: 1.2,
          alpha: 0,
          beta: 1,
          rating: 3,
          minimumInvestment: 500,
          benchmark: 'NIFTY 50 TRI',
          consistencyScore: 50, // Default for scraped data
        });
      }
    });

    // Fallback: If scraping fails (likely due to SPA), we provide a meaningful error
    if (funds.length === 0) {
      throw new Error('Could not extract funds from Groww HTML. The page may be using dynamic rendering that requires a headless browser.');
    }

    // Update cache
    cache.data = funds;
    cache.timestamp = Date.now();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(funds),
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to scrape fund data from Groww',
        details: error.message
      }),
    };
  }
};
