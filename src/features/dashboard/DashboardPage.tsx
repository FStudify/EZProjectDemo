import { FolderKanban, ListTodo, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { mockProjects, mockTasks } from '@/mocks';
import ProjectCard from '@/features/projects/ProjectCard';
import type { Project } from '@/types';

const completedCount = mockTasks.filter((t) => t.status === 'DONE').length;

// Current user (mock - Alice Nguyen)
const currentUserId = 'mem-1';

function getDeadlineNotifications() {
  const userProjectIds = mockProjects
    .filter((p) => p.members.some((pm) => pm.member.id === currentUserId))
    .map((p) => p.id);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfDay3 = startOfToday.getTime() + 4 * 24 * 60 * 60 * 1000 - 1;

  const myTasks = mockTasks.filter(
    (t) =>
      userProjectIds.includes(t.projectId) &&
      t.assignee.id === currentUserId &&
      t.status !== 'DONE' &&
      t.status !== 'CANCELLED'
  );

  const overdue = myTasks
    .filter((t) => new Date(t.deadline).getTime() < now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const dueSoon = myTasks
    .filter((t) => {
      const d = new Date(t.deadline).getTime();
      return d >= now && d <= endOfDay3;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return { overdue, dueSoon };
}

function TaskRow({
  task,
  project,
  dueStr,
}: {
  task: { title: string };
  project: { name: string } | undefined;
  dueStr: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
      <td className="py-2.5 px-3 text-sm text-slate-700">{project?.name ?? '-'}</td>
      <td className="py-2.5 px-3 text-sm font-medium text-slate-900">{task.title}</td>
      <td className="py-2.5 px-3 text-sm text-slate-600">{dueStr}</td>
    </tr>
  );
}

export default function DashboardPage() {
  const { overdue, dueSoon } = getDeadlineNotifications();
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary-50 text-primary">
              <FolderKanban className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {mockProjects.length}
              </p>
              <p className="text-sm text-slate-600">Dự án đang hoạt động</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
              <ListTodo className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {mockTasks.length}
              </p>
              <p className="text-sm text-slate-600">Tổng công việc</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {completedCount}
              </p>
              <p className="text-sm text-slate-600">Công việc đã hoàn thành</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects - 2/3 */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Dự án gần đây
          </h2>
          <div className="space-y-4">
            {mockProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Deadline Notifications - 2 balanced windows */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Overdue tasks */}
          <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <h2 className="text-base font-semibold text-slate-900 px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Quá hạn
            </h2>
            <div className="flex-1 min-h-0 overflow-auto">
              {overdue.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Không có công việc quá hạn.
                </div>
              ) : (
                <table className="w-full text-left min-w-[200px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Dự án
                      </th>
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Công việc
                      </th>
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Hạn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdue.map((task) => {
                      const project = mockProjects.find((p) => p.id === task.projectId);
                      const dueStr = new Date(task.deadline).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                      return (
                        <TaskRow key={task.id} task={task} project={project} dueStr={dueStr} />
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Due soon (within 3 days) */}
          <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <h2 className="text-base font-semibold text-slate-900 px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0">
              <Clock className="h-4 w-4 text-amber-500" />
              Đến hạn trong 3 ngày
            </h2>
            <div className="flex-1 min-h-0 overflow-auto">
              {dueSoon.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Không có công việc sắp đến hạn.
                </div>
              ) : (
                <table className="w-full text-left min-w-[200px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Dự án
                      </th>
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Công việc
                      </th>
                      <th className="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Hạn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dueSoon.map((task) => {
                      const project = mockProjects.find((p) => p.id === task.projectId);
                      const dueStr = new Date(task.deadline).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                      return (
                        <TaskRow key={task.id} task={task} project={project} dueStr={dueStr} />
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
