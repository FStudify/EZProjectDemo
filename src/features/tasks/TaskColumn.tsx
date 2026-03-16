import { useState } from 'react';
import type { Task, TaskStatus, ProjectMember } from '@/types';
import TaskCard from './TaskCard';

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-[#E6A86F]',
  IN_PROGRESS: 'bg-[#D97853]',
  DONE: 'bg-[#6EBC53]',
  CLOSED: 'bg-[#AFA59C]',
  ON_HOLD: 'bg-[#CD976B]',
  CANCELLED: 'bg-[#C3B4A9]',
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
      className={`flex w-full min-w-0 flex-col rounded-xl border-2 min-h-[300px] transition-colors ${
        isDragOver
          ? 'border-[#D97853]/40 bg-[#FFF4EC]'
          : 'border-[#E7D7CC] bg-[#FCF7F2]'
      }`}
    >
      <div className="border-b border-[#E7D7CC] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`}
            aria-hidden
          />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <span className="ml-auto rounded-full bg-[#E9DFD7] px-2 py-0.5 text-xs text-slate-500">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="ez-task-scrollbar flex-1 min-h-0 space-y-1.5 overflow-y-auto p-1.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            projectMembers={projectMembers}
            onClick={() => onTaskClick?.(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E6D7CC] py-6 text-slate-400">
            <p className="text-xs">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}
