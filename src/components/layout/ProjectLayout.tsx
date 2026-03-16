import { Outlet, NavLink } from 'react-router-dom';
import { Info, CheckSquare, FileText, Video, Users, MessageCircle, TrendingUp } from 'lucide-react';

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
  return (
    <div className="flex flex-col">
      {/* Tab navigation */}
      <nav className="mb-3 border-b border-[#E8D8CF]">
        <ul className="flex flex-wrap gap-1.5">
          {projectTabs.map(({ to, icon: Icon, label }) => (
            <li key={to || 'overview'}>
              <NavLink
                to={to}
                end={to === '' || to === 'tasks'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-t-xl border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-[#D97853] bg-[#FFF3EC] text-[#B86442]'
                      : 'border-transparent text-[#7A7067] hover:border-[#E8D8CF] hover:bg-[#FFF9F4] hover:text-[#1F1F1F]'
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
