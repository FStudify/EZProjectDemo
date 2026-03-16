import { mockProjects } from '@/mocks';
import { Button } from '@/components/ui';
import ProjectCard from './ProjectCard';
import { BarChart3, CheckCircle2, Clock3, Plus } from 'lucide-react';

const avgProgress = Math.round(
  mockProjects.reduce((sum, project) => sum + project.progress, 0) / Math.max(mockProjects.length, 1),
);

const healthyProjects = mockProjects.filter((project) => project.progress >= 70).length;

const dueSoonProjects = mockProjects.filter((project) => {
  const now = Date.now();
  const deadline = new Date(project.deadline).getTime();
  const inTwoWeeks = now + 14 * 24 * 60 * 60 * 1000;
  return deadline >= now && deadline <= inTwoWeeks;
}).length;

export default function ProjectListPage() {
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[38px] font-extrabold tracking-[-0.03em] text-[#1F1F1F]">Projects</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Manage priorities, track progress, and keep every team aligned.</p>
        </div>

        <Button
          variant="primary"
          size="md"
          className="inline-flex items-center gap-2 rounded-xl !bg-[#D97853] px-5 py-2.5 text-[16px] font-semibold text-white shadow-[0_16px_26px_-18px_rgba(217,120,83,0.9)] hover:!bg-[#C96B48]"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#E8D8CF] bg-white/85 p-4 shadow-[0_12px_24px_-22px_rgba(36,24,16,0.65)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EAE2] text-[#D97853]">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.11em] text-[#9A8576]">Average Progress</p>
              <p className="text-xl font-bold text-[#1F1F1F]">{avgProgress}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8D8CF] bg-white/85 p-4 shadow-[0_12px_24px_-22px_rgba(36,24,16,0.65)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF8E8] text-[#6DBE45]">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.11em] text-[#9A8576]">Healthy Projects</p>
              <p className="text-xl font-bold text-[#1F1F1F]">{healthyProjects}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8D8CF] bg-white/85 p-4 shadow-[0_12px_24px_-22px_rgba(36,24,16,0.65)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FB] text-[#274C7D]">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.11em] text-[#9A8576]">Due In 14 Days</p>
              <p className="text-xl font-bold text-[#1F1F1F]">{dueSoonProjects}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
