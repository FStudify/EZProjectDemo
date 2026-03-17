import { Outlet, useLocation, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { AIChatDialog } from '@/features/chat';
import { mockProjects } from '@/mocks';

const routeTitleMap: Record<string, string> = {
  '/': 'Tổng quan',
  '/projects': 'Dự án',
};

function getPageTitle(pathname: string, projectId?: string): string {
  if (projectId) {
    const project = mockProjects.find((p) => p.id === projectId);
    return project?.name ?? 'Dự án';
  }

  const exactMatch = routeTitleMap[pathname];
  if (exactMatch) return exactMatch;

  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  if (projectMatch) {
    const project = mockProjects.find((p) => p.id === projectMatch[1]);
    return project?.name ?? 'Dự án';
  }

  return 'EZProject';
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const title = getPageTitle(pathname, projectId);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[linear-gradient(180deg,#FEFBF8_0%,#F8F1EA_100%)] text-[#1F1F1F]">
        <Sidebar />
        <AIChatDialog />
        <AppMain title={title} />
      </div>
    </SidebarProvider>
  );
}

function AppMain({ title }: { title: string }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ease-in-out ${
        collapsed ? 'ml-[72px]' : 'ml-64'
      }`}
    >
      <Topbar title={title} />
      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.65)_0%,rgba(251,245,239,0.96)_100%)] p-5 lg:p-7">
        <div className="mx-auto w-full max-w-[1420px]">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
