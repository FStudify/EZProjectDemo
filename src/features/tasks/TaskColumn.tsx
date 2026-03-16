import { useState } from 'react';
import type { Task, TaskStatus, ProjectMember } from '@/types';
import TaskCard from './TaskCard';

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-blue-500',
  IN_PROGRESS: 'bg-amber-500',
  DONE: 'bg-emerald-500',
  CLOSED: 'bg-slate-500',
  ON_HOLD: 'bg-orange-400',
  CANCELLED: 'bg-red-400',
};

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  projectMembers?: ProjectMember[];
  onTaskClick?: (task: Task) => void;
  onDrop?: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskColumn({
  title,
  tasks,
  status,
  projectMembers = [],
  onTaskClick,
  onDrop,
}: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    let id = taskId;
    try {
      const parsed = JSON.parse(taskId);
      if (parsed.taskId) id = parsed.taskId;
    } catch {
      // use as-is
    }
    if (id) onDrop?.(id, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex w-[336px] flex-shrink-0 flex-col rounded-xl border-2 min-h-[320px] transition-colors ${
        isDragOver
          ? 'border-primary/40 bg-primary-50/50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`}
            aria-hidden
          />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <span className="ml-auto text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-0">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            projectMembers={projectMembers}
            onClick={() => onTaskClick?.(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-xs">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}
