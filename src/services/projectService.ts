import { mockProjects, mockTasks, mockDocuments, mockActivities } from '@/mocks';

export const projectService = {
  getAll: () => mockProjects,
  getById: (id: string) => mockProjects.find((p) => p.id === id),
  getTasks: (projectId: string) =>
    mockTasks.filter((t) => t.projectId === projectId),
  getDocuments: (projectId: string) =>
    mockDocuments.filter((d) => d.projectId === projectId),
  getActivities: (projectId?: string) =>
    projectId
      ? mockActivities.filter((a) => a.projectId === projectId)
      : mockActivities,
};
