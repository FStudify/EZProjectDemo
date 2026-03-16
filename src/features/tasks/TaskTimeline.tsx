import { useMemo } from 'react';
import type { Task, TaskStatus, ProjectMember } from '@/types';
import { ProjectMemberAvatar } from '@/components/ui';

interface TaskTimelineProps {
  tasks: Task[];
  projectDeadline: string;
  projectStart: string;
  projectMembers?: ProjectMember[];
  onTaskClick?: (task: Task) => void;
}

function getTaskBarStyle(
  task: Task,
  startDate: Date,
  endDate: Date,
): { left: number; width: number; color: string } {
  const rangeStart = startDate.getTime();
  const rangeEnd = endDate.getTime();
  const rangeTotal = rangeEnd - rangeStart;
  const taskStart = Math.max(new Date(task.createdAt).getTime(), rangeStart);
  const taskEnd = Math.min(new Date(task.deadline).getTime(), rangeEnd);
  const left = ((taskStart - rangeStart) / rangeTotal) * 100;
  const width = Math.max(3, ((taskEnd - taskStart) / rangeTotal) * 100);

  const statusColors: Record<TaskStatus, string> = {
    DONE: 'bg-emerald-500',
    CLOSED: 'bg-slate-500',
    IN_PROGRESS: 'bg-primary',
    TODO: 'bg-amber-400',
    ON_HOLD: 'bg-slate-400',
    CANCELLED: 'bg-slate-300',
  };
  return {
    left,
    width,
    color: statusColors[task.status],
  };
}

export default function TaskTimeline({
  tasks,
  projectDeadline,
  projectStart,
  projectMembers = [],
  onTaskClick,
}: TaskTimelineProps) {
  const startDate = useMemo(() => new Date(projectStart), [projectStart]);
  const endDate = useMemo(() => new Date(projectDeadline), [projectDeadline]);

  const weeks = useMemo(() => {
    const w: { label: string; date: Date }[] = [];
    const d = new Date(startDate);
    d.setHours(0, 0, 0, 0);
    const endTime = endDate.getTime();
    let i = 1;
    while (d.getTime() <= endTime) {
      w.push({
        label: `Week ${i}`,
        date: new Date(d),
      });
      d.setDate(d.getDate() + 7);
      i++;
    }
    return w;
  }, [startDate, endDate]);

  const sortedTasks = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status !== 'CANCELLED')
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [tasks],
  );

  return (
    <div className="space-y-4">
      {/* Project deadline */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
        <strong>Project deadline:</strong>{' '}
        {endDate.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      {/* Timeline with grid */}
      <div className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden">
        {/* Week headers - grid cells */}
        <div
          className="grid border-b-2 border-slate-200 bg-slate-50"
          style={{ gridTemplateColumns: `180px repeat(${weeks.length}, minmax(64px, 1fr))` }}
        >
          <div className="px-3 py-2.5 text-xs font-semibold text-slate-600 border-r border-slate-200">
            Task
          </div>
          {weeks.map((w, i) => (
            <div
              key={i}
              className="px-1 py-2 text-center text-xs font-medium text-slate-600 border-r border-slate-200 last:border-r-0"
            >
              {w.label}
              <br />
              <span className="text-[10px] text-slate-400">
                {w.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>

        {/* Task rows - grid cells with borders */}
        {sortedTasks.map((task) => {
          const { left, width, color } = getTaskBarStyle(
            task,
            startDate,
            endDate,
          );
          const isInProgress = task.status === 'IN_PROGRESS';
          const isUpcoming = task.status === 'TODO';

          return (
            <div
              key={task.id}
              className="grid border-b border-slate-200 last:border-b-0 hover:bg-slate-50/70 transition-colors cursor-pointer"
              style={{ gridTemplateColumns: `180px repeat(${weeks.length}, minmax(64px, 1fr))` }}
              onClick={() => onTaskClick?.(task)}
            >
              <div className="flex items-center gap-2 px-3 py-2.5 min-w-0 border-r border-slate-200">
                <ProjectMemberAvatar member={task.assignee} projectMembers={projectMembers} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {task.assignee.name}
                    {isInProgress && (
                      <span className="ml-1 text-indigo-600 font-medium">• In progress</span>
                    )}
                    {isUpcoming && (
                      <span className="ml-1 text-amber-600 font-medium">• Upcoming</span>
                    )}
                  </p>
                </div>
              </div>
              {/* Timeline cells - one per week */}
              <div
                className="relative col-span-full h-12 py-2 border-r-0"
                style={{ gridColumn: `2 / -1` }}
              >
                {/* Grid lines for weeks */}
                <div className="absolute inset-0 flex">
                  {weeks.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-0 border-r border-slate-200 last:border-r-0"
                    />
                  ))}
                </div>
                {/* Task bar */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 h-7 rounded ${color} min-w-[28px] transition-all hover:opacity-90 hover:ring-2 hover:ring-primary/50 cursor-pointer`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                  title={`${task.title} • Click to edit`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
