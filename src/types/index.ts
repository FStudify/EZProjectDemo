export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CLOSED' | 'ON_HOLD' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type FileType = 'DOC' | 'PDF' | 'PPT' | 'ZIP' | 'IMG' | 'OTHER';

export type ProjectRole = 'leader' | 'supervisor' | 'member';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface ProjectMember {
  member: Member;
  isOwner: boolean;
  role: ProjectRole;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  members: ProjectMember[];
  createdAt: string;
  deadline: string;
  totalTasks: number;
  completedTasks: number;
}

export interface TaskComment {
  id: string;
  content: string;
  author: Member;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Member;
  deadline: string;
  createdAt: string;
  /** IDs of tasks this task depends on */
  dependsOn?: string[];
  comments?: TaskComment[];
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type MeetingType = 'online' | 'offline';

export interface MeetingAttendeeResponse {
  willAttend: boolean;
  declineReason?: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: MeetingType;
  /** For offline: meeting address */
  location?: string;
  /** For online: meeting link (Zoom, Meet, etc.) */
  meetingLink?: string;
  status: MeetingStatus;
  organizer: Member;
  attendees: Member[];
  /** memberId -> response. willAttend true = attending, false = declined with optional reason */
  attendeeResponses?: Record<string, MeetingAttendeeResponse>;
  createdAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  fileType: FileType;
  size: string;
  uploadedBy: Member;
  uploadDate: string;
  /** URL for preview (e.g. /sample.docx) */
  fileUrl?: string;
}

export interface Activity {
  id: string;
  projectId: string;
  user: Member;
  action: string;
  target: string;
  timestamp: string;
}

export type ChatRoomType = 'general' | 'channel' | 'direct';

export interface ChatRoom {
  id: string;
  projectId: string;
  name: string;
  type: ChatRoomType;
  members: Member[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  roomId: string;
  sender: Member | 'ai';
  content: string;
  timestamp: string;
  channel: 'group' | 'task' | 'document' | 'ai';
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface MemberPerformance {
  member: Member;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  documentsUploaded: number;
  commentsCount: number;
  contributions: ContributionDay[];
  score: number;
}

export interface MemberEvaluation {
  memberId: string;
  rating: number;
  feedback: string;
  evaluatedAt: string;
}
