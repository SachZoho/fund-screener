export const mapMfApiFundToSchema = (rawFund) => {
  // mfapi.in provides: schemeCode, schemeName
  // Most other data is only available by calling /mf/{schemeCode}
  return {
    id: rawFund.schemeCode,
    name: rawFund.schemeName,
    amc: rawFund.schemeName.split(' ')[0], // Approximate AMC from name
    amcShort: rawFund.schemeName.split(' ')[0],
    category: 'Equity', // Default; updated by details scraper
    subCategory: 'Diversified',
    nav: 0, // Fetched separately
    aum: 0,
    expenseRatio: 0,
    returns1Y: 0,
    returns3Y: 0,
    returns5Y: 0,
    maxDrawdown: -10,
    volatility: 15,
    sharpeRatio: 1,
    sortinoRatio: 1.2,
    alpha: 0,
    beta: 1,
    rating: 3,
    minimumInvestment: 500,
    benchmark: 'NIFTY 50 TRI',
    consistencyScore: 50,
  };
};

export const fundNameToSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};
