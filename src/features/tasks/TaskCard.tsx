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
      className={`cursor-grab active:cursor-grabbing rounded-lg border border-[#E8D8CC] bg-[#FFFDFB] p-3 shadow-sm transition-all duration-200 select-none hover:border-[#DDC9B9] hover:shadow-md ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <h4 className="mb-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">
        {task.title}
      </h4>

      <div className="mb-2 flex items-center gap-2">
        <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <ProjectMemberAvatar
            member={task.assignee}
            projectMembers={projectMembers}
            size="sm"
          />
          <span className="truncate text-[13px] text-[#635648]">
            {task.assignee.name}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-[11px] text-[#867668]">
          <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
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
