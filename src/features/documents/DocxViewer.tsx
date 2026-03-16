import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { renderAsync } from 'docx-preview';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

interface DocxViewerProps {
  arrayBuffer: ArrayBuffer;
  title?: string;
  className?: string;
  /** Container width for fit-to-width scaling (from parent) */
  containerWidth?: number;
}

function DocxViewer({
  arrayBuffer,
  title,
  className = '',
  containerWidth: parentContainerWidth,
}: DocxViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentWidth, setContentWidth] = useState(0);
  const [measuredContainerWidth, setMeasuredContainerWidth] = useState(0);

  // Measure actual content area width (khung giữa) - more reliable than parent
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setMeasuredContainerWidth(w);
      }
    });
    ro.observe(el);
    setMeasuredContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const debouncedWidth = useDebouncedValue(measuredContainerWidth, 150);
  const containerWidth = debouncedWidth > 0 ? debouncedWidth : parentContainerWidth;

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(ZOOM_MAX, s + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(ZOOM_MIN, s - ZOOM_STEP));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
  }, []);

  // Render docx
  useEffect(() => {
    if (!arrayBuffer || !contentRef.current) return;

    const el = contentRef.current;
    el.innerHTML = '';
    let ro: ResizeObserver | null = null;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await renderAsync(arrayBuffer, el, undefined, {
          className: 'docx-viewer',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
        });
        const measure = () => {
          const wrapper = el.querySelector('.docx-wrapper') || el.querySelector('.docx-viewer-wrapper') || el;
          const w = wrapper instanceof HTMLElement ? wrapper.offsetWidth : el.scrollWidth;
          setContentWidth(w || 612);
        };
        requestAnimationFrame(measure);
        ro = new ResizeObserver(measure);
        ro.observe(el);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      ro?.disconnect();
    };
  }, [arrayBuffer]);

  // Compute fit scale when container width changes (min 0.25 to avoid invisible content)
  const fitScale = containerWidth && contentWidth > 0
    ? Math.max(0.25, Math.min(1, (containerWidth - 48) / contentWidth))
    : 1;
  const effectiveScale = scale * fitScale;

  if (error) {
    return (
      <div className={`rounded-lg bg-amber-50 p-4 text-amber-800 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${className}`}>
      {/* Zoom controls - same as PdfViewer */}
      <div className="mb-3 flex items-center justify-end gap-1 rounded-lg bg-slate-50 p-1">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= ZOOM_MIN}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          title="Thu nhỏ"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] text-center text-xs text-slate-500">
          {Math.round(effectiveScale * 100)}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= ZOOM_MAX}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          title="Phóng to"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          title="Vừa màn hình"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content area - min-h-0 để flex shrink, overflow trong khung */}
      <div
        ref={scrollContainerRef}
        className="docx-preview-wrapper relative min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-100"
        role="document"
        aria-label={title}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90">
            <span className="text-slate-500">Loading document...</span>
          </div>
        )}
        <div
          className="flex w-full min-w-0 justify-center overflow-x-hidden p-4"
          style={{
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top center',
          }}
        >
          <div
            ref={contentRef}
            className={`docx-container flex min-w-0 flex-col items-center ${loading ? 'invisible' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(DocxViewer);
