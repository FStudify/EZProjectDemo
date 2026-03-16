import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Info, CheckSquare, FileText, Video, Users, MessageCircle, TrendingUp } from 'lucide-react';
import { mockProjects } from '@/mocks';

const projectTabs = [
  { to: '', icon: Info, label: 'Overview' },
  { to: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { to: 'meetings', icon: Video, label: 'Meetings' },
  { to: 'documents', icon: FileText, label: 'Documents' },
  { to: 'chat', icon: MessageCircle, label: 'Group Chat' },
  { to: 'members', icon: Users, label: 'Members' },
  { to: 'performance', icon: TrendingUp, label: 'Performance' },
] as const;

export default function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId
    ? mockProjects.find((p) => p.id === projectId)
    : undefined;

  return (
    <div className="flex flex-col">
      {/* Project name */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">
          {project?.name ?? 'Project'}
        </h2>
      </div>

      {/* Tab navigation */}
      <nav className="mb-6 border-b border-border">
        <ul className="flex gap-1">
          {projectTabs.map(({ to, icon: Icon, label }) => (
            <li key={to || 'overview'}>
              <NavLink
                to={to}
                end={to === '' || to === 'tasks'}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Tab content */}
      <Outlet />
    </div>
  );
}
