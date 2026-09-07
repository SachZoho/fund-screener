export const fmtCr = (v) => {
  if (v >= 10000) return `₹${(v / 10000).toFixed(1)}k Cr`;
  return `₹${v.toLocaleString('en-IN')} Cr`;
};

export const fmtPct = (v, dp = 1) =>
  v === null || v === undefined ? '—' : `${v.toFixed(dp)}%`;

export const fmtNum = (v, dp = 2) =>
  v === null || v === undefined ? '—' : v.toFixed(dp);

export const fmtNav = (v) => `₹${v.toFixed(2)}`;

export const fmtAge = (v) => {
  const yrs = Math.floor(v);
  const mos = Math.round((v - yrs) * 12);
  if (mos === 0) return `${yrs}y`;
  return `${yrs}y ${mos}m`;
};

export const categoryColor = (cat) => {
  const map = {
    Equity: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    Hybrid: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
    Debt: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  };
  return map[cat] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
};

export const returnColor = (v) => {
  if (v === null || v === undefined) return 'text-slate-400';
  return v >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
};

export const drawdownColor = (v) => {
  if (v === null || v === undefined) return 'text-slate-400';
  const abs = Math.abs(v);
  if (abs < 10) return 'text-emerald-600 dark:text-emerald-400';
  if (abs < 25) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};
