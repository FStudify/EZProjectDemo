import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { mockDocuments, mockMembers, mockProjects } from '@/mocks';
import { Button, ProjectMemberAvatar } from '@/components/ui';
import { ChatPanel } from '@/features/chat';
import DocumentViewer from './DocumentViewer';
import DocumentAIAssistantPage from './DocumentAIAssistantPage';
import { FileText, Presentation, Archive, Download, Image, Upload, FileStack, Sparkles } from 'lucide-react';
import type { Document, FileType } from '@/types';

const fileTypeIcons: Record<FileType, typeof FileText> = {
  DOC: FileText,
  PDF: FileText,
  PPT: Presentation,
  ZIP: Archive,
  IMG: Image,
  OTHER: FileText,
};

function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['doc', 'docx'].includes(ext)) return 'DOC';
  if (ext === 'pdf') return 'PDF';
  if (['ppt', 'pptx'].includes(ext)) return 'PPT';
  if (['zip', 'rar', '7z'].includes(ext)) return 'ZIP';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'IMG';
  return 'OTHER';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type TabId = 'documents' | 'ai';

export default function DocumentList() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? mockProjects.find((p) => p.id === projectId) : undefined;
  const [tab, setTab] = useState<TabId>('documents');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const [uploadedBlobs, setUploadedBlobs] = useState<Map<string, Blob>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockList = projectId
    ? mockDocuments.filter((d) => d.projectId === projectId)
    : [];
  const documents = [...mockList, ...uploadedDocs];

  const handleDocClick = (doc: Document) => {
    setSelectedDoc(doc);
    if (tab === 'documents') {
      setViewerOpen(true);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !projectId) return;
    const uploader = mockMembers[0];
    for (const file of Array.from(files)) {
      const id = `upload-${Date.now()}-${file.name}`;
      const doc: Document = {
        id,
        projectId,
        name: file.name,
        fileType: getFileType(file.name),
        size: formatSize(file.size),
        uploadedBy: uploader,
        uploadDate: new Date().toISOString(),
      };
      setUploadedDocs((prev) => [...prev, doc]);
      setUploadedBlobs((prev) => new Map(prev).set(id, file));
    }
    e.target.value = '';
  };

  const tabs: { id: TabId; label: string; icon: typeof FileStack }[] = [
    { id: 'documents', label: 'Documents', icon: FileStack },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-0">
      {/* Tabs + Upload */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        {tab === 'documents' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="mt-4 flex flex-1 min-h-0 gap-0">
        {tab === 'documents' && (
          <>
            <div className="flex-1 overflow-y-auto pr-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">File</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Size</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Uploaded by</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => {
                        const Icon = fileTypeIcons[doc.fileType];
                        return (
                          <tr
                            key={doc.id}
                            onClick={() => handleDocClick(doc)}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                  <Icon className="w-5 h-5" strokeWidth={2} />
                                </div>
                                <span className="font-medium text-slate-900">{doc.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-600">{doc.size}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <ProjectMemberAvatar member={doc.uploadedBy} projectMembers={project?.members ?? []} size="sm" />
                                <span className="text-sm text-slate-700">{doc.uploadedBy.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-600">
                              {new Date(doc.uploadDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              {doc.fileUrl ? (
                                <a
                                  href={doc.fileUrl}
                                  download={doc.name}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                  aria-label={`Download ${doc.name}`}
                                >
                                  <Download className="w-4 h-4" strokeWidth={2} />
                                  Download
                                </a>
                              ) : uploadedBlobs.has(doc.id) ? (
                                <a
                                  href={URL.createObjectURL(uploadedBlobs.get(doc.id)!)}
                                  download={doc.name}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                  aria-label={`Download ${doc.name}`}
                                >
                                  <Download className="w-4 h-4" strokeWidth={2} />
                                  Download
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400">
                                  <Download className="w-4 h-4" strokeWidth={2} />
                                  Download
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {documents.length === 0 && (
                  <div className="py-16 text-center text-slate-500">
                    No documents in this project yet.
                  </div>
                )}
              </div>
            </div>
            {projectId && <ChatPanel projectId={projectId} channel="document" />}
          </>
        )}

        {tab === 'ai' && (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <DocumentAIAssistantPage
              documents={documents}
              selectedDoc={selectedDoc}
              onSelectDoc={handleDocClick}
              uploadedBlobs={uploadedBlobs}
            />
          </div>
        )}
      </div>

      {tab === 'documents' && (
        <DocumentViewer
          document={selectedDoc}
          isOpen={viewerOpen}
          onClose={() => { setViewerOpen(false); setSelectedDoc(null); }}
          fileBlob={selectedDoc && uploadedBlobs.has(selectedDoc.id) ? uploadedBlobs.get(selectedDoc.id)! : null}
        />
      )}
    </div>
  );
}
