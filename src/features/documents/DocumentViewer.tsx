import type { Document } from '@/types';
import { Modal } from '@/components/ui';
import DocumentContentArea from './DocumentContentArea';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  /** For uploaded files: pass the blob directly */
  fileBlob?: Blob | null;
}

export default function DocumentViewer({
  document: doc,
  isOpen,
  onClose,
  fileBlob,
}: DocumentViewerProps) {
  if (!doc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doc.name} size="lg">
      <DocumentContentArea document={doc} fileBlob={fileBlob} className="min-h-[60vh]" />
    </Modal>
  );
}
