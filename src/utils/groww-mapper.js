export const fundNameToSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

export const slugToFundName = (slug) => {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const mapGrowwFundToSchema = (rawFund) => {
  // Mapping based on discovered Groww API structure
  // Note: Some fields are approximated if not directly available in the list API
  return {
    id: rawFund.id || Math.random(),
    name: rawFund.schemeName || rawFund.name,
    amc: rawFund.amcName || 'Unknown AMC',
    amcShort: (rawFund.amcName || 'Unknown').split(' ')[0],
    category: rawFund.category || 'Equity',
    subCategory: rawFund.subCategory || 'Diversified',
    nav: rawFund.currentNav || 0,
    aum: rawFund.aum || 0,
    expenseRatio: rawFund.expenseRatio || 0,
    returns1Y: rawFund.returns?.[0] || 0,
    returns3Y: rawFund.returns?.[1] || 0,
    returns5Y: rawFund.returns?.[2] || 0,
    maxDrawdown: rawFund.maxDrawdown || -10, // Default or fetched on-demand
    volatility: rawFund.volatility || 15,
    sharpeRatio: rawFund.sharpeRatio || 1,
    sortinoRatio: rawFund.sortinoRatio || 1.2,
    alpha: rawFund.alpha || 0,
    beta: rawFund.beta || 1,
    rating: rawFund.rating || 3,
    minimumInvestment: rawFund.minimumInvestment || 500,
    benchmark: rawFund.benchmark || 'NIFTY 50 TRI',
    consistencyScore: calculateConsistencyScore(
      rawFund.sharpeRatio || 1,
      rawFund.maxDrawdown || -10,
      rawFund.returns?.[1] || 0,
      rawFund.fundAgeYears || 5
    ),
  };
};

function calculateConsistencyScore(sharpe, drawdown, return3Y, age) {
  const sScore = Math.min(100, (sharpe / 2.2) * 100);
  const dScore = Math.min(100, (1 - Math.abs(drawdown) / 50) * 100);
  const rScore = Math.min(100, Math.max(0, (return3Y + 5) / 25) * 100);
  const aScore = Math.min(100, (age / 22) * 100);

  return Math.round(
    0.35 * sScore +
    0.30 * dScore +
    0.20 * rScore +
    0.15 * aScore
  );
}
