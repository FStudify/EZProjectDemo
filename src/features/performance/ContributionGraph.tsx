import type { ContributionDay } from '@/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getColorClass(count: number): string {
  if (count === 0) return 'bg-slate-100';
  if (count <= 2) return 'bg-emerald-200';
  if (count <= 4) return 'bg-emerald-400';
  return 'bg-emerald-600';
}

interface ContributionGraphProps {
  contributions: ContributionDay[];
}

export default function ContributionGraph({ contributions }: ContributionGraphProps) {
  const weeks = 12;
  const daysPerWeek = 7;

  // Build grid: grid[row][col] where row=dayOfWeek (0=Mon), col=weekIndex
  const getCount = (row: number, col: number): number => {
    const idx = col * daysPerWeek + row;
    return contributions[idx]?.count ?? 0;
  };

  const getDateStr = (row: number, col: number): string => {
    const idx = col * daysPerWeek + row;
    return contributions[idx]?.date ?? '';
  };

  // Month labels: which week column starts a new month
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let col = 0; col < weeks; col++) {
    const idx = col * daysPerWeek;
    const dateStr = contributions[idx]?.date;
    if (dateStr) {
      const month = parseInt(dateStr.slice(5, 7), 10) - 1;
      if (month !== lastMonth) {
        monthLabels.push({ col, label: MONTHS[month] });
        lastMonth = month;
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Month labels row - same width as grid */}
      <div className="flex gap-1 pl-10">
        {Array.from({ length: weeks }, (_, col) => {
          const ml = monthLabels.find((m) => m.col === col);
          return (
            <div key={col} className="w-3 flex-shrink-0 text-xs text-slate-500">
              {ml?.label ?? ''}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 justify-around text-xs text-slate-500 w-10 shrink-0">
          {[0, 2, 4].map((row) => (
            <span key={row}>{DAY_LABELS[row]}</span>
          ))}
        </div>

        {/* Contribution grid */}
        <div className="flex gap-1">
          {Array.from({ length: weeks }, (_, col) => (
            <div key={col} className="flex flex-col gap-1">
              {Array.from({ length: daysPerWeek }, (_, row) => {
                const count = getCount(row, col);
                const dateStr = getDateStr(row, col);
                const dateLabel = dateStr
                  ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '';
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`w-3 h-3 rounded-sm ${getColorClass(count)}`}
                    title={dateLabel ? `${dateLabel}: ${count} contribution${count !== 1 ? 's' : ''}` : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-slate-100" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
