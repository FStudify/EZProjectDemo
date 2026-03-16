import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskComment, Member, ProjectMember } from '@/types';
import { Modal, Button, ProjectMemberAvatar } from '@/components/ui';

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'CLOSED', label: 'Close' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const QUICK_UPDATES = [
  'Completed this part.',
  'In progress...',
  'Facing issues, need support.',
  'Bug fixed.',
  'Reviewing code.',
];

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  members?: Member[];
  projectMembers?: ProjectMember[];
  tasks?: Task[];
  currentUser?: Member;
}

export default function TaskModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  members = [],
  projectMembers = [],
  tasks = [],
  currentUser,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [dependsOnIds, setDependsOnIds] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  const otherTasks = tasks.filter((t) => t.id !== task?.id);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee.id);
      setStartDate(task.createdAt.slice(0, 10));
      setDeadline(task.deadline.slice(0, 10));
      setDependsOnIds(task.dependsOn ?? []);
      setComments(task.comments ?? []);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    const assignee = members.find((m) => m.id === assigneeId) ?? task.assignee;
    const updated: Task = {
      ...task,
      title,
      description,
      status,
      priority,
      assignee,
      createdAt: new Date(startDate).toISOString(),
      deadline: new Date(deadline).toISOString(),
      dependsOn: dependsOnIds.length > 0 ? dependsOnIds : undefined,
      comments,
    };
    onSave?.(updated);
    onClose();
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;
    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      content: newComment.trim(),
      author: currentUser,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, comment]);
    setNewComment('');
    onSave?.({ ...task, comments: [...comments, comment] });
  };

  const handleQuickUpdate = (text: string) => {
    setNewComment(text);
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
  const user = currentUser ?? members[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="lg">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Activity
            {comments.length > 0 && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary">
                {comments.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'details' && (
          <>
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Task description..."
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputClass}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={inputClass}>
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {otherTasks.length > 0 && (
              <div>
                <label className={labelClass}>Depends on</label>
                <p className="mb-1.5 text-xs text-slate-500">
                  Tasks that must be completed before this one
                </p>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1">
                  {otherTasks.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-2 py-1">
                      <input
                        type="checkbox"
                        checked={dependsOnIds.includes(t.id)}
                        onChange={(e) =>
                          setDependsOnIds((prev) =>
                            e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id),
                          )
                        }
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{t.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Assignee</label>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {/* Quick updates */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Quick update</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_UPDATES.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleQuickUpdate(text)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-primary/30 hover:bg-primary-50 hover:text-primary transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {/* Add comment */}
            <div className="flex gap-3">
              <div className="shrink-0"><ProjectMemberAvatar member={user} projectMembers={projectMembers} size="sm" /></div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a message: what you did, progress, issues..."
                  rows={2}
                  className={inputClass}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="mt-2"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Post
                </Button>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                {comments.length} update{comments.length !== 1 ? 's' : ''}
              </p>
              <div className="max-h-48 overflow-y-auto space-y-3">
                {comments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    No updates yet. Share your progress!
                  </div>
                ) : (
                  [...comments].reverse().map((c) => (
                    <div key={c.id} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                      <div className="shrink-0"><ProjectMemberAvatar member={c.author} projectMembers={projectMembers} size="sm" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{c.author.name}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(c.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-700">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between border-t border-slate-200 pt-4">
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              onDelete?.(task);
              onClose();
            }}
          >
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
