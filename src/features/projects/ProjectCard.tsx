import { Link } from 'react-router-dom';
import type { Project } from '@/types';
import { MemberAvatar } from '@/components/ui';
import { Calendar, CheckCheck } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

function getProgressTheme(value: number) {
  if (value >= 70) {
    return {
      accent: 'bg-[linear-gradient(90deg,#8BD66A,#6DBE45)]',
      track: 'bg-[#EAF7E2]',
      bar: 'bg-[linear-gradient(90deg,#79CD56,#6DBE45)]',
      percent: 'text-[#4E9D33]',
      statusPill: 'border-[#CDE8BF] bg-[#EFF9E8] text-[#4B9331]',
      statusLabel: 'Healthy',
    };
  }

  if (value >= 40) {
    return {
      accent: 'bg-[linear-gradient(90deg,#E89B78,#D97853)]',
      track: 'bg-[#F5E7DD]',
      bar: 'bg-[linear-gradient(90deg,#E18B66,#D97853)]',
      percent: 'text-[#B76442]',
      statusPill: 'border-[#EFC8B4] bg-[#FDF0E8] text-[#B76442]',
      statusLabel: 'In Progress',
    };
  }

  return {
    accent: 'bg-[linear-gradient(90deg,#4D668D,#274C7D)]',
    track: 'bg-[#E8EEF6]',
    bar: 'bg-[linear-gradient(90deg,#3C5D89,#274C7D)]',
    percent: 'text-[#31527F]',
    statusPill: 'border-[#C9D6E8] bg-[#EDF3FB] text-[#31527F]',
    statusLabel: 'Needs Focus',
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const progress = Math.round(project.progress);
  const theme = getProgressTheme(progress);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-[#E8D8CF] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,249,244,0.72)_100%)] p-5 shadow-[0_18px_30px_-24px_rgba(38,24,16,0.6)] transition-all duration-200 hover:-translate-y-1 hover:border-[#E2CCBE] hover:shadow-[0_22px_36px_-24px_rgba(38,24,16,0.55)]"
    >
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${theme.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-[22px] font-extrabold leading-tight tracking-[-0.018em] text-[#1F1F1F] transition-colors duration-200 group-hover:text-[#163B72]">
          {project.name}
        </h3>
        <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em] ${theme.statusPill}`}>
          {theme.statusLabel}
        </span>
      </div>

      <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed text-[#6B7280]">
        {project.description}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A0816E]">Progress</span>
          <span className={`text-[15px] font-semibold ${theme.percent}`}>{progress}%</span>
        </div>

        <div className={`h-2 rounded-full ${theme.track}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${theme.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#F0E1D8] pt-4">
        <div className="flex -space-x-2.5">
          {project.members.slice(0, 4).map(({ member, isOwner, role }, index) => (
            <div key={member.id} className="rounded-full ring-2 ring-white" title={member.name}>
              <MemberAvatar
                src={member.avatar}
                name={member.name}
                isOwner={isOwner}
                role={role}
                size="sm"
                online={index === 0 || progress >= 70}
              />
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-1.5 text-[14px] text-[#5F6670]">
          <Calendar className="h-4 w-4 text-[#7A8CA5]" strokeWidth={2} />
          <span className="font-medium">
            {new Date(project.deadline).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECD9CC] bg-[#FFF7F1] px-3 py-1.5 text-[13px] font-medium text-[#66594E]">
          <CheckCheck className="h-3.5 w-3.5 text-[#6DBE45]" />
          {project.completedTasks} / {project.totalTasks} tasks
        </span>
      </div>
    </Link>
  );
}
