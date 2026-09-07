import { fmtPct, fmtCr, fmtNum } from '../utils/format';

function Stat({ label, value, sub, accent }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-card">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-0.5 ${accent || 'text-slate-800 dark:text-slate-100'}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function StatsBar({ funds }) {
  const n = funds.length;
  const avgReturn3Y = n ? (funds.reduce((s, f) => s + (f.returns3Y || 0), 0) / n).toFixed(1) : '—';
  const avgDD = n ? (funds.reduce((s, f) => s + f.maxDrawdown, 0) / n).toFixed(1) : '—';
  const avgExpense = n ? (funds.reduce((s, f) => s + f.expenseRatio, 0) / n).toFixed(2) : '—';
  const avgSharpe = n ? (funds.reduce((s, f) => s + f.sharpeRatio, 0) / n).toFixed(2) : '—';
  const totalAUM = n ? fmtCr(funds.reduce((s, f) => s + f.aum, 0)) : '—';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Stat label="Funds" value={n} accent="text-brand-600 dark:text-brand-400" />
      <Stat label="Avg 3Y Return" value={n ? `${avgReturn3Y}%` : '—'} accent="text-emerald-600 dark:text-emerald-400" />
      <Stat label="Avg Max DD" value={n ? `${avgDD}%` : '—'} accent="text-red-500 dark:text-red-400" />
      <Stat label="Avg Expense" value={n ? `${avgExpense}%` : '—'} />
      <Stat label="Avg Sharpe" value={n ? fmtNum(parseFloat(avgSharpe)) : '—'} />
      <Stat label="Total AUM" value={totalAUM} />
    </div>
  );
}
