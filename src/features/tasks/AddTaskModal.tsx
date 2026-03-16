import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import type { Task, TaskStatus, TaskPriority, Member } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
  projectId: string;
  members: Member[];
  tasks: Task[];
}

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

export default function AddTaskModal({ isOpen, onClose, onAdd, projectId, members, tasks = [] }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? '');
  const [deadline, setDeadline] = useState('');
  const [dependsOnIds, setDependsOnIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title.trim() || !deadline || !assigneeId) return;
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
      createdAt: new Date().toISOString(),
      dependsOn: dependsOnIds.length > 0 ? dependsOnIds : undefined,
    };
    onAdd(newTask);
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setDeadline('');
    setDependsOnIds([]);
    onClose();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task..."
            rows={3}
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

        {tasks.length > 0 && (
          <div>
            <label className={labelClass}>Depends on</label>
            <p className="mb-1.5 text-xs text-slate-500">
              Tasks that must be completed before this one
            </p>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1">
              {tasks.map((t) => (
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Assignee *</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Deadline *</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!title.trim() || !deadline || !assigneeId}
          >
            Create Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
