import {
  fmtPct, fmtNum, fmtCr, fmtNav, fmtAge,
  categoryColor, returnColor, drawdownColor,
} from '../utils/format';

function StarRating({ rating }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.97 0 1.37 1.24.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.69-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L2.1 9.61c-.78-.57-.38-1.81.59-1.81h4.4a1 1 0 00.95-.69L9.05 2.93z" />
        </svg>
      ))}
    </span>
  );
}

function ConsistencyBadge({ score }) {
  const color = score >= 75 ? 'emerald' : score >= 55 ? 'amber' : 'slate';
  const cls = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-400',
  }[color];
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full ${cls} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-8">{score}</span>
    </div>
  );
}

function SortHeader({ label, field, sort, onSort, className = '' }) {
  const active = sort.field === field;
  return (
    <th
      className={`px-4 py-3 cursor-pointer select-none whitespace-nowrap hover:text-brand-600 dark:hover:text-brand-400 transition ${
        active ? 'text-brand-600 dark:text-brand-400' : ''
      } ${className}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <svg className={`w-3 h-3 transition ${active ? 'opacity-100' : 'opacity-30'} ${active && sort.dir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </span>
    </th>
  );
}

export default function FundTable({ funds, sort, onSort, onSelect, selectedId }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            <SortHeader label="Fund" field="name" sort={sort} onSort={onSort} className="text-left min-w-[220px]" />
            <SortHeader label="3Y" field="returns3Y" sort={sort} onSort={onSort} />
            <SortHeader label="5Y" field="returns5Y" sort={sort} onSort={onSort} />
            <SortHeader label="Max DD" field="maxDrawdown" sort={sort} onSort={onSort} />
            <SortHeader label="Expense" field="expenseRatio" sort={sort} onSort={onSort} />
            <SortHeader label="Sharpe" field="sharpeRatio" sort={sort} onSort={onSort} />
            <SortHeader label="Age" field="fundAgeYears" sort={sort} onSort={onSort} />
            <SortHeader label="AUM" field="aum" sort={sort} onSort={onSort} />
            <SortHeader label="★" field="rating" sort={sort} onSort={onSort} />
            <SortHeader label="Consistency" field="consistencyScore" sort={sort} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {funds.map((f) => (
            <tr
              key={f.id}
              onClick={() => onSelect(f)}
              className={`border-b border-slate-100 dark:border-slate-800/60 cursor-pointer transition ${
                selectedId === f.id
                  ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-inset ring-brand-200 dark:ring-brand-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <td className="px-4 py-3">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{f.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(f.category)}`}>{f.category} · {f.subCategory}</span>
                  <span className="text-xs text-slate-400">{f.amcShort}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center font-semibold tabular-nums"><span className={returnColor(f.returns3Y)}>{fmtPct(f.returns3Y)}</span></td>
              <td className="px-4 py-3 text-center tabular-nums"><span className={returnColor(f.returns5Y)}>{fmtPct(f.returns5Y)}</span></td>
              <td className="px-4 py-3 text-center tabular-nums"><span className={drawdownColor(f.maxDrawdown)}>{fmtPct(f.maxDrawdown)}</span></td>
              <td className="px-4 py-3 text-center tabular-nums text-slate-600 dark:text-slate-300">{fmtPct(f.expenseRatio, 2)}</td>
              <td className="px-4 py-3 text-center tabular-nums text-slate-600 dark:text-slate-300">{fmtNum(f.sharpeRatio)}</td>
              <td className="px-4 py-3 text-center tabular-nums text-slate-600 dark:text-slate-300">{fmtAge(f.fundAgeYears)}</td>
              <td className="px-4 py-3 text-center tabular-nums text-slate-600 dark:text-slate-300">{fmtCr(f.aum)}</td>
              <td className="px-4 py-3 text-center"><StarRating rating={f.rating} /></td>
              <td className="px-4 py-3"><ConsistencyBadge score={f.consistencyScore} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
