import { useState, useCallback, useRef, useEffect } from 'react';
import { FileText, Presentation, Archive, Image, GripVertical } from 'lucide-react';
import type { Document, FileType } from '@/types';
import DocumentContentArea from './DocumentContentArea';
import DocumentAIAssistant from './DocumentAIAssistant';

const DOC_LIST_MIN = 200;
const DOC_LIST_MAX = 400;
const DOC_LIST_DEFAULT = 256;

const AI_PANEL_MIN = 320;
const AI_PANEL_MAX = 720;
const AI_PANEL_DEFAULT = 420;

function ResizeHandle({
  onMouseDown,
  ariaLabel,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      onMouseDown={onMouseDown}
      className="group flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-slate-100 hover:bg-primary/20 transition-colors"
    >
      <div className="flex h-12 w-0.5 items-center justify-center rounded-full bg-slate-300 group-hover:bg-primary/50 transition-colors">
        <GripVertical className="h-4 w-4 text-slate-500 group-hover:text-primary" />
      </div>
    </div>
  );
}

const fileTypeIcons: Record<FileType, typeof FileText> = {
  DOC: FileText,
  PDF: FileText,
  PPT: Presentation,
  ZIP: Archive,
  IMG: Image,
  OTHER: FileText,
};

interface DocumentAIAssistantPageProps {
  documents: Document[];
  selectedDoc: Document | null;
  onSelectDoc: (doc: Document) => void;
  uploadedBlobs: Map<string, Blob>;
}

export default function DocumentAIAssistantPage({
  documents,
  selectedDoc,
  onSelectDoc,
  uploadedBlobs,
}: DocumentAIAssistantPageProps) {
  const [docListWidth, setDocListWidth] = useState(DOC_LIST_DEFAULT);
  const [aiPanelWidth, setAiPanelWidth] = useState(AI_PANEL_DEFAULT);
  const contentPanelRef = useRef<HTMLDivElement>(null);
  const [contentPanelWidth, setContentPanelWidth] = useState(0);

  // Measure content panel width for fit-to-container scaling (depends on panel resize)
  useEffect(() => {
    const el = contentPanelRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentPanelWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setContentPanelWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, [docListWidth, aiPanelWidth]);

  const handleDocListResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = docListWidth;

    const handleMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      let next = startWidth + delta;
      next = Math.max(DOC_LIST_MIN, Math.min(DOC_LIST_MAX, next));
      setDocListWidth(next);
    };

    const handleUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [docListWidth]);

  const handleAiPanelResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = aiPanelWidth;

    const handleMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      let next = startWidth + delta;
      next = Math.max(AI_PANEL_MIN, Math.min(AI_PANEL_MAX, next));
      setAiPanelWidth(next);
    };

    const handleUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [aiPanelWidth]);

  return (
    <div
      className="grid h-[calc(100vh-10rem)] w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      style={{
        gridTemplateColumns: `${docListWidth}px 8px 1fr 8px ${aiPanelWidth}px`,
      }}
    >
      {/* Left: Document list */}
      <div className="flex flex-col overflow-hidden border-r border-slate-200 bg-slate-50/50">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <h3 className="font-semibold text-slate-900">Documents</h3>
          <p className="text-xs text-slate-500">Select to view & ask AI</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {documents.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">No documents</p>
          ) : (
            <ul className="space-y-1">
              {documents.map((doc) => {
                const Icon = fileTypeIcons[doc.fileType];
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => onSelectDoc(doc)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <span className="min-w-0 truncate text-sm font-medium">{doc.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Resize handle: doc list */}
      <ResizeHandle onMouseDown={handleDocListResize} ariaLabel="Resize document list" />

      {/* Center: viewer - grid 1fr, min-w-0, viewer-container */}
      <div
        ref={contentPanelRef}
        className="viewer-container flex min-w-0 flex-col overflow-hidden bg-white p-4"
      >
        <DocumentContentArea
          document={selectedDoc}
          fileBlob={selectedDoc && uploadedBlobs.has(selectedDoc.id) ? uploadedBlobs.get(selectedDoc.id)! : null}
          containerWidth={contentPanelWidth}
          className="h-full"
        />
      </div>

      {/* Resize handle: AI panel */}
      <ResizeHandle onMouseDown={handleAiPanelResize} ariaLabel="Resize AI panel" />

      {/* Right: AI chat */}
      <div className="flex flex-col overflow-hidden border-l border-slate-200">
        {selectedDoc ? (
          <DocumentAIAssistant document={selectedDoc} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center border-l border-slate-200 bg-slate-50/50 p-6 text-center">
            <p className="text-sm text-slate-500">Select a document to chat with AI</p>
          </div>
        )}
      </div>
    </div>
  );
}
