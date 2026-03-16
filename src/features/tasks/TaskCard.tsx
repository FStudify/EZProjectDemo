import type { Task, TaskPriority } from '@/types';
import { ProjectMemberAvatar, Badge } from '@/components/ui';
import { Calendar } from 'lucide-react';

const priorityVariant: Record<TaskPriority, 'danger' | 'warning' | 'info'> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'info',
};

interface TaskCardProps {
  task: Task;
  projectMembers?: import('@/types').ProjectMember[];
  onClick?: () => void;
  isDragging?: boolean;
}

export default function TaskCard({ task, projectMembers = [], onClick, isDragging }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id }));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`cursor-grab active:cursor-grabbing bg-white rounded-lg shadow-sm border border-slate-100 p-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 select-none ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <h4 className="font-medium text-slate-900 mb-2 line-clamp-2">
        {task.title}
      </h4>
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <ProjectMemberAvatar
            member={task.assignee}
            projectMembers={projectMembers}
            size="sm"
          />
          <span className="text-sm text-slate-600 truncate">
            {task.assignee.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
          <span>
            {new Date(task.deadline).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
