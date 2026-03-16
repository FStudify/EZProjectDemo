import { useMemo, useState } from 'react';
import { Check, MessageSquare, Send } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskComment, Member, ProjectMember } from '@/types';
import { Modal, Button, ProjectMemberAvatar } from '@/components/ui';
import { DatePickerField, PolishedSelect } from './TaskFormControls';

type ModalSelectOption = {
  value: string;
  label: string;
  tone?: 'accent' | 'positive' | 'muted';
};

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'TODO', label: 'To Do', tone: 'muted' },
  { value: 'IN_PROGRESS', label: 'In Progress', tone: 'accent' },
  { value: 'DONE', label: 'Done', tone: 'positive' },
  { value: 'CLOSED', label: 'Close', tone: 'muted' },
  // { value: 'CANCELLED', label: 'Cancelled', tone: 'muted' },
];

const PRIORITY_OPTIONS: ModalSelectOption[] = [
  { value: 'HIGH', label: 'High', tone: 'accent' },
  { value: 'MEDIUM', label: 'Medium', tone: 'muted' },
  { value: 'LOW', label: 'Low', tone: 'positive' },
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

interface TaskModalContentProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  members?: Member[];
  projectMembers?: ProjectMember[];
  tasks?: Task[];
  currentUser?: Member;
}

export default function TaskModal({ task, ...props }: TaskModalProps) {
  if (!task) return null;
  return <TaskModalContent key={task.id} task={task} {...props} />;
}

