import { Flame, BookOpen, Pickaxe } from 'lucide-react';
import type { ProjectRole } from '@/types';

interface RoleIconsProps {
  role: ProjectRole;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-5 w-5' };

const ROLE_ICONS: Record<ProjectRole, { Icon: typeof Flame; label: string; color: string }> = {
  leader: { Icon: Flame, label: 'Leader', color: 'text-orange-500' },
  supervisor: { Icon: BookOpen, label: 'Supervisor', color: 'text-blue-600' },
  member: { Icon: Pickaxe, label: 'Member', color: 'text-slate-600' },
};

export function getRoleLabel(role: ProjectRole, isOwner: boolean): string {
  const labels: Record<ProjectRole, string> = {
    leader: 'Leader',
    supervisor: 'Supervisor',
    member: 'Member',
  };
  return isOwner ? `owner + ${labels[role].toLowerCase()}` : labels[role];
}

export default function RoleIcons({ role, size = 'md', className = '' }: RoleIconsProps) {
  const sz = sizeClasses[size];
  const { Icon, label, color } = ROLE_ICONS[role];

  return (
    <span
      className={`inline-flex items-center ${color} ${className}`}
      title={label}
    >
      <Icon className={sz} strokeWidth={2} />
    </span>
  );
}
