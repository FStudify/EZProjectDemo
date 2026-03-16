import { useState, useEffect } from 'react';
import type { Document } from '@/types';
import PdfViewer from './PdfViewer';
import DocxViewer from './DocxViewer';

interface DocumentContentAreaProps {
  document: Document | null;
  /** For uploaded files: pass the blob directly */
  fileBlob?: Blob | null;
  className?: string;
  /** Container width for fit-to-panel scaling */
  containerWidth?: number;
}

export default function DocumentContentArea({
  document: doc,
  fileBlob,
  className = '',
  containerWidth,
}: DocumentContentAreaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [docArrayBuffer, setDocArrayBuffer] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    if (!doc) {
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setDocArrayBuffer(null);
      setError(null);
      return;
    }

    const hasFile = doc.fileUrl || fileBlob;
    if (!hasFile) {
      setError('Preview not available for this file.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setDocArrayBuffer(null);

      try {
        let arrayBuffer: ArrayBuffer;

        if (fileBlob && (doc.fileType === 'DOC' || doc.fileType === 'PDF' || doc.fileType === 'IMG')) {
          arrayBuffer = await fileBlob.arrayBuffer();
        } else if (doc.fileUrl) {
          const res = await fetch(doc.fileUrl);
          if (!res.ok) throw new Error('Failed to load file');
          arrayBuffer = await res.arrayBuffer();
        } else {
          setError('Preview not available.');
          return;
        }

        const contentType = fileBlob?.type || '';

        if (doc.fileType === 'DOC') {
          setDocArrayBuffer(arrayBuffer);
        } else if (doc.fileType === 'PDF') {
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          setPdfUrl(URL.createObjectURL(blob));
        } else if (doc.fileType === 'IMG') {
          const blob = new Blob([arrayBuffer], { type: contentType || 'image/png' });
          setImageUrl(URL.createObjectURL(blob));
        } else {
          setError('Preview not available. Please download the file.');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [doc, fileBlob]);

  if (!doc) {
    return (
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 ${className}`}>
        <p className="text-sm text-slate-500">Select a document to view</p>
      </div>
    );
  }

  const hasPreview = doc.fileType === 'DOC' || doc.fileType === 'PDF' || doc.fileType === 'IMG';

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${className}`}>
      {loading && (
        <div className="flex min-h-0 flex-1 items-center justify-center py-16 text-slate-500">Loading...</div>
      )}
      {error && !loading && (
        <div className="rounded-lg bg-amber-50 p-4 text-amber-800 text-sm">{error}</div>
      )}
      {doc.fileType === 'DOC' && docArrayBuffer && !loading && !error && (
        <DocxViewer
          arrayBuffer={docArrayBuffer}
          title={doc.name}
          containerWidth={containerWidth}
          className="h-full"
        />
      )}
      {pdfUrl && !loading && !error && (
        <PdfViewer url={pdfUrl} title={doc.name} containerWidth={containerWidth} className="h-full" />
      )}
      {imageUrl && !loading && !error && (
        <div className="flex min-h-0 min-w-0 flex-1 justify-center overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          <img
            src={imageUrl}
            alt={doc.name}
            className="max-h-[70vh] max-w-full object-contain rounded"
          />
        </div>
      )}
      {!hasPreview && !loading && !error && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 py-16">
          <p className="text-sm text-slate-500">Preview not available for this file type.</p>
          <p className="mt-1 text-xs text-slate-400">You can still ask AI about this document.</p>
        </div>
      )}
    </div>
  );
}
