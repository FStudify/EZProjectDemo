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
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[#FFF5EC] text-[#8B4A2F] shadow-[0_16px_24px_-18px_rgba(45,18,4,0.55)]'
        : 'text-[#FFF8F2] hover:bg-white/18 hover:text-white'
    }`;

  const navLinkCollapsed = (isActive: boolean) =>
    `group flex items-center justify-center rounded-xl p-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[#FFF5EC] text-[#8B4A2F] shadow-[0_16px_24px_-18px_rgba(45,18,4,0.55)]'
        : 'text-[#FFF8F2] hover:bg-white/18 hover:text-white'
    }`;

  const subNavLinkBase = (isActive: boolean) =>
    `flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'border-[#F7D9C5] bg-[#FFF7F0] text-[#8B4A2F] shadow-[0_12px_20px_-18px_rgba(45,18,4,0.52)]'
        : 'border-transparent text-[#FCEDE1] hover:border-white/20 hover:bg-white/14 hover:text-[#FFFDFB]'
    }`;

  const subNavLinkCollapsed = (isActive: boolean) =>
    `flex items-center justify-center rounded-lg border p-2 text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'border-[#F7D9C5] bg-[#FFF7F0] text-[#8B4A2F]'
        : 'border-transparent text-[#FCEDE1] hover:border-white/20 hover:bg-white/14 hover:text-[#FFFDFB]'
    }`;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[#BA724B] bg-[linear-gradient(180deg,#C8774D_0%,#B86843_34%,#A75C3A_100%)] text-[#FFF8F2] shadow-[0_16px_34px_-20px_rgba(59,27,13,0.68)] transition-all duration-200 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo / Toggle */}
      <div
        className={`flex h-[72px] shrink-0 items-center border-b border-white/18 ${
          collapsed ? 'justify-center px-0' : 'gap-3 px-4'
        }`}
      >
        {!collapsed && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E4] text-[#B6653F] shadow-[0_14px_24px_-18px_rgba(31,12,3,0.7)]">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
        )}
        {collapsed ? (
          <span title="EZProject">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1E4] text-[#B6653F] shadow-[0_14px_24px_-18px_rgba(31,12,3,0.7)]">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
          </span>
        ) : (
          <span className="text-[28px] font-extrabold tracking-[-0.02em] text-[#FFFDF9]">EZProject</span>
        )}
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={toggle}
        className="absolute -right-3 top-[72px] z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6C8B5] bg-[#FFF8F2] text-[#9A5E3D] shadow-[0_10px_18px_-14px_rgba(68,34,18,0.56)] transition-colors hover:bg-[#FFF1E7] hover:text-[#6D3B24]"
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
      <nav className="flex-1 overflow-y-auto px-3 pb-3 pt-4">
        <div className="space-y-1.5">
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
            <div
              className={
                collapsed ? 'mt-1.5 space-y-1' : 'ml-4 mt-1.5 space-y-1 border-l border-white/16 pl-3'
              }
            >
              {projectSubNav.map(({ suffix, icon: Icon, label }) => {
                if (!hasProject) {
                  return (
                    <div
                      key={suffix || 'overview'}
                      className={
                        collapsed
                          ? 'flex justify-center rounded-lg p-2 text-[#D7B8A5]/75'
                          : 'flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#D7B8A5]/75'
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
        <div className={`mt-6 border-t border-white/18 pt-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="flex items-center justify-center rounded-lg p-2 text-[#F9EADF]" title="AI Chat">
              <Bot className="h-4 w-4 shrink-0" aria-hidden />
            </div>
          ) : (
            <>
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#F8E4D6]/88">
                Tools
              </p>
              <p className="flex items-center gap-3 rounded-lg bg-white/11 px-4 py-2 text-sm text-[#FFF5ED]">
                <Bot className="h-4 w-4 shrink-0" aria-hidden />
                AI Chat (bottom-right)
              </p>
            </>
          )}
        </div>
      </nav>

      {/* User info */}
      <div className="border-t border-white/18 px-3 py-4">
        <div
          className={`flex items-center gap-3 px-2 py-1 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Avatar name={user?.displayName ?? 'User'} size="sm" />
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-[#FFFDF9]">
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
