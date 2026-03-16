import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import {
  GraduationCap,
  LayoutDashboard,
  FolderKanban,
  Bot,
  Info,
  CheckSquare,
  FileText,
  Video,
  MessageCircle,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useSidebar } from './SidebarContext';

const projectSubNav = [
  { suffix: '', icon: Info, label: 'Overview' },
  { suffix: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { suffix: '/meetings', icon: Video, label: 'Meetings' },
  { suffix: '/documents', icon: FileText, label: 'Documents' },
  { suffix: '/chat', icon: MessageCircle, label: 'Group Chat' },
  { suffix: '/members', icon: Users, label: 'Members' },
  { suffix: '/performance', icon: TrendingUp, label: 'Performance' },
] as const;

export default function Sidebar() {
  const { pathname } = useLocation();
  const { collapsed, toggle } = useSidebar();
  const { user } = useAuth();

  const isInProjects = pathname.startsWith('/projects');
  const activeProjectId = extractProjectId(pathname);
  const hasProject = !!activeProjectId;
  const basePath = hasProject ? `/projects/${activeProjectId}` : '';

  const navLinkBase = (isActive: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-primary/20 text-primary-light' : 'text-white/90 hover:bg-sidebar-hover'
    }`;

  const navLinkCollapsed = (isActive: boolean) =>
    `flex items-center justify-center rounded-lg p-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-primary/20 text-primary-light' : 'text-white/90 hover:bg-sidebar-hover'
    }`;

  const subNavLinkBase = (isActive: boolean) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:bg-sidebar-hover ${
      isActive ? 'bg-primary/20 text-primary-light' : 'text-white/70 hover:text-white'
    }`;

  const subNavLinkCollapsed = (isActive: boolean) =>
    `flex items-center justify-center rounded-lg p-2 text-[13px] font-medium transition-colors hover:bg-sidebar-hover ${
      isActive ? 'bg-primary/20 text-primary-light' : 'text-white/70 hover:text-white'
    }`;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full flex-col bg-sidebar text-white transition-all duration-200 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo / Toggle */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-white/10 ${
          collapsed ? 'justify-center px-0' : 'gap-3 px-4'
        }`}
      >
        {!collapsed && <GraduationCap className="h-8 w-8 shrink-0 text-primary-light" aria-hidden />}
        {collapsed ? (
          <span title="EZProject">
            <GraduationCap className="h-8 w-8 text-primary-light" aria-hidden />
          </span>
        ) : (
          <span className="text-xl font-bold tracking-tight">EZProject</span>
        )}
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={toggle}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-slate-50 hover:text-slate-900"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              collapsed ? navLinkCollapsed(isActive) : navLinkBase(isActive)
            }
            title="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden />
            {!collapsed && 'Dashboard'}
          </NavLink>

          {/* Projects */}
          <NavLink
            to="/projects"
            end
            className={({ isActive }) =>
              collapsed ? navLinkCollapsed(isActive) : navLinkBase(isActive)
            }
            title="Projects"
          >
            <FolderKanban className="h-5 w-5 shrink-0" aria-hidden />
            {!collapsed && (
              <>
                Projects
                <ChevronDown
                  className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                    isInProjects ? 'rotate-0' : '-rotate-90'
                  }`}
                  aria-hidden
                />
              </>
            )}
          </NavLink>

          {/* Sub-nav */}
          {isInProjects && (
            <div className={collapsed ? 'mt-1 space-y-0.5' : 'ml-4 space-y-0.5 border-l border-white/10 pl-3'}>
              {projectSubNav.map(({ suffix, icon: Icon, label }) => {
                if (!hasProject) {
                  return (
                    <div
                      key={suffix || 'overview'}
                      className={
                        collapsed
                          ? 'flex justify-center rounded-lg p-2 text-white/20'
                          : 'flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/20'
                      }
                      title="Select a project first"
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {!collapsed && label}
                    </div>
                  );
                }

                const fullPath = `${basePath}${suffix}`;
                return (
                  <NavLink
                    key={suffix || 'overview'}
                    to={fullPath}
                    end
                    className={({ isActive }) =>
                      collapsed ? subNavLinkCollapsed(isActive) : subNavLinkBase(isActive)
                    }
                    title={label}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {!collapsed && label}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* Tools */}
        <div className={`mt-6 border-t border-white/10 pt-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="flex items-center justify-center rounded-lg p-2 text-white/50" title="AI Chat">
              <Bot className="h-4 w-4 shrink-0" aria-hidden />
            </div>
          ) : (
            <>
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Tools
              </p>
              <p className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-white/50">
                <Bot className="h-4 w-4 shrink-0" aria-hidden />
                AI Chat (bottom-right)
              </p>
            </>
          )}
        </div>
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 p-3">
        <div
          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Avatar name={user?.displayName ?? 'User'} size="sm" />
          {!collapsed && (
            <span className="truncate text-sm font-medium text-white/95">
              {user?.displayName ?? user?.username ?? 'User'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

function extractProjectId(pathname: string): string | undefined {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1];
}
