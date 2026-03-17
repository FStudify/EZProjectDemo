import { useParams } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import { projectService } from '@/services';
import { ProgressBar, MemberAvatar } from '@/components/ui';
import { getRoleLabel } from '@/components/ui/RoleIcons';

export default function ProjectOverview() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? projectService.getById(projectId) : null;

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600">Không tìm thấy dự án.</p>
      </div>
    );
  }

  const remainingTasks = project.totalTasks - project.completedTasks;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {project.name}
        </h1>
        <p className="text-slate-600 mb-6">{project.description}</p>
        <ProgressBar value={project.progress} size="md" showLabel />
      </div>

      {/* Stats and details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Task stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            Tiến độ công việc
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng</span>
              <span className="font-semibold text-slate-900">
                {project.totalTasks}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Đã hoàn thành</span>
              <span className="font-semibold text-emerald-600">
                {project.completedTasks}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Còn lại</span>
              <span className="font-semibold text-amber-600">
                {remainingTasks}
              </span>
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
            Hạn chót
          </h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
              <Calendar className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="text-slate-900 font-medium">
              {new Date(project.deadline).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" strokeWidth={2} />
            Thành viên
          </h3>
          <div className="space-y-3">
            {project.members.map(({ member, role, isOwner }) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <MemberAvatar
                  src={member.avatar}
                  name={member.name}
                  isOwner={isOwner}
                  role={role}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{member.email}</p>
                </div>
                <span className="text-xs text-slate-600 shrink-0">
                  {getRoleLabel(role, isOwner)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