function TaskModalContent({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  members = [],
  projectMembers = [],
  tasks = [],
  currentUser,
}: TaskModalContentProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee.id);
  const [startDate, setStartDate] = useState(task.createdAt.slice(0, 10));
  const [deadline, setDeadline] = useState(task.deadline.slice(0, 10));
  const [dependsOnIds, setDependsOnIds] = useState<string[]>(task.dependsOn ?? []);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>(task.comments ?? []);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  const otherTasks = tasks.filter((item) => item.id !== task.id);
  const assigneeOptions = useMemo<ModalSelectOption[]>(
    () => members.map((member) => ({ value: member.id, label: member.name, tone: 'muted' })),
    [members],
  );
  const shouldScrollDependencies = otherTasks.length > 3;
  const commenter = currentUser ?? members[0] ?? task.assignee;

  const handleSave = () => {
    const assignee = members.find((member) => member.id === assigneeId) ?? task.assignee;
    const safeStartDate = startDate || task.createdAt.slice(0, 10);
    const safeDeadline = deadline || task.deadline.slice(0, 10);

    const updated: Task = {
      ...task,
      title,
      description,
      status,
      priority,
      assignee,
      createdAt: new Date(safeStartDate).toISOString(),
      deadline: new Date(safeDeadline).toISOString(),
      dependsOn: dependsOnIds.length > 0 ? dependsOnIds : undefined,
      comments,
    };

    onSave?.(updated);
    onClose();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      content: newComment.trim(),
      author: commenter,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, comment]);
    setNewComment('');
    onSave?.({ ...task, comments: [...comments, comment] });
  };

  const handleQuickUpdate = (text: string) => {
    setNewComment(text);
  };

  const toggleDependency = (taskId: string) => {
    setDependsOnIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const inputClass =
    'w-full rounded-lg border border-[#E7D8CE] bg-white/84 px-3 py-2 text-[14px] text-[#1F1F1F] placeholder:text-[#9C8E83] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-150 hover:border-[#DEC8B8] focus:border-[#D97853] focus:outline-none focus:ring-2 focus:ring-[#D97853]/18';
  const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7B685A]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      size="xl"
      bodyScrollable={false}
      panelOverflow="visible"
      panelClassName="max-w-[760px] rounded-[20px] border border-[#E7D8CE] bg-[#FCF8F5] shadow-[0_24px_54px_-36px_rgba(53,31,20,0.6)]"
      headerClassName="border-b border-[#E9DCD2] bg-[linear-gradient(180deg,#FFF7F1_0%,#FCF8F5_100%)] px-4 py-2.5"
      titleClassName="text-[19px] font-semibold tracking-[-0.008em] text-[#1F1F1F]"
      closeButtonClassName="text-[#8A7A6D] hover:bg-[#F6E9E0] hover:text-[#1F1F1F] focus:ring-[#D97853]/35"
      bodyClassName="bg-[#FCF8F5] px-4 py-3 text-[#6B7280]"
      backdropClassName="bg-[#1F1F1F]/42"
    >
      <div className="mx-auto flex h-full w-full max-w-[700px] flex-col text-[#1F1F1F]">
        <div className="mb-2 flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-[#E5D7CC] bg-[#F7F1EC] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-[#FFF2E8] text-[#B86442]'
                  : 'text-[#77695F] hover:text-[#3A332D]'
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-[#FFF2E8] text-[#B86442]'
                  : 'text-[#77695F] hover:text-[#3A332D]'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Activity
            </button>
          </div>

          {activeTab === 'activity' && comments.length > 0 && (
            <span className="rounded-full border border-[#EDD4C5] bg-[#FFF4EC] px-2 py-0.5 text-[11px] font-medium text-[#A76749]">
              {comments.length} updates
            </span>
          )}
        </div>

        {activeTab === 'details' && (
          <div className="space-y-2">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`${inputClass} h-9`}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Task description..."
                className={`${inputClass} min-h-[62px] resize-none`}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <PolishedSelect
                label="Status"
                value={status}
                onChange={(nextStatus) => setStatus(nextStatus as TaskStatus)}
                options={STATUS_OPTIONS}
                size="compact"
              />
              <PolishedSelect
                label="Priority"
                value={priority}
                onChange={(nextPriority) => setPriority(nextPriority as TaskPriority)}
                options={PRIORITY_OPTIONS}
                size="compact"
              />
            </div>

            {otherTasks.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={labelClass}>Depends on</label>
                  <span className="rounded-full border border-[#E8D8CE] bg-white px-2 py-0.5 text-[11px] font-medium text-[#8B7B70]">
                    {dependsOnIds.length} selected
                  </span>
                </div>

                <div
                  className={`ez-task-scrollbar rounded-xl border border-[#E7D8CE] bg-[#F7F1EC] ${
                    shouldScrollDependencies ? 'max-h-20 overflow-y-auto' : 'overflow-hidden'
                  }`}
                >
                  <div className="divide-y divide-[#EDE0D6]">
                    {otherTasks.map((taskItem) => {
                      const isSelected = dependsOnIds.includes(taskItem.id);
                      return (
                        <button
                          key={taskItem.id}
                          type="button"
                          onClick={() => toggleDependency(taskItem.id)}
                          className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors ${
                            isSelected ? 'bg-[#FFF0E6]' : 'hover:bg-[#FBF5F0]'
                          }`}
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors ${
                              isSelected
                                ? 'border-[#D97853] bg-[#D97853] text-white'
                                : 'border-[#DDBFAE] bg-white text-transparent'
                            }`}
                            aria-hidden
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate text-[13px] text-[#4B4038]">{taskItem.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-3">
              <PolishedSelect
                label="Assignee"
                value={assigneeId}
                onChange={setAssigneeId}
                options={assigneeOptions}
                placeholder="Select member"
                size="compact"
              />
              <DatePickerField
                label="Start date"
                value={startDate}
                onChange={setStartDate}
                size="compact"
              />
              <DatePickerField
                label="Deadline"
                value={deadline}
                onChange={setDeadline}
                min={startDate || undefined}
                size="compact"
              />
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-2">
            <div>
              <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.07em] text-[#7B685A]">Quick update</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_UPDATES.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleQuickUpdate(text)}
                    className="rounded-full border border-[#E5D5CA] bg-white px-3 py-1.5 text-xs text-[#675A50] transition-colors hover:border-[#E7BFA9] hover:bg-[#FFF1E8] hover:text-[#B86442]"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <ProjectMemberAvatar member={commenter} projectMembers={projectMembers} size="sm" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a message: what you did, progress, issues..."
                  rows={2}
                  className={`${inputClass} min-h-[64px] resize-none`}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="!rounded-xl !bg-[#D97853] hover:!bg-[#C96B48]"
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Post
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#E7D8CE] bg-[#F7F1EC]/75 p-2">
              <p className="mb-1.5 text-sm font-medium text-[#4A4039]">
                {comments.length} update{comments.length !== 1 ? 's' : ''}
              </p>

              <div className={`ez-task-scrollbar space-y-1.5 ${comments.length > 3 ? 'max-h-28 overflow-y-auto pr-1' : ''}`}>
                {comments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#E3D2C5] bg-[#FCF8F5] py-5 text-center text-sm text-[#7D7066]">
                    <MessageSquare className="mx-auto mb-1.5 h-7 w-7 text-[#CDB9AA]" />
                    No updates yet. Share your progress!
                  </div>
                ) : (
                  [...comments].reverse().map((commentItem) => (
                    <div key={commentItem.id} className="flex gap-2.5 rounded-lg border border-[#ECDED3] bg-[#FCF8F5] p-2">
                      <div className="shrink-0"><ProjectMemberAvatar member={commentItem.author} projectMembers={projectMembers} size="sm" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1F1F1F]">{commentItem.author.name}</span>
                          <span className="text-xs text-[#8A7B70]">
                            {new Date(commentItem.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-[#5A4D43]">{commentItem.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-[#E9DCD2] pt-2.5">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onDelete?.(task);
              onClose();
            }}
            className="!rounded-lg !border !border-[#E5C7BA] !bg-transparent !px-3.5 !text-[#A75B48] hover:!bg-[#FBEDE7]"
          >
            Delete
          </Button>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="!rounded-lg !border !border-[#E5D6CA] !bg-transparent !px-3.5 !text-[#6C5E52] hover:!bg-[#F7ECE4]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="!rounded-lg !bg-[#D97853] !px-4 !text-white hover:!bg-[#C96B48]"
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
