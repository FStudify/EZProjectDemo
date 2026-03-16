import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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

interface PdfViewerProps {
  /** PDF URL (blob URL or remote) */
  url: string;
  title?: string;
  className?: string;
  /** Container width for fit-to-width; scale depends on panel size */
  containerWidth?: number;
}

function PdfViewerInner({ url, title, className = '', containerWidth: parentContainerWidth }: PdfViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [measuredContainerWidth, setMeasuredContainerWidth] = useState(0);

  // Measure container directly for stable fit scaling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMeasuredContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setMeasuredContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const debouncedWidth = useDebouncedValue(measuredContainerWidth, 150);
  const containerWidth = debouncedWidth > 0 ? debouncedWidth : parentContainerWidth;
  const [pageWidth, setPageWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(ZOOM_MAX, s + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(ZOOM_MIN, s - ZOOM_STEP));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
  }, []);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        setPageWidth(vp.width);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load PDF');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Fit scale - kích thước hiển thị (CSS pixels)
  const fitScale =
    containerWidth && pageWidth > 0
      ? Math.max(0.25, Math.min(1, (containerWidth - 48) / pageWidth))
      : 1;
  const effectiveScale = scale * fitScale;

  // Render scale: luôn 3x để PDF rõ (scale 1-2 vẫn mờ trên nhiều màn hình)
  const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
  const renderScale = Math.max(3, effectiveScale * pixelRatio);

  // Display: canvas render 3x, hiển thị đúng size (scale down)
  const displayScale = effectiveScale / renderScale;

  // Render canvas resolution cao, hiển thị integer pixels (tránh blur)
  useEffect(() => {
    if (!url || !pdfContentRef.current || numPages === 0) return;

    const container = pdfContentRef.current;
    container.innerHTML = '';

    const renderPages = async () => {
      const loadingTask = pdfjsLib.getDocument({ url });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.className = 'mx-auto block shadow-sm';
        // Integer pixels - tránh subpixel blur
        const displayW = Math.round(viewport.width * displayScale);
        const displayH = Math.round(viewport.height * displayScale);
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
        canvas.style.imageRendering = 'auto';

        const renderContext = {
          canvasContext: ctx,
          canvas,
          viewport,
        };
        await page.render(renderContext).promise;

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'mb-4 flex justify-center';
        pageWrapper.appendChild(canvas);
        container.appendChild(pageWrapper);
      }
    };

    renderPages().catch(() => {});
  }, [url, numPages, renderScale, displayScale]);

  if (error) {
    return (
      <div className={`rounded-lg bg-amber-50 p-4 text-amber-800 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${className}`}>
      {/* Zoom controls - same style as TaskDependencyGraph */}
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

      {/* PDF pages - min-h-0 để flex shrink, overflow trong khung */}
      <div
        ref={scrollContainerRef}
        className="pdf-preview-wrapper relative min-h-0 flex-1 rounded-lg border border-slate-200 bg-slate-100"
        role="document"
        aria-label={title}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90">
            <span className="text-slate-500">Loading PDF...</span>
          </div>
        )}
        <div
          ref={pdfContentRef}
          className="flex flex-col items-center p-4"
        />
      </div>
    </div>
  );
}

export default memo(PdfViewerInner);
