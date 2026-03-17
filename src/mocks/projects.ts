import type { Project } from '../types';
import { mockMembers } from './members';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Trang web thương mại điện tử',
    description: 'Xây dựng nền tảng thương mại điện tử full-stack với danh mục sản phẩm, giỏ hàng và thanh toán.',
    progress: 60,
    members: [
      { member: mockMembers[0], isOwner: true, role: 'leader' },
      { member: mockMembers[1], isOwner: false, role: 'member' },
      { member: mockMembers[2], isOwner: false, role: 'member' },
    ],
    createdAt: '2026-01-15T09:00:00Z',
    deadline: '2026-04-30T23:59:59Z',
    totalTasks: 10,
    completedTasks: 6,
  },
  {
    id: 'proj-2',
    name: 'Thiết kế ứng dụng di động',
    description: 'Thiết kế UI/UX cho ứng dụng di động theo dõi sức khỏe.',
    progress: 35,
    members: [
      { member: mockMembers[0], isOwner: true, role: 'leader' },
      { member: mockMembers[3], isOwner: false, role: 'supervisor' },
      { member: mockMembers[4], isOwner: false, role: 'member' },
    ],
    createdAt: '2026-02-01T10:30:00Z',
    deadline: '2026-05-15T23:59:59Z',
    totalTasks: 8,
    completedTasks: 3,
  },
  {
    id: 'proj-3',
    name: 'Bài báo nghiên cứu',
    description: 'Viết và xuất bản bài báo nghiên cứu về học máy trong y tế.',
    progress: 80,
    members: [
      { member: mockMembers[1], isOwner: true, role: 'leader' },
      { member: mockMembers[2], isOwner: false, role: 'member' },
      { member: mockMembers[3], isOwner: false, role: 'supervisor' },
    ],
    createdAt: '2026-01-20T14:00:00Z',
    deadline: '2026-03-25T23:59:59Z',
    totalTasks: 5,
    completedTasks: 4,
  },
];
