import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Filter, LayoutGrid, GanttChart, AlertTriangle, Clock, GitBranch } from 'lucide-react';
import { mockTasks, mockProjects } from '@/mocks';
import type { Task, TaskStatus } from '@/types';
import { Button, ProjectMemberAvatar } from '@/components/ui';
import { ChatPanel } from '@/features/chat';
import TaskColumn from './TaskColumn';
import TaskTimeline from './TaskTimeline';
import TaskDependencyGraph from './TaskDependencyGraph';
import TaskModal from './TaskModal';
import AddTaskModal from './AddTaskModal';

type ViewMode = 'kanban' | 'timeline' | 'reminders' | 'dependencies';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'To Do' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'DONE', title: 'Done' },
  { status: 'CLOSED', title: 'Close' },
  { status: 'ON_HOLD', title: 'On Hold' },
  { status: 'CANCELLED', title: 'Cancelled' },
];

interface Filters {
  assigneeId: string;
  priority: string;
  deadlineBefore: string;
  deadlineAfter: string;
  /** Days: show tasks due within N days, not yet done */
  deadlineWithinDays: string;
  search: string;
}

const emptyFilters: Filters = {
  assigneeId: '',
  priority: '',
  deadlineBefore: '',
  deadlineAfter: '',
  deadlineWithinDays: '',
  search: '',
};

