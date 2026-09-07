# FundLens · Mutual Fund Screener

A modern tool to screen Indian mutual funds by the criteria that matter for long-term durability — fund age, max drawdown, expense ratio, Sharpe ratio, and consistency — rather than just chasing short-term winners.

## Features

- **180 funds** across Equity, Hybrid, and Debt categories from 20 AMCs
- **Filter by**: category, fund age, max drawdown, expense ratio, 3-year return, AUM, Sharpe ratio, star rating
- **Consistency score** — a composite metric blending Sharpe ratio, drawdown resilience, 3-year returns, and fund age
- **Quick presets** — Low Volatility Equity, High Growth, Stable Debt, All-Rounders
- **Sortable table** with color-coded returns, drawdown, and consistency bars
- **Detail drawer** with simulated equity curve, risk metrics (Sharpe, Sortino, alpha, beta), and full fund info
- **Live stats bar** — aggregate averages for the filtered set
- **Dark mode** with system preference detection
- **Fully responsive** — mobile filter drawer, paginated results

## Tech Stack

- React 19
- Tailwind CSS 3
- esbuild (custom build script)
- Deployed on Netlify

## Getting Started

```bash
npm install
npm run build      # produces dist/
npm run dev        # local dev server (Vite)
```

## Data Note

The fund dataset is **illustrative** — generated with realistic ranges for NAV, AUM, returns, drawdowns, and risk metrics, but it is not live market data. Always verify with official fund factsheets before making investment decisions. This tool is for demonstration purposes and is **not investment advice**.

## Project Structure

```
src/
  data/funds.js          # 180 generated fund records
  utils/format.js         # formatting helpers
  hooks/useTheme.js       # dark mode hook
  components/
    FilterPanel.jsx       # sidebar with sliders, chips, presets
    FundTable.jsx         # sortable results table
    StatsBar.jsx          # aggregate stats cards
    DetailDrawer.jsx      # fund detail panel with equity curve
  App.jsx                 # main app, state, filtering logic
build.mjs                 # custom esbuild + Tailwind build script
generate_funds.py         # dataset generator
```
