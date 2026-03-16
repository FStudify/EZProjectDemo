import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GripVertical, ArrowRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { Task } from '@/types';
import type { ProjectMember } from '@/types';
import { ProjectMemberAvatar } from '@/components/ui';

const NODE_MIN_WIDTH = 140;
const LAYER_GAP = 40;
const GRAPH_PADDING = 24;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.15;

const STATUS_COLORS: Record<string, string> = {
  DONE: 'bg-emerald-500',
  IN_PROGRESS: 'bg-amber-500',
  TODO: 'bg-blue-500',
  ON_HOLD: 'bg-orange-400',
  CANCELLED: 'bg-slate-300',
};

function assignLayers(tasks: Task[]): Map<string, number> {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const layers = new Map<string, number>();

  function getLayer(id: string): number {
    if (layers.has(id)) return layers.get(id)!;
    const task = byId.get(id);
    if (!task || !task.dependsOn?.length) {
      layers.set(id, 0);
      return 0;
    }
    const depLayers = task.dependsOn
      .filter((d) => byId.has(d))
      .map((d) => getLayer(d));
    return depLayers.length > 0 ? Math.max(...depLayers) + 1 : 0;
  }

  for (const task of tasks) {
    getLayer(task.id);
  }
  return layers;
}

function computeInitialLayout(tasks: Task[]) {
  const layers = assignLayers(tasks);
  const byLayer = new Map<number, Task[]>();
  for (const task of tasks) {
    const layer = layers.get(task.id) ?? 0;
    const list = byLayer.get(layer) ?? [];
    list.push(task);
    byLayer.set(layer, list);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const layerKeys = [...byLayer.keys()].sort((a, b) => a - b);
  const rowHeight = 72;
  const nodeSpacing = 180;

  layerKeys.forEach((layerIdx, i) => {
    const layerTasks = byLayer.get(layerIdx) ?? [];
    const layerX = i * (240 + LAYER_GAP);

    layerTasks.forEach((task, j) => {
      const x = layerX + j * nodeSpacing;
      const y = rowHeight / 2;
      positions.set(task.id, { x, y });
    });
  });

  const maxX = layerKeys.length > 0
    ? Math.max(
        ...layerKeys.map((i) => {
          const lt = byLayer.get(i) ?? [];
          return i * (180 + LAYER_GAP) + (lt.length - 1) * nodeSpacing + 140;
        }),
      )
    : 220;
  return { positions, width: maxX + 100, height: rowHeight + 120 };
}

interface TaskDependencyGraphProps {
  tasks: Task[];
  projectMembers: ProjectMember[];
  onTaskClick?: (task: Task) => void;
  onSaveTask?: (task: Task) => void;
}

export default function TaskDependencyGraph({
  tasks: projectTasks,
  projectMembers = [],
  onTaskClick,
  onSaveTask,
}: TaskDependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(() => {
    const { positions: p } = computeInitialLayout(projectTasks);
    return p;
  });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ pos: { x: number; y: number }; mouse: { x: number; y: number } } | null>(null);
  const hasDraggedRef = useRef(false);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const [linkCursor, setLinkCursor] = useState({ x: 0, y: 0 });
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [nodeSizes, setNodeSizes] = useState<Map<string, { w: number; h: number }>>(new Map());
  const [scale, setScale] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const { tasks, edges } = useMemo(() => {
    const edges: { from: string; to: string }[] = [];
    for (const task of projectTasks) {
      for (const depId of task.dependsOn ?? []) {
        if (projectTasks.some((t) => t.id === depId)) {
          edges.push({ from: depId, to: task.id });
        }
      }
    }
    return { tasks: projectTasks, edges };
  }, [projectTasks]);

  const layout = useMemo(() => {
    const pos = new Map(positions);
    for (const t of projectTasks) {
      if (!pos.has(t.id)) {
        const { positions: init } = computeInitialLayout(projectTasks);
        init.forEach((v, k) => pos.set(k, v));
        break;
      }
    }
    const maxX = Math.max(0, ...[...pos.values()].map((p) => p.x));
    const maxY = Math.max(0, ...[...pos.values()].map((p) => p.y));
    return { positions: pos, width: maxX + 220, height: maxY + 120 };
  }, [positions, projectTasks]);

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, taskId: string) => {
      if ((e.target as HTMLElement).closest('[data-drag-handle]')) return;
      e.preventDefault();
      hasDraggedRef.current = false;
      const pos = layout.positions.get(taskId);
      if (!pos) return;
      setDraggingId(taskId);
      setDragStart({ pos: { ...pos }, mouse: { x: e.clientX, y: e.clientY } });
    },
    [layout.positions],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggingId && dragStart) {
        const dx = (e.clientX - dragStart.mouse.x) / scale;
        const dy = (e.clientY - dragStart.mouse.y) / scale;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          hasDraggedRef.current = true;
        }
        setPositions((prev) => {
          const next = new Map(prev);
          next.set(draggingId, {
            x: Math.max(0, dragStart.pos.x + dx),
            y: Math.max(0, dragStart.pos.y + dy),
          });
          return next;
        });
      } else if (linkingFrom) {
        const el = scrollContainerRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          setLinkCursor({
            x: e.clientX - rect.left + el.scrollLeft,
            y: e.clientY - rect.top + el.scrollTop,
          });
        }
      }
    },
    [draggingId, dragStart, linkingFrom, scale],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (draggingId) {
        setDraggingId(null);
        setDragStart(null);
        return;
      }
      if (linkingFrom) {
        const target = (e.target as HTMLElement).closest('[data-node-id]');
        const targetId = target?.getAttribute('data-node-id');
        if (targetId && targetId !== linkingFrom && onSaveTask) {
          const targetTask = projectTasks.find((t) => t.id === targetId);
          if (targetTask) {
            const deps = [...(targetTask.dependsOn ?? [])];
            if (!deps.includes(linkingFrom)) {
              onSaveTask({ ...targetTask, dependsOn: [...deps, linkingFrom] });
            }
          }
        }
        setLinkingFrom(null);
      }
    },
    [draggingId, linkingFrom, onSaveTask, projectTasks],
  );

  useEffect(() => {
    const onMove = (ev: MouseEvent) => handleMouseMove(ev);
    const onUp = (ev: MouseEvent) => handleMouseUp(ev);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const fitScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const cw = container.clientWidth - 48;
      const ch = container.clientHeight - 48;
      const contentW = layout.width + GRAPH_PADDING * 2;
      const contentH = layout.height + GRAPH_PADDING * 2;
      const scaleX = cw > 0 ? Math.min(1, cw / contentW) : 1;
      const scaleY = ch > 0 ? Math.min(1, ch / contentH) : 1;
      const fit = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.min(scaleX, scaleY)));
      setScale(fit);
    };
    fitScale();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(fitScale);
    ro.observe(container);
    return () => ro.disconnect();
  }, [layout.width, layout.height, tasks.length]);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(ZOOM_MAX, s + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(ZOOM_MIN, s - ZOOM_STEP));
  }, []);

  const handleZoomReset = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth - 80;
    const ch = container.clientHeight - 80;
    const contentW = layout.width + GRAPH_PADDING * 2;
    const contentH = layout.height + GRAPH_PADDING * 2;
    const scaleX = cw > 0 ? Math.min(1, cw / contentW) : 1;
    const scaleY = ch > 0 ? Math.min(1, ch / contentH) : 1;
    setScale(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.min(scaleX, scaleY))));
  }, [layout.width, layout.height]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setScale((s) => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s + delta));
      });
    },
    [],
  );

  useEffect(() => {
    const measure = () => {
      const next = new Map<string, { w: number; h: number }>();
      nodeRefs.current.forEach((el, id) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          next.set(id, { w: rect.width, h: rect.height });
        }
      });
      setNodeSizes((prev) => {
        const m = new Map(prev);
        next.forEach((v, k) => m.set(k, v));
        return m;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    nodeRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });
    return () => ro.disconnect();
  }, [tasks, positions]);

  const handleLinkStart = useCallback((e: React.MouseEvent, fromId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setLinkingFrom(fromId);
    const el = scrollContainerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setLinkCursor({
        x: e.clientX - rect.left + el.scrollLeft,
        y: e.clientY - rect.top + el.scrollTop,
      });
    }
  }, []);

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
        <p className="text-sm text-slate-600">No tasks in this project</p>
      </div>
    );
  }

  const padding = GRAPH_PADDING;
  const DEFAULT_NODE_WIDTH = 200;
  const DEFAULT_NODE_HEIGHT = 72;

  return (
    <div
      ref={containerRef}
      className="relative flex h-[calc(100vh-16rem)] min-h-[360px] min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50"
    >
      {/* Zoom controls */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <span className="text-xs font-medium text-slate-500">
          Zoom: {Math.round(scale * 100)}%
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= ZOOM_MIN}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
            title="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            title="Vừa màn hình"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= ZOOM_MAX}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
            title="Phóng to"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Graph viewport - constrained, scrollable when zoomed */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 min-h-0 overflow-auto p-4"
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        <div
          className="relative"
          style={{
            width: (layout.width + padding * 2) * scale,
            height: (layout.height + padding * 2) * scale,
          }}
        >
        <div
          ref={contentRef}
          className="absolute top-0 left-0 origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: layout.width + padding * 2,
            height: layout.height + padding * 2,
          }}
        >
        <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        style={{ minWidth: layout.width + padding * 2, minHeight: layout.height + padding * 2 }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-slate-400" />
          </marker>
        </defs>
        <g transform={`translate(${padding}, ${padding})`}>
          {edges.map(({ from, to }) => {
            const fromPos = layout.positions.get(from);
            const toPos = layout.positions.get(to);
            if (!fromPos || !toPos) return null;
            const fromSize = nodeSizes.get(from) ?? { w: DEFAULT_NODE_WIDTH, h: DEFAULT_NODE_HEIGHT };
            const x1 = fromPos.x + fromSize.w + 2;
            const y1 = fromPos.y;
            const x2 = toPos.x - 2;
            const y2 = toPos.y;
            const midX = (x1 + x2) / 2;
            return (
              <path
                key={`${from}-${to}`}
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          {linkingFrom && (() => {
            const fp = layout.positions.get(linkingFrom);
            if (!fp) return null;
            const fromSize = nodeSizes.get(linkingFrom) ?? { w: DEFAULT_NODE_WIDTH, h: DEFAULT_NODE_HEIGHT };
            const x1 = fp.x + fromSize.w;
            const y1 = fp.y;
            return (
            <path
              d={`M ${x1} ${y1} L ${linkCursor.x / scale - padding} ${linkCursor.y / scale - padding}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-primary"
              markerEnd="url(#arrowhead)"
            />
            );
          })()}
        </g>
      </svg>

      <div className="relative" style={{ minWidth: layout.width + padding * 2, minHeight: layout.height + padding * 2 }}>
        {tasks.map((task) => {
          const pos = layout.positions.get(task.id) ?? { x: 0, y: 0 };
          const statusColor = STATUS_COLORS[task.status] ?? 'bg-slate-400';
          return (
            <div
              key={task.id}
              ref={(el) => {
                if (el) nodeRefs.current.set(task.id, el);
              }}
              data-node-id={task.id}
              className="absolute cursor-grab active:cursor-grabbing select-none"
              style={{
                left: padding + pos.x,
                top: padding + pos.y - 36,
                width: 'max-content',
                minWidth: NODE_MIN_WIDTH,
                maxWidth: 260,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, task.id)}
              onClick={(e) => {
                if (
                  !hasDraggedRef.current &&
                  !draggingId &&
                  !(e.target as HTMLElement).closest('[data-drag-handle]')
                ) {
                  onTaskClick?.(task);
                }
              }}
            >
              <div className="flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                <div className="cursor-grab active:cursor-grabbing shrink-0 text-slate-400 hover:text-slate-600 p-0.5 -m-0.5">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className={`shrink-0 w-2 h-2 rounded-full ${statusColor}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ProjectMemberAvatar
                        member={task.assignee}
                        projectMembers={projectMembers}
                        size="sm"
                      />
                      <span className="text-xs text-slate-500 truncate">
                        {task.assignee.name}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  data-drag-handle
                  className="shrink-0 p-1 rounded hover:bg-primary-50 text-slate-400 hover:text-primary transition-colors"
                  title="Drag to create dependency"
                  onMouseDown={(e) => handleLinkStart(e, task.id)}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
