import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { ProjectLayout } from '@/components/layout';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ProjectListPage from '@/features/projects/ProjectListPage';
import ProjectOverview from '@/features/projects/ProjectOverview';
import TaskBoard from '@/features/tasks/TaskBoard';
import DocumentList from '@/features/documents/DocumentList';
import MemberList from '@/features/members/MemberList';
import MeetingList from '@/features/meetings/MeetingList';
import { ChatPage } from '@/features/chat';
import { PerformancePage } from '@/features/performance';
import { AuthProvider, ProtectedRoute, GuestRoute, LoginPage, RegisterPage } from '@/features/auth';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectListPage /> },
      {
        path: 'projects/:projectId',
        element: <ProjectLayout />,
        children: [
          { index: true, element: <ProjectOverview /> },
          { path: 'tasks', element: <TaskBoard /> },
          { path: 'meetings', element: <MeetingList /> },
          { path: 'documents', element: <DocumentList /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'members', element: <MemberList /> },
          { path: 'performance', element: <PerformancePage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