export default function TaskBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? mockProjects.find((p) => p.id === projectId) : undefined;
  const members = project?.members.map((pm) => pm.member) ?? [];

  const [tasks, setTasks] = useState<Task[]>(() =>
    mockTasks.filter((t) => t.projectId === projectId),
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const filterRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filters.assigneeId) {
      result = result.filter((t) => t.assignee.id === filters.assigneeId);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.deadlineAfter) {
      const d = new Date(filters.deadlineAfter).getTime();
      result = result.filter((t) => new Date(t.deadline).getTime() >= d);
    }
    if (filters.deadlineBefore) {
      const d = new Date(filters.deadlineBefore).getTime();
      result = result.filter((t) => new Date(t.deadline).getTime() <= d);
    }
    // Deadline within N days: tasks due from today to today + N days, not done
    if (filters.deadlineWithinDays) {
      const n = parseInt(filters.deadlineWithinDays, 10);
      if (!Number.isNaN(n) && n >= 0) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n + 1).getTime() - 1;
        result = result.filter(
          (t) =>
            t.status !== 'DONE' &&
            t.status !== 'CLOSED' &&
            t.status !== 'CANCELLED' &&
            new Date(t.deadline).getTime() >= startOfToday &&
            new Date(t.deadline).getTime() <= endOfTarget
        );
      }
    }
    return result;
  }, [tasks, filters]);

  const getTasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  // Reminders: overdue + due in 3 days (for this project)
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfDay3 = startOfToday.getTime() + 4 * 24 * 60 * 60 * 1000 - 1;
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== 'DONE' &&
      t.status !== 'CLOSED' &&
      t.status !== 'CANCELLED' &&
      new Date(t.deadline).getTime() < now
  );
  const dueSoonTasks = tasks.filter(
    (t) =>
      t.status !== 'DONE' &&
      t.status !== 'CLOSED' &&
      t.status !== 'CANCELLED' &&
      new Date(t.deadline).getTime() >= now &&
      new Date(t.deadline).getTime() <= endOfDay3
  );

  const handleAddTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const handleDeleteTask = (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setSelectedTask(null);
    setIsDetailOpen(false);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  const handleSaveTask = (updated: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
    setSelectedTask(updated);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showFilters && filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  const selectClass =
    'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <div className="flex h-[calc(100vh-14rem)] gap-0">
      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden pr-4">
        {/* Header row - nằm ngoài vùng scroll, đứng yên */}
        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                  viewMode === 'kanban' ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> Kanban
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                  viewMode === 'timeline' ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GanttChart className="h-4 w-4" /> Timeline
              </button>
              <button
                type="button"
                onClick={() => setViewMode('dependencies')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                  viewMode === 'dependencies' ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GitBranch className="h-4 w-4" /> Dependencies
              </button>
              <button
                type="button"
                onClick={() => setViewMode('reminders')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                  viewMode === 'reminders' ? 'bg-primary-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="h-4 w-4" /> Reminders
              </button>
            </div>
          </div>
          {viewMode === 'kanban' && (
          <div className="flex items-center gap-2" ref={filterRef}>
            {/* Filter dropdown - opens to the left */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((p) => !p)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  hasActiveFilters
                    ? 'border-primary/20 bg-primary-50 text-primary'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {Object.values(filters).filter((v) => v !== '').length}
                  </span>
                )}
              </button>
              {showFilters && (
                <div className="absolute right-full top-0 z-50 mr-2 min-w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Filters</span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => setFilters(emptyFilters)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-500">Search</label>
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                        placeholder="Task name..."
                        className={selectClass + ' w-full'}
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-500">Member</label>
                      <select
                        value={filters.assigneeId}
                        onChange={(e) => setFilters((f) => ({ ...f, assigneeId: e.target.value }))}
                        className={selectClass + ' w-full'}
                      >
                        <option value="">All members</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-500">Priority</label>
                      <select
                        value={filters.priority}
                        onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                        className={selectClass + ' w-full'}
                      >
                        <option value="">All</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-slate-500">Deadline from</label>
                      <input
                        type="date"
                        value={filters.deadlineAfter}
                        onChange={(e) => setFilters((f) => ({ ...f, deadlineAfter: e.target.value }))}
                        className={selectClass + ' w-full'}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-0.5 block text-xs font-medium text-slate-500">Deadline to</label>
                      <input
                        type="date"
                        value={filters.deadlineBefore}
                        onChange={(e) => setFilters((f) => ({ ...f, deadlineBefore: e.target.value }))}
                        className={selectClass + ' w-full'}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-0.5 block text-xs font-medium text-slate-500">
                        Within N days (incomplete)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 3 → tasks due in 3 days"
                        value={filters.deadlineWithinDays}
                        onChange={(e) => setFilters((f) => ({ ...f, deadlineWithinDays: e.target.value }))}
                        className={selectClass + ' w-full'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Task
            </Button>
          </div>
          )}
          {viewMode === 'dependencies' && (
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Task
          </Button>
          )}
        </div>

        {/* Kanban, Timeline, or Reminders view */}
        {viewMode === 'reminders' ? (
          <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
            <div className="flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
              <h3 className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0 text-base font-semibold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Overdue ({overdueTasks.length})
              </h3>
              <div className="flex-1 overflow-auto p-4">
                {overdueTasks.length === 0 ? (
                  <p className="text-sm text-slate-500">No overdue tasks.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600">
                        <th className="py-2 pr-3 font-semibold">Task</th>
                        <th className="py-2 pr-3 font-semibold">Assignee</th>
                        <th className="py-2 font-semibold">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueTasks.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-rose-50/50 cursor-pointer"
                          onClick={() => { setSelectedTask(t); setIsDetailOpen(true); }}
                        >
                          <td className="py-2.5 pr-3 font-medium text-slate-900">{t.title}</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <ProjectMemberAvatar member={t.assignee} projectMembers={project?.members ?? []} size="sm" />
                              <span className="text-slate-600">{t.assignee.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600">
                            {new Date(t.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
              <h3 className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0 text-base font-semibold text-slate-900">
                <Clock className="h-4 w-4 text-amber-500" />
                Due in 3 days ({dueSoonTasks.length})
              </h3>
              <div className="flex-1 overflow-auto p-4">
                {dueSoonTasks.length === 0 ? (
                  <p className="text-sm text-slate-500">No tasks due soon.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600">
                        <th className="py-2 pr-3 font-semibold">Task</th>
                        <th className="py-2 pr-3 font-semibold">Assignee</th>
                        <th className="py-2 font-semibold">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dueSoonTasks.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-amber-50/50 cursor-pointer"
                          onClick={() => { setSelectedTask(t); setIsDetailOpen(true); }}
                        >
                          <td className="py-2.5 pr-3 font-medium text-slate-900">{t.title}</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <ProjectMemberAvatar member={t.assignee} projectMembers={project?.members ?? []} size="sm" />
                              <span className="text-slate-600">{t.assignee.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600">
                            {new Date(t.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : viewMode === 'dependencies' ? (
          <div className="flex min-w-0 flex-1 min-h-0 flex-col">
            <TaskDependencyGraph
              tasks={filteredTasks}
              projectMembers={project?.members ?? []}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsDetailOpen(true);
              }}
              onSaveTask={handleSaveTask}
            />
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="kanban-scroll flex flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex gap-3 min-w-max">
              {COLUMNS.map(({ status, title }) => (
                <TaskColumn
                  key={status}
                  status={status}
                  title={title}
                  tasks={getTasksByStatus(status)}
                  projectMembers={project?.members ?? []}
                  onTaskClick={(task) => {
                    setSelectedTask(task);
                    setIsDetailOpen(true);
                  }}
                  onDrop={handleStatusChange}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-4">
            {project && (
              <TaskTimeline
                tasks={filteredTasks}
                projectStart={project.createdAt}
                projectDeadline={project.deadline}
                projectMembers={project.members}
                onTaskClick={(task) => {
                  setSelectedTask(task);
                  setIsDetailOpen(true);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Chat panel */}
      {projectId && <ChatPanel projectId={projectId} channel="task" />}

      {/* Modals */}
      <TaskModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedTask(null); }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        members={members}
        projectMembers={project?.members ?? []}
        tasks={tasks}
        currentUser={members[0]}
      />
      {projectId && (
        <AddTaskModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddTask}
          projectId={projectId}
          members={members}
          tasks={tasks}
        />
      )}
    </div>
  );
}
