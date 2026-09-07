import {
  fmtPct, fmtNum, fmtCr, fmtNav, fmtAge,
  categoryColor, returnColor, drawdownColor,
} from '../utils/format';

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${accent || 'text-slate-800 dark:text-slate-100'}`}>{value}</span>
    </div>
  );
}

function EquityCurve({ fund }) {
  const pts = [];
  const n = 60;
  let v = 100;
  let seed = fund.id * 7 + 13;
  for (let i = 0; i < n; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = (seed / 233280 - 0.5);
    const drift = (fund.returns3Y || 10) / 100 / n;
    const vol = fund.volatility / 100 / Math.sqrt(n) * 3;
    v = v * (1 + drift + r * vol);
    pts.push(v);
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const w = 320, h = 80;
  const path = pts.map((p, i) => {
    const x = (i / (n - 1)) * w;
    const y = h - ((p - min) / (max - min || 1)) * h;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const up = pts[pts.length - 1] >= pts[0];
  const stroke = up ? '#10b981' : '#ef4444';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${fund.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#grad-${fund.id})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function DetailDrawer({ fund, onClose }) {
  if (!fund) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-card-lg overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{fund.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(fund.category)}`}>{fund.category} · {fund.subCategory}</span>
              <span className="text-xs text-slate-400">{fund.amc}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Simulated Equity Curve</div>
            <EquityCurve fund={fund} />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Returns</div>
            <div className="grid grid-cols-3 gap-2">
              {['1Y', '3Y', '5Y'].map((k) => {
                const val = fund[`returns${k}`];
                return (
                  <div key={k} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-center">
                    <div className="text-xs text-slate-400">{k}</div>
                    <div className={`text-base font-bold ${returnColor(val)}`}>{fmtPct(val)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Risk & Performance</div>
            <Row label="Max Drawdown" value={fmtPct(fund.maxDrawdown)} accent={drawdownColor(fund.maxDrawdown)} />
            <Row label="Volatility (Std Dev)" value={fmtPct(fund.volatility)} />
            <Row label="Sharpe Ratio" value={fmtNum(fund.sharpeRatio)} />
            <Row label="Sortino Ratio" value={fmtNum(fund.sortinoRatio)} />
            <Row label="Alpha" value={fmtPct(fund.alpha, 2)} accent={fund.alpha >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'} />
            <Row label="Beta" value={fmtNum(fund.beta)} />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Fund Details</div>
            <Row label="Fund Age" value={fmtAge(fund.fundAgeYears)} />
            <Row label="Expense Ratio" value={fmtPct(fund.expenseRatio, 2)} />
            <Row label="AUM" value={fmtCr(fund.aum)} />
            <Row label="NAV" value={fmtNav(fund.nav)} />
            <Row label="Min Investment" value={`₹${fund.minimumInvestment}`} />
            <Row label="Benchmark" value={fund.benchmark} />
            <Row label="Star Rating" value={'★'.repeat(fund.rating) + '☆'.repeat(5 - fund.rating)} />
            <Row label="Consistency Score" value={fund.consistencyScore} accent="text-brand-600 dark:text-brand-400" />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">Illustrative data for demonstration. Not investment advice. Always verify with official fund factsheets before investing.</p>
        </div>
      </aside>
    </>
  );
}
