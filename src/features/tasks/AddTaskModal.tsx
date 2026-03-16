import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Modal, Button } from '@/components/ui';
import type { Task, TaskStatus, TaskPriority, Member } from '@/types';
import { DatePickerField, PolishedSelect } from './TaskFormControls';

type ModalSelectOption = {
  value: string;
  label: string;
  tone?: 'accent' | 'positive' | 'muted';
};

function getTodayDateInput() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
  projectId: string;
  members: Member[];
  tasks: Task[];
}

const STATUS_OPTIONS: ModalSelectOption[] = [
  { value: 'TODO', label: 'To Do', tone: 'muted' },
  { value: 'IN_PROGRESS', label: 'In Progress', tone: 'accent' },
  { value: 'DONE', label: 'Done', tone: 'positive' },
  { value: 'CLOSED', label: 'Close', tone: 'muted' },
  { value: 'ON_HOLD', label: 'On Hold', tone: 'muted' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'muted' },
];

const PRIORITY_OPTIONS: ModalSelectOption[] = [
  { value: 'HIGH', label: 'High', tone: 'accent' },
  { value: 'MEDIUM', label: 'Medium', tone: 'muted' },
  { value: 'LOW', label: 'Low', tone: 'positive' },
];

export default function AddTaskModal({ isOpen, onClose, onAdd, projectId, members, tasks = [] }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? '');
  const [startDate, setStartDate] = useState(() => getTodayDateInput());
  const [deadline, setDeadline] = useState('');
  const [dependsOnIds, setDependsOnIds] = useState<string[]>([]);

  const assigneeOptions = useMemo<ModalSelectOption[]>(
    () => members.map((member) => ({ value: member.id, label: member.name, tone: 'muted' })),
    [members],
  );

  const handleSubmit = () => {
    if (!title.trim() || !startDate || !deadline || !assigneeId) return;
    const assignee = members.find((m) => m.id === assigneeId) ?? members[0];
    const newTask: Task = {
      id: `task-new-${Date.now()}`,
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee,
      deadline: new Date(deadline).toISOString(),
      createdAt: new Date(startDate).toISOString(),
      dependsOn: dependsOnIds.length > 0 ? dependsOnIds : undefined,
    };
    onAdd(newTask);
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setStartDate(getTodayDateInput());
    setDeadline('');
    setDependsOnIds([]);
    onClose();
  };

  const inputClass =
    'w-full rounded-xl border border-[#E7D8CE] bg-[#FCF8F5] px-3 py-2.5 text-sm text-[#1F1F1F] placeholder:text-[#9C8E83] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-150 hover:border-[#DEC8B8] focus:border-[#D97853] focus:outline-none focus:ring-4 focus:ring-[#D97853]/14';
  const labelClass = 'mb-1 block text-[12px] font-semibold uppercase tracking-[0.07em] text-[#7B685A]';
  const shouldScrollDependencies = tasks.length > 4;

  const toggleDependency = (taskId: string) => {
    setDependsOnIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Task"
      size="xl"
      bodyScrollable={false}
      panelOverflow="visible"
      panelClassName="max-w-[820px] rounded-[22px] border border-[#E7D8CE] bg-[#FCF8F5] shadow-[0_28px_58px_-34px_rgba(53,31,20,0.54)]"
      headerClassName="border-b border-[#E9DCD2] bg-[linear-gradient(180deg,#FFF7F1_0%,#FCF8F5_100%)] px-4.5 py-3"
      titleClassName="text-[21px] font-bold tracking-[-0.01em] text-[#1F1F1F]"
      closeButtonClassName="text-[#8A7A6D] hover:bg-[#F6E9E0] hover:text-[#1F1F1F] focus:ring-[#D97853]/35"
      bodyClassName="bg-[#FCF8F5] px-4.5 py-3.5 text-[#6B7280]"
      backdropClassName="bg-[#1F1F1F]/42"
    >
      <div className="mx-auto flex h-full w-full max-w-[760px] flex-col text-[#1F1F1F]">
        <div className="space-y-2.5">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className={`${inputClass} h-10`}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description..."
              rows={2}
              className={`${inputClass} min-h-[68px] resize-none`}
            />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <PolishedSelect
              label="Status"
              value={status}
              onChange={(nextStatus) => setStatus(nextStatus as TaskStatus)}
              options={STATUS_OPTIONS}
            />
            <PolishedSelect
              label="Priority"
              value={priority}
              onChange={(nextPriority) => setPriority(nextPriority as TaskPriority)}
              options={PRIORITY_OPTIONS}
            />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <PolishedSelect
              label="Assignee"
              required
              value={assigneeId}
              onChange={setAssigneeId}
              options={assigneeOptions}
              placeholder="Select member"
            />
            <DatePickerField
              label="Start date"
              required
              value={startDate}
              onChange={setStartDate}
            />
            <DatePickerField
              label="Deadline"
              required
              value={deadline}
              onChange={setDeadline}
              min={startDate || undefined}
            />
          </div>

          {tasks.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className={labelClass}>Depends on</label>
                <span className="text-xs font-medium text-[#8B7B70]">{dependsOnIds.length} selected</span>
              </div>

              <div
                className={`ez-task-scrollbar rounded-xl border border-[#E7D8CE] bg-[#F7F1EC] ${
                  shouldScrollDependencies ? 'max-h-24 overflow-y-auto' : 'overflow-hidden'
                }`}
              >
                <div className="divide-y divide-[#EDE0D6]">
                  {tasks.map((taskItem) => {
                    const isSelected = dependsOnIds.includes(taskItem.id);
                    return (
                      <button
                        key={taskItem.id}
                        type="button"
                        onClick={() => toggleDependency(taskItem.id)}
                        className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
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
                        <span className="truncate text-sm text-[#4B4038]">{taskItem.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end border-t border-[#E9DCD2] pt-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="!rounded-xl !border !border-[#E5D6CA] !bg-transparent !px-4 !text-[#6C5E52] hover:!bg-[#F7ECE4]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!title.trim() || !startDate || !deadline || !assigneeId}
              className="!rounded-xl !bg-[#D97853] !px-5 !text-white hover:!bg-[#C96B48]"
            >
              Create Task
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
