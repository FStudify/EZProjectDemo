import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Video,
  Plus,
  Calendar,
  MapPin,
  Link,
  Users,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { mockMeetings, mockMembers, mockProjects } from '@/mocks';
import type { Meeting, MeetingStatus } from '@/types';
import { Button, Modal, ProjectMemberAvatar } from '@/components/ui';

const CURRENT_USER_ID = mockMembers[0].id;

const STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_VARIANTS: Record<MeetingStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MeetingList() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? mockProjects.find((p) => p.id === projectId) : undefined;
  const projectMembers = project?.members ?? [];

  const [meetings, setMeetings] = useState<Meeting[]>(() =>
    mockMeetings.filter((m) => m.projectId === projectId),
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [detailMeeting, setDetailMeeting] = useState<Meeting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Meeting | null>(null);

  const handleAdd = (meeting: Meeting) => {
    setMeetings((prev) => [...prev, meeting]);
    setIsAddOpen(false);
  };

  const handleUpdate = (updated: Meeting) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m)),
    );
    setEditingMeeting(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setMeetings((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleConfirmAttendance = (meeting: Meeting, willAttend: boolean, declineReason?: string) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meeting.id
          ? {
              ...m,
              attendeeResponses: {
                ...m.attendeeResponses,
                [CURRENT_USER_ID]: { willAttend, declineReason },
              },
            }
          : m,
      ),
    );
    setDeclineTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Meetings</h2>
          <p className="text-sm text-slate-600">
            Schedule and manage project meetings
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Meeting
        </Button>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <Video className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No meetings yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Create a meeting to schedule team discussions
          </p>
          <Button
            variant="accent"
            size="sm"
            className="mt-4"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Meeting
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const myResponse = meeting.attendeeResponses?.[CURRENT_USER_ID];
            const isInvited = meeting.attendees.some((a) => a.id === CURRENT_USER_ID);
            return (
            <article
              key={meeting.id}
              onClick={() => setDetailMeeting(meeting)}
              className="relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {meeting.type === 'online' && (
                <span
                  className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm"
                  title="Online meeting"
                  aria-hidden
                />
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {meeting.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANTS[meeting.status]}`}
                    >
                      {STATUS_LABELS[meeting.status]}
                    </span>
                  </div>
                  {meeting.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(meeting.startTime)} –{' '}
                      {new Date(meeting.endTime).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {meeting.type === 'offline' && meeting.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {meeting.location}
                      </span>
                    )}
                    {meeting.type === 'online' && meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Link className="h-4 w-4" />
                        {meeting.meetingLink}
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Organizer:</span>
                    <ProjectMemberAvatar
                      member={meeting.organizer}
                      projectMembers={projectMembers}
                      size="sm"
                    />
                    <span className="text-sm text-slate-700">
                      {meeting.organizer.name}
                    </span>
                    {meeting.attendees.length > 1 && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        +{meeting.attendees.length - 1} attendees
                      </span>
                    )}
                  </div>
                  {isInvited && meeting.status !== 'cancelled' && (
                    <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant={myResponse?.willAttend ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleConfirmAttendance(meeting, true)}
                      >
                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                        Tham gia
                      </Button>
                      <Button
                        variant={myResponse?.willAttend === false ? 'danger' : 'ghost'}
                        size="sm"
                        onClick={() => setDeclineTarget(meeting)}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Không tham gia
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setEditingMeeting(meeting)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    aria-label="Edit meeting"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(meeting)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    aria-label="Delete meeting"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
          })}
        </div>
      )}

      {/* Add Meeting Modal */}
      <AddMeetingModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
        projectId={projectId ?? ''}
        members={projectMembers.map((pm) => pm.member)}
      />

      {/* Edit Meeting Modal */}
      {editingMeeting && (
        <EditMeetingModal
          meeting={editingMeeting}
          isOpen={!!editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onSave={handleUpdate}
          members={projectMembers.map((pm) => pm.member)}
        />
      )}

      {/* Meeting Detail Modal */}
      {detailMeeting && (
        <MeetingDetailModal
          meeting={detailMeeting}
          isOpen={!!detailMeeting}
          onClose={() => setDetailMeeting(null)}
          onEdit={() => {
            setDetailMeeting(null);
            setEditingMeeting(detailMeeting);
          }}
          projectMembers={projectMembers}
        />
      )}

      {/* Decline reason popup */}
      {declineTarget && (
        <DeclineMeetingModal
          meeting={declineTarget}
          isOpen={!!declineTarget}
          onClose={() => setDeclineTarget(null)}
          onConfirm={(reason) => handleConfirmAttendance(declineTarget, false, reason)}
        />
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Meeting"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-slate-600">
              Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

interface MeetingDetailModalProps {
  meeting: Meeting;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  projectMembers: import('@/types').ProjectMember[];
}

function MeetingDetailModal({
  meeting,
  isOpen,
  onClose,
  onEdit,
  projectMembers,
}: MeetingDetailModalProps) {
  const attending = meeting.attendees.filter(
    (a) => meeting.attendeeResponses?.[a.id]?.willAttend === true,
  );
  const declined = meeting.attendees.filter(
    (a) => meeting.attendeeResponses?.[a.id]?.willAttend === false,
  );
  const pending = meeting.attendees.filter(
    (a) => meeting.attendeeResponses?.[a.id] === undefined,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meeting.title} size="lg">
      <div className="space-y-5">
        {meeting.type === 'online' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Online
          </span>
        )}
        {meeting.description && (
          <div>
            <h4 className="mb-1 text-sm font-semibold text-slate-700">Mô tả</h4>
            <p className="text-sm text-slate-600">{meeting.description}</p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <h4 className="mb-1 text-sm font-semibold text-slate-700">Thời gian</h4>
            <p className="text-sm text-slate-600">
              {formatDateTime(meeting.startTime)} –{' '}
              {new Date(meeting.endTime).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {meeting.type === 'offline' && meeting.location && (
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-700">Địa điểm</h4>
              <p className="flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-4 w-4 shrink-0" />
                {meeting.location}
              </p>
            </div>
          )}
          {meeting.type === 'online' && meeting.meetingLink && (
            <div>
              <h4 className="mb-1 text-sm font-semibold text-slate-700">Link họp</h4>
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Link className="h-4 w-4 shrink-0" />
                {meeting.meetingLink}
              </a>
            </div>
          )}
        </div>
        <div>
          <h4 className="mb-1 text-sm font-semibold text-slate-700">Người tổ chức</h4>
          <div className="flex items-center gap-2">
            <ProjectMemberAvatar
              member={meeting.organizer}
              projectMembers={projectMembers}
              size="sm"
            />
            <span className="text-sm text-slate-700">{meeting.organizer.name}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            Thành viên tham gia ({attending.length})
          </h4>
          {attending.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có ai xác nhận tham gia</p>
          ) : (
            <ul className="space-y-2">
              {attending.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <ProjectMemberAvatar member={m} projectMembers={projectMembers} size="sm" />
                  <span className="text-sm text-slate-700">{m.name}</span>
                  <CheckCircle className="ml-auto h-4 w-4 text-emerald-500" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {pending.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">
              Chưa phản hồi ({pending.length})
            </h4>
            <ul className="space-y-2">
              {pending.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-slate-500">
                  <ProjectMemberAvatar member={m} projectMembers={projectMembers} size="sm" />
                  <span className="text-sm">{m.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-slate-200 pt-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            Thành viên không tham gia ({declined.length})
          </h4>
          {declined.length === 0 ? (
            <p className="text-sm text-slate-500">Không có</p>
          ) : (
            <ul className="space-y-3">
              {declined.map((m) => {
                const resp = meeting.attendeeResponses?.[m.id];
                const reason = resp?.declineReason;
                return (
                  <li key={m.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center gap-2">
                      <ProjectMemberAvatar member={m} projectMembers={projectMembers} size="sm" />
                      <span className="text-sm font-medium text-slate-700">{m.name}</span>
                      <XCircle className="ml-auto h-4 w-4 text-rose-500" />
                    </div>
                    {reason && (
                      <p className="mt-2 pl-10 text-sm text-slate-600 italic">
                        Lý do: {reason}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={onEdit}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface DeclineMeetingModalProps {
  meeting: Meeting;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function DeclineMeetingModal({
  meeting,
  isOpen,
  onClose,
  onConfirm,
}: DeclineMeetingModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Không tham gia cuộc họp">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Bạn có chắc không tham gia &ldquo;{meeting.title}&rdquo;? Vui lòng ghi lý do (tùy chọn).
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Lý do</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Bận công việc khác, Đã có lịch trùng..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleSubmit}>
            Xác nhận không tham gia
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meeting: Meeting) => void;
  projectId: string;
  members: import('@/types').Member[];
}

function AddMeetingModal({
  isOpen,
  onClose,
  onAdd,
  projectId,
  members,
}: AddMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingType, setMeetingType] = useState<'online' | 'offline'>('online');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [organizerId, setOrganizerId] = useState(members[0]?.id ?? '');
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title.trim() || !startTime || !endTime || !organizerId) return;
    if (meetingType === 'offline' && !location.trim()) return;
    if (meetingType === 'online' && !meetingLink.trim()) return;
    const organizer = members.find((m) => m.id === organizerId) ?? members[0];
    const attendees = members.filter((m) =>
      attendeeIds.includes(m.id) || m.id === organizerId,
    );
    const meeting: Meeting = {
      id: `meet-${Date.now()}`,
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      type: meetingType,
      location: meetingType === 'offline' ? location.trim() : undefined,
      meetingLink: meetingType === 'online' ? meetingLink.trim() : undefined,
      status: 'scheduled',
      organizer,
      attendees: attendees.length > 0 ? attendees : [organizer],
      createdAt: new Date().toISOString(),
    };
    onAdd(meeting);
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setMeetingLink('');
    setAttendeeIds([]);
    onClose();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Meeting" size="lg">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title..."
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agenda, notes..."
            rows={2}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Start *</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>End *</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Location type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="meetingType"
                checked={meetingType === 'online'}
                onChange={() => setMeetingType('online')}
                className="rounded-full border-slate-300"
              />
              <span className="text-sm">Online</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="meetingType"
                checked={meetingType === 'offline'}
                onChange={() => setMeetingType('offline')}
                className="rounded-full border-slate-300"
              />
              <span className="text-sm">Offline</span>
            </label>
          </div>
        </div>
        {meetingType === 'online' ? (
          <div>
            <label className={labelClass}>Meeting link *</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className={inputClass}
            />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Address *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room, building, full address..."
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className={labelClass}>Organizer *</label>
          <select
            value={organizerId}
            onChange={(e) => setOrganizerId(e.target.value)}
            className={inputClass}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Attendees</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const checked = attendeeIds.includes(m.id) || m.id === organizerId;
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={m.id === organizerId}
                    onChange={(e) => {
                      if (m.id === organizerId) return;
                      setAttendeeIds((prev) =>
                        e.target.checked
                          ? [...prev, m.id]
                          : prev.filter((id) => id !== m.id),
                      );
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">{m.name}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              !title.trim() ||
              !startTime ||
              !endTime ||
              (meetingType === 'offline' && !location.trim()) ||
              (meetingType === 'online' && !meetingLink.trim())
            }
          >
            Create Meeting
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface EditMeetingModalProps {
  meeting: Meeting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
  members: import('@/types').Member[];
}

function EditMeetingModal({
  meeting,
  isOpen,
  onClose,
  onSave,
  members,
}: EditMeetingModalProps) {
  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description ?? '');
  const [startTime, setStartTime] = useState(
    meeting.startTime.slice(0, 16),
  );
  const [endTime, setEndTime] = useState(meeting.endTime.slice(0, 16));
  const [meetingType, setMeetingType] = useState<'online' | 'offline'>(meeting.type);
  const [location, setLocation] = useState(meeting.location ?? '');
  const [meetingLink, setMeetingLink] = useState(meeting.meetingLink ?? '');
  const [status, setStatus] = useState<MeetingStatus>(meeting.status);
  const [organizerId, setOrganizerId] = useState(meeting.organizer.id);
  const [attendeeIds, setAttendeeIds] = useState<string[]>(
    meeting.attendees.map((a) => a.id),
  );

  useEffect(() => {
    setTitle(meeting.title);
    setDescription(meeting.description ?? '');
    setStartTime(meeting.startTime.slice(0, 16));
    setEndTime(meeting.endTime.slice(0, 16));
    setMeetingType(meeting.type);
    setLocation(meeting.location ?? '');
    setMeetingLink(meeting.meetingLink ?? '');
    setStatus(meeting.status);
    setOrganizerId(meeting.organizer.id);
    setAttendeeIds(meeting.attendees.map((a) => a.id));
  }, [meeting]);

  const handleSubmit = () => {
    const organizer = members.find((m) => m.id === organizerId) ?? meeting.organizer;
    const attendees = members.filter((m) =>
      attendeeIds.includes(m.id) || m.id === organizerId,
    );
    onSave({
      ...meeting,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      type: meetingType,
      location: meetingType === 'offline' ? location.trim() : undefined,
      meetingLink: meetingType === 'online' ? meetingLink.trim() : undefined,
      status,
      organizer,
      attendees: attendees.length > 0 ? attendees : [organizer],
    });
    onClose();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Meeting" size="lg">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Start *</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>End *</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Location type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="meetingTypeEdit"
                checked={meetingType === 'online'}
                onChange={() => setMeetingType('online')}
                className="rounded-full border-slate-300"
              />
              <span className="text-sm">Online</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="meetingTypeEdit"
                checked={meetingType === 'offline'}
                onChange={() => setMeetingType('offline')}
                className="rounded-full border-slate-300"
              />
              <span className="text-sm">Offline</span>
            </label>
          </div>
        </div>
        {meetingType === 'online' ? (
          <div>
            <label className={labelClass}>Meeting link *</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className={inputClass}
            />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Address *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room, building, full address..."
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MeetingStatus)}
            className={inputClass}
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Organizer</label>
          <select
            value={organizerId}
            onChange={(e) => setOrganizerId(e.target.value)}
            className={inputClass}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
