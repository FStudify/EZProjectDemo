import { mockProjects } from '@/mocks';
import { Button } from '@/components/ui';
import ProjectCard from './ProjectCard';
import { Plus } from 'lucide-react';

export default function ProjectListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <Button variant="primary" size="md" className="inline-flex items-center gap-2">
          <Plus className="w-5 h-5" strokeWidth={2} />
          New Project
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
