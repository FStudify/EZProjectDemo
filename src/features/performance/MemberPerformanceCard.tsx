import { useState, useEffect } from 'react';
import type { MemberPerformance, MemberEvaluation } from '@/types';
import { ProjectMemberAvatar } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import ContributionGraph from './ContributionGraph';
import { CheckCircle, Clock, FileUp, MessageSquare } from 'lucide-react';

function getScoreVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}

interface MemberPerformanceCardProps {
  performance: MemberPerformance;
  evaluation?: MemberEvaluation | null;
  onSaveEvaluation?: (memberId: string, rating: number, feedback: string) => void;
  projectMembers?: import('@/types').ProjectMember[];
}

export default function MemberPerformanceCard({
  performance,
  evaluation,
  onSaveEvaluation,
  projectMembers = [],
}: MemberPerformanceCardProps) {
  const [rating, setRating] = useState(evaluation?.rating ?? 0);
  const [feedback, setFeedback] = useState(evaluation?.feedback ?? '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setRating(evaluation?.rating ?? 0);
    setFeedback(evaluation?.feedback ?? '');
  }, [evaluation]);
  const { member, tasksCompleted, tasksInProgress, documentsUploaded, commentsCount, contributions, score } =
    performance;
  const scoreVariant = getScoreVariant(score);
  const scoreOverTen = (score / 10).toFixed(1);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Top section: Avatar + name + email + score */}
      <div className="mb-6 flex items-start gap-4 border-b border-slate-200 pb-5">
        <ProjectMemberAvatar member={member} projectMembers={projectMembers} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold leading-tight text-slate-900">{member.name}</h3>
              <p className="truncate text-sm text-slate-600">{member.email}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Performance</p>
              <p className="text-lg font-bold leading-tight text-slate-900">{score}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={scoreVariant}>Score: {score}</Badge>
            <span className="text-xs font-medium text-slate-500">({scoreOverTen}/10)</span>
          </div>
        </div>
      </div>

      {/* Stats grid 2x2 */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Tasks Completed</p>
              <p className="text-2xl font-bold leading-tight text-slate-900">{tasksCompleted}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">In Progress</p>
              <p className="text-2xl font-bold leading-tight text-slate-900">{tasksInProgress}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <FileUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Docs Uploaded</p>
              <p className="text-2xl font-bold leading-tight text-slate-900">{documentsUploaded}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary-100 bg-primary-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">Comments</p>
              <p className="text-2xl font-bold leading-tight text-slate-900">{commentsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution graph */}
      <ContributionGraph contributions={contributions} />

      {/* Evaluation / Feedback */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-800">Evaluation & Feedback</h4>
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-600">Score (0-10)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={10}
                step={0.01}
                value={rating || ''}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setRating(Number.isNaN(v) ? 0 : Math.min(10, Math.max(0, v)));
                  setIsEditing(true);
                }}
                placeholder="0.00"
                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-sm text-slate-500">/ 10</span>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-600">Feedback</p>
            <textarea
              value={feedback}
              onChange={(e) => { setFeedback(e.target.value); setIsEditing(true); }}
              placeholder="Feedback on contributions, strengths, areas to improve..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {onSaveEvaluation && isEditing && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onSaveEvaluation(member.id, Number(rating.toFixed(2)), feedback);
                setIsEditing(false);
              }}
            >
              Save evaluation
            </Button>
          )}
          {evaluation && !isEditing && (
            <div className="space-y-2">
              {evaluation.rating > 0 && (
                <p className="text-sm font-medium text-slate-700">
                  Score: {evaluation.rating.toFixed(2)}/10
                </p>
              )}
              {evaluation.feedback && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 italic">
                  &ldquo;{evaluation.feedback}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
