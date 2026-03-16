import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { ProgressBar, MemberAvatar } from '@/components/ui';
import { Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 overflow-hidden"
    >
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {project.name}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {project.description}
        </p>
        <ProgressBar value={project.progress} size="sm" showLabel />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex -space-x-2">
            {project.members.slice(0, 4).map(({ member, isOwner, role }) => (
              <div
                key={member.id}
                className="ring-2 ring-white rounded-full"
                title={member.name}
              >
                <MemberAvatar
                  src={member.avatar}
                  name={member.name}
                  isOwner={isOwner}
                  role={role}
                  size="sm"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" strokeWidth={2} />
            <span>
              {new Date(project.deadline).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {project.completedTasks} / {project.totalTasks} tasks
        </p>
      </div>
    </Link>
  );
}
