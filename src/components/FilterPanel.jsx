import { fmtPct } from '../utils/format';

const CATEGORIES = ['Equity', 'Hybrid', 'Debt'];

function SliderRow({ label, value, min, max, step, onChange, suffix = '', children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        {children ?? (
          <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            {value}{suffix}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between mt-1 text-xs text-slate-400">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterPanel({ filters, setFilters, onReset }) {
  const update = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const toggleCategory = (cat) => {
    setFilters((f) => {
      const has = f.categories.includes(cat);
      return { ...f, categories: has ? f.categories.filter((c) => c !== cat) : [...f.categories, cat] };
    });
  };

  const toggleRating = (r) => {
    setFilters((f) => {
      const has = f.minRating === r;
      return { ...f, minRating: has ? 0 : r };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fund Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={filters.categories.includes(c)} onClick={() => toggleCategory(c)}>{c}</Chip>
          ))}
        </div>
      </div>

      <SliderRow label="Min Fund Age" value={filters.minAge} min={0} max={20} step={0.5} onChange={(v) => update('minAge', v)} suffix=" yrs" />

      <SliderRow label="Max Drawdown (worst allowed)" value={filters.maxDrawdown} min={-50} max={0} step={1} onChange={(v) => update('maxDrawdown', v)}>
        <span className="text-sm font-semibold text-red-500 dark:text-red-400">{fmtPct(filters.maxDrawdown, 0)}</span>
      </SliderRow>

      <SliderRow label="Max Expense Ratio" value={filters.maxExpense} min={0.1} max={2.5} step={0.05} onChange={(v) => update('maxExpense', v)} suffix="%' />

      <SliderRow label="Min 3-Year Return" value={filters.minReturn3Y} min={0} max={30} step={0.5} onChange={(v) => update('minReturn3Y', v)} suffix="%' />

      <SliderRow label="Min AUM" value={filters.minAUM} min={0} max={30000} step={500} onChange={(v) => update('minAUM', v)}>
        <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{filters.minAUM >= 1000 ? `₹${(filters.minAUM / 1000).toFixed(1)}k Cr` : `₹${filters.minAUM} Cr`}</span>
      </SliderRow>

      <SliderRow label="Min Sharpe Ratio" value={filters.minSharpe} min={0} max={2.5} step={0.1} onChange={(v) => update('minSharpe', v)} />

      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Min Star Rating</label>
        <div className="flex gap-2">
          {[0, 3, 4, 5].map((r) => (
            <Chip key={r} active={filters.minRating === r} onClick={() => toggleRating(r)}>{r === 0 ? 'Any' : `${r}★+`}</Chip>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <button type="button" onClick={() => update('consistentOnly', !filters.consistentOnly)} className={`relative w-11 h-6 rounded-full transition-colors ${filters.consistentOnly ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${filters.consistentOnly ? 'translate-x-5' : ''}`} />
        </button>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Consistent performers only
          <span className="block text-xs text-slate-400 font-normal">High Sharpe, low drawdown, aged 5y+</span>
        </span>
      </label>

      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Quick Presets</label>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setFilters({ ...filters, categories: ['Equity'], minAge: 5, maxDrawdown: -30, maxExpense: 2, minReturn3Y: 12, minAUM: 500, minSharpe: 1, minRating: 4, consistentOnly: true })} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition">🛡️ Low Volatility Equity</button>
          <button onClick={() => setFilters({ ...filters, categories: ['Equity'], minAge: 3, maxDrawdown: -45, maxExpense: 2.2, minReturn3Y: 18, minAUM: 300, minSharpe: 0.8, minRating: 0, consistentOnly: false })} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition">🚀 High Growth</button>
          <button onClick={() => setFilters({ ...filters, categories: ['Debt'], minAge: 3, maxDrawdown: -5, maxExpense: 0.8, minReturn3Y: 5, minAUM: 500, minSharpe: 1, minRating: 0, consistentOnly: false })} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition">💰 Stable Debt</button>
          <button onClick={() => setFilters({ ...filters, categories: ['Equity', 'Hybrid'], minAge: 7, maxDrawdown: -25, maxExpense: 1.8, minReturn3Y: 10, minAUM: 1000, minSharpe: 1.2, minRating: 4, consistentOnly: true })} className="text-xs px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition">⭐ All-Rounders</button>
        </div>
      </div>

      <button onClick={onReset} className="w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition">Reset Filters</button>
    </div>
  );
}
