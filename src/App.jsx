import { useMemo, useState, useEffect } from 'react';
import useTheme from './hooks/useTheme';
import FilterPanel from './components/FilterPanel';
import FundTable from './components/FundTable';
import StatsBar from './components/StatsBar';
import DetailDrawer from './components/DetailDrawer';
import { mapGrowwFundToSchema, fundNameToSlug } from './utils/groww-mapper';

const DEFAULT_FILTERS = {
  search: '',
  categories: [],
  minAge: 0,
  maxDrawdown: 0,
  maxExpense: 2.5,
  minReturn3Y: 0,
  minAUM: 0,
  minSharpe: 0,
  minRating: 0,
  consistentOnly: false,
};

export default function App() {
  const { dark, toggle } = useTheme();
  const [funds, setFunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState({ field: 'consistencyScore', dir: 'desc' });
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const fetchFunds = async (forceRefresh = false) => {
    try {
      setIsLoading(forceRefresh ? false : true);
      if (forceRefresh) setIsRefreshing(true);

      const url = `/.netlify/functions/get-funds${forceRefresh ? '?refresh=true' : ''}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to fetch fund data');

      const rawData = await response.json();

      // Handle different possible API response structures
      const fundList = Array.isArray(rawData) ? rawData : (rawData.data || []);
      const mappedFunds = fundList.map(mapGrowwFundToSchema);

      setFunds(mappedFunds);
      setError(null);

      // Handle deep linking: check if URL hash contains a fund slug
      const hash = window.location.hash;
      if (hash && hash.startsWith('#fund/')) {
        const slug = hash.replace('#fund/', '');
        const matchedFund = mappedFunds.find(f => fundNameToSlug(f.name) === slug);
        if (matchedFund) setSelected(matchedFund);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const handleRefresh = () => {
    if (window.confirm("Updating fund data will reset your current view. This may take a few minutes. Continue?")) {
      fetchFunds(true);
    }
  };

  const filtered = useMemo(() => {
    let r = funds.filter((f) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !f.amcShort.toLowerCase().includes(q)) return false;
      }
      if (filters.categories.length && !filters.categories.includes(f.category)) return false;
      if (f.fundAgeYears < filters.minAge) return false;
      if (filters.maxDrawdown < 0 && f.maxDrawdown < filters.maxDrawdown) return false;
      if (f.expenseRatio > filters.maxExpense) return false;
      if ((f.returns3Y ?? 0) < filters.minReturn3Y) return false;
      if (f.aum < filters.minAUM) return false;
      if (f.sharpeRatio < filters.minSharpe) return false;
      if (f.rating < filters.minRating) return false;
      if (filters.consistentOnly) {
        if (f.sharpeRatio < 1 || f.maxDrawdown < -30 || f.fundAgeYears < 5) return false;
      }
      return true;
    });

    r = [...r].sort((a, b) => {
      const dir = sort.dir === 'desc' ? -1 : 1;
      const av = a[sort.field];
      const bv = b[sort.field];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'string') return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
    return r;
  }, [funds, filters, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const onSort = (field) => {
    setSort((s) => ({
      field,
      dir: s.field === field && s.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  const onReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Category', 'SubCategory', 'AMC', '3Y Return %', '5Y Return %', 'Max Drawdown %', 'Expense Ratio %', 'Sharpe Ratio', 'Age (Yrs)', 'AUM (Cr)', 'Rating', 'Consistency Score'];
    const rows = filtered.map(f => [
      f.name, f.category, f.subCategory, f.amcShort, f.returns3Y, f.returns5Y, f.maxDrawdown, f.expenseRatio, f.sharpeRatio, f.fundAgeYears, f.aum, f.rating, f.consistencyScore
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fundlens_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeFilterCount =
    (filters.categories.length ? 1 : 0) +
    (filters.minAge > 0 ? 1 : 0) +
    (filters.maxDrawdown < 0 ? 1 : 0) +
    (filters.maxExpense < 2.5 ? 1 : 0) +
    (filters.minReturn3Y > 0 ? 1 : 0) +
    (filters.minAUM > 0 ? 1 : 0) +
    (filters.minSharpe > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.consistentOnly ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading mutual funds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button onClick={() => fetchFunds()} className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 17l6-6 4 4 8-8" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">FundLens</h1>
              <p className="text-xs text-slate-400 leading-tight">Mutual Fund Screener</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition disabled:opacity-50"
              aria-label="Refresh data"
            >
              <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 00-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="hidden sm:block text-sm text-slate-400">
              {filtered.length} of {funds.length} funds
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.72 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Find <span className="text-brand-600">consistent</span> performers,
          <br className="hidden sm:block" /> not just short-term winners.
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl">
          Screen {funds.length} Indian mutual funds by fund age, max drawdown, expense ratio,
          Sharpe ratio and more — to surface funds that have stayed durable across cycles.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
              placeholder="Search fund name or AMC…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="px-4 py-3 rounded-xl bg-brand-600 text-white text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.59a1 1 0 01-.29.7l-6.42 6.43a1 1 0 00-.29.7V19l-4 2v-5.58a1 1 0 00-.29-.7L3.29 7.29A1 1 0 013 6.59V4z" />
              </svg>
              Filters {activeFilterCount > 0 && <span className="bg-white/20 px-1.5 rounded-full text-xs">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card lg:sticky lg:top-20">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </h3>
              <FilterPanel filters={filters} setFilters={(f) => { setFilters(f); setPage(1); }} onReset={onReset} />
            </div>
          </aside>

          <div className="space-y-5 min-w-0">
            <StatsBar funds={filtered} />
            <FundTable funds={paged} sort={sort} onSort={onSort} onSelect={setSelected} selectedId={selected?.id} />
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition">← Prev</button>
                <span className="text-sm text-slate-500 px-2">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Next →</button>
              </div>
            )}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">No funds match your filters.</p>
                <p className="text-sm mt-1">Try relaxing the drawdown or expense limits.</p>
                <button onClick={onReset} className="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium">Reset filters</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center text-xs text-slate-400">
        FundLens · Built for demonstration. Data is illustrative and not investment advice.
      </footer>

      <DetailDrawer fund={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
