import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  TrendingUp,
  Trophy,
  Star,
  Award,
  FolderKanban,
  CheckCircle,
  Calendar,
  ListTodo,
  Search,
} from 'lucide-react';
import { mockPerformance, mockProjects, mockTasks } from '@/mocks';
import type { MemberEvaluation } from '@/types';
import { ProjectMemberAvatar } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import MemberPerformanceCard from './MemberPerformanceCard';

function getScoreVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}

export default function PerformancePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [evaluations, setEvaluations] = useState<Record<string, MemberEvaluation>>({});
  const [memberSearch, setMemberSearch] = useState('');

  const project = projectId ? mockProjects.find((p) => p.id === projectId) : undefined;
  const projectMemberIds = project?.members.map((pm) => pm.member.id) ?? null;

  const performanceList =
    projectMemberIds !== null
      ? mockPerformance.filter((p) => projectMemberIds.includes(p.member.id))
      : mockPerformance;

  const memberSearchLower = memberSearch.trim().toLowerCase();
  const filteredPerformance =
    memberSearchLower === ''
      ? performanceList
      : performanceList.filter(
          (p) =>
            p.member.name.toLowerCase().includes(memberSearchLower) ||
            p.member.email.toLowerCase().includes(memberSearchLower),
        );

  const sortedByScore = [...performanceList].sort((a, b) => b.score - a.score);

  const teamScore =
    performanceList.length > 0
      ? Math.round(
          performanceList.reduce((sum, p) => sum + p.score, 0) / performanceList.length
        )
      : 0;

  const totalContributions = performanceList.reduce(
    (sum, p) => sum + p.contributions.reduce((s, c) => s + c.count, 0),
    0
  );

  const topPerformer = sortedByScore[0];

  // Real task stats from mockTasks for this project
  const projectTasks = projectId ? mockTasks.filter((t) => t.projectId === projectId) : [];
  const tasksDone = projectTasks.filter((t) => t.status === 'DONE').length;
  const tasksInProgress = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const tasksTodo = projectTasks.filter((t) => t.status === 'TODO' || t.status === 'ON_HOLD').length;
  const totalTasks = projectTasks.length;
  const progressPct = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;

  const handleSaveEvaluation = (memberId: string, rating: number, feedback: string) => {
    setEvaluations((prev) => ({
      ...prev,
      [memberId]: {
        memberId,
        rating,
        feedback,
        evaluatedAt: new Date().toISOString(),
      },
    }));
  };

  const rankColors: Record<number, string> = {
    1: 'text-amber-600',
    2: 'text-slate-500',
    3: 'text-amber-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
        </div>
        <p className="mt-1 text-slate-600">
          Project progress overview, member evaluation and feedback.
        </p>
      </header>

      {/* Project Overview */}
      {project && (
        <section className="rounded-xl border-2 border-primary/20 bg-primary-50/30 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FolderKanban className="h-5 w-5 text-primary" />
            Project Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={progressPct} size="md" showLabel />
              </div>
              <p className="mt-1 text-xs text-slate-500">{progressPct}% completed</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <ListTodo className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Tasks</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {tasksDone} / {totalTasks}
              </p>
              <p className="text-xs text-slate-500">
                {tasksInProgress} in progress • {tasksTodo} remaining
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">Deadline</span>
              </div>
              <p className="mt-2 font-semibold text-slate-900">
                {new Date(project.deadline).toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">Members</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{project.members.length}</p>
              <p className="text-xs text-slate-500">in team</p>
            </div>
          </div>
        </section>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Award className="h-5 w-5" />
            <span className="text-sm font-medium">Team Score</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{teamScore}</p>
          <div className="mt-3">
            <ProgressBar value={teamScore} size="md" showLabel />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Star className="h-5 w-5" />
            <span className="text-sm font-medium">Total Contributions</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalContributions}</p>
          <p className="mt-1 text-sm text-slate-500">Across all members</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-600">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-medium">Top Performer</span>
          </div>
          {topPerformer ? (
            <div className="mt-3 flex items-center gap-3">
              <ProjectMemberAvatar member={topPerformer.member} projectMembers={project?.members ?? []} size="lg" />
              <div>
                <p className="font-semibold text-slate-900">{topPerformer.member.name}</p>
                <Badge variant={getScoreVariant(topPerformer.score)}>{topPerformer.score}</Badge>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-slate-500">No data yet</p>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Leaderboard</h2>
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {sortedByScore.map((p, index) => {
            const rank = index + 1;
            const totalTasksMember = p.tasksCompleted + p.tasksInProgress + p.tasksTodo;
            const completedPct = totalTasksMember > 0 ? (p.tasksCompleted / totalTasksMember) * 100 : 0;
            const inProgressPct = totalTasksMember > 0 ? (p.tasksInProgress / totalTasksMember) * 100 : 0;
            const todoPct = totalTasksMember > 0 ? (p.tasksTodo / totalTasksMember) * 100 : 0;

            return (
              <li key={p.member.id} className="flex items-center gap-4 px-6 py-4">
                <span
                  className={`w-8 shrink-0 text-center font-bold ${rankColors[rank] ?? 'text-slate-600'}`}
                >
                  {rank}
                </span>
                <ProjectMemberAvatar member={p.member} projectMembers={project?.members ?? []} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{p.member.name}</p>
                  <div className="mt-1 flex h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${completedPct}%` }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${inProgressPct}%` }}
                    />
                    <div
                      className="bg-slate-300"
                      style={{ width: `${todoPct}%` }}
                    />
                  </div>
                </div>
                <Badge variant={getScoreVariant(p.score)}>{p.score}</Badge>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Member performance cards with evaluation */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Details & Member Evaluation
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          View contribution stats and leave evaluation, feedback for each member.
        </p>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="Search members by name or email..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div
          className={
            filteredPerformance.length >= 3
              ? 'grid gap-6 lg:grid-cols-2 max-h-[70vh] overflow-y-auto pr-2 scroll-smooth'
              : 'grid gap-6 lg:grid-cols-2'
          }
        >
          {filteredPerformance.map((p) => (
            <MemberPerformanceCard
              key={p.member.id}
              performance={p}
              evaluation={evaluations[p.member.id]}
              onSaveEvaluation={handleSaveEvaluation}
              projectMembers={project?.members ?? []}
            />
          ))}
        </div>
        {filteredPerformance.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No members match your search.
          </p>
        )}
      </section>
    </div>
  );
}
