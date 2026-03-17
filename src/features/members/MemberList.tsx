import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '@/services';
import { Button, Modal, MemberAvatar } from '@/components/ui';
import { getRoleLabel } from '@/components/ui/RoleIcons';
import { UserPlus, Pencil, LogOut } from 'lucide-react';
import type { ProjectRole } from '@/types';

const CURRENT_USER_ID = 'mem-1';

const ROLE_OPTIONS: { value: ProjectRole; label: string }[] = [
  { value: 'member', label: 'Thành viên' },
  { value: 'leader', label: 'Trưởng nhóm' },
  { value: 'supervisor', label: 'Giám sát' },
];

export default function MemberList() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? projectService.getById(projectId) : null;
  const [members, setMembers] = useState(project?.members ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<ProjectRole>('member');
  const [kickConfirmId, setKickConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (project) setMembers(project.members);
  }, [project?.id]);

  const isCreator = members.some((pm) => pm.member.id === CURRENT_USER_ID && pm.isOwner);
  const canManage = isCreator;

  const handleOpenEdit = (memberId: string, currentRole: ProjectRole) => {
    setEditingId(memberId);
    setEditRole(currentRole);
  };

  const handleSaveRole = () => {
    if (!editingId) return;
    setMembers((prev) => {
      return prev.map((pm) => {
        if (pm.member.id !== editingId) {
          if (editRole === 'leader' && pm.role === 'leader') return { ...pm, role: 'member' };
          return pm;
        }
        return { ...pm, role: editRole };
      });
    });
    setEditingId(null);
  };

  const handleKick = (memberId: string) => {
    const pm = members.find((p) => p.member.id === memberId);
    if (pm?.isOwner) return;
    setMembers((prev) => prev.filter((pm) => pm.member.id !== memberId));
    setKickConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Quản lý thành viên</h2>
        <Button variant="accent" size="md" className="inline-flex items-center gap-2">
          <UserPlus className="w-5 h-5" strokeWidth={2} />
          Mời
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {members.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            Chưa có thành viên trong dự án.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Thành viên
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Vai trò
                  </th>
                  {canManage && (
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {members.map(({ member, role, isOwner }) => (
                    <tr
                      key={member.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar
                            src={member.avatar}
                            name={member.name}
                            isOwner={isOwner}
                            role={role}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">{member.name}</p>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">
                          {getRoleLabel(role, isOwner)}
                        </span>
                      </td>
                      {canManage && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(member.id, role)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="Sửa vai trò"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => setKickConfirmId(member.id)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Xóa khỏi dự án"
                              >
                                <LogOut className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit role modal */}
      <Modal
        isOpen={!!editingId}
        onClose={() => setEditingId(null)}
        title="Sửa vai trò thành viên"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Vai trò</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as ProjectRole)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveRole}>
              Lưu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Kick confirm modal */}
      <Modal
        isOpen={!!kickConfirmId}
        onClose={() => setKickConfirmId(null)}
        title="Xóa thành viên"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Xóa thành viên này khỏi dự án? Người này sẽ mất quyền truy cập toàn bộ nội dung dự án.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setKickConfirmId(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => kickConfirmId && handleKick(kickConfirmId)}
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}