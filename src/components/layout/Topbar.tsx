import { useEffect, useRef, useState } from 'react';
import { Search, Bell, LogOut, UserPen, Mail, UserCircle2 } from 'lucide-react';
import { Avatar, Button, Modal } from '@/components/ui';
import { useAuth } from '@/features/auth';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user, logout, setUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setEmail(user?.email ?? '');
  }, [user?.displayName, user?.email]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', onClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isMenuOpen]);

  const openProfileModal = () => {
    setDisplayName(user?.displayName ?? '');
    setEmail(user?.email ?? '');
    setIsProfileOpen(true);
    setIsMenuOpen(false);
  };

  const handleSaveProfile = () => {
    if (!user) return;

    const nextDisplayName = displayName.trim();
    const nextEmail = email.trim();
    if (!nextDisplayName || !nextEmail) return;

    setUser({
      ...user,
      displayName: nextDisplayName,
      email: nextEmail,
    });
    setIsProfileOpen(false);
  };

  const canSaveProfile =
    !!displayName.trim() &&
    !!email.trim() &&
    (displayName.trim() !== (user?.displayName ?? '') || email.trim() !== (user?.email ?? ''));

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-[#E8D8CF] bg-[#FFFDFB]/95 px-5 backdrop-blur-sm lg:px-7">
        <div className="min-w-0">
          <h1 className="truncate text-[30px] font-extrabold tracking-[-0.02em] text-[#1F1F1F] lg:text-[32px]">{title}</h1>
        </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7E7A76]"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="h-10 w-52 rounded-xl border border-[#E8D8CF] bg-[#F8F3EE] pl-9 pr-3 text-sm text-[#1F1F1F] placeholder:text-[#8E857D] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-200 focus:border-[#D97853] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D97853]/16 lg:w-64"
            aria-label="Tìm kiếm"
          />
        </div>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6D6CC] bg-white text-[#4F637F] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#D8C8BE] hover:bg-[#F8F2ED] hover:text-[#163B72]"
          aria-label="Thông báo"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden />
          <span
            className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-[#6DBE45]"
            aria-hidden
          />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-full ring-2 ring-[#DDE7F4] transition-all hover:ring-[#C8DAEE] focus:outline-none focus:ring-4 focus:ring-[#D97853]/18"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="Mở menu tài khoản"
          >
            <Avatar name={user?.displayName ?? 'User'} size="sm" />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-[#E8D8CF] bg-white p-1.5 shadow-lg"
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-[#FFF3EC] hover:text-[#B95E3D]"
                onClick={openProfileModal}
                role="menuitem"
              >
                <UserPen className="h-4 w-4" />
                Sửa hồ sơ
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-[#FFF3EC] hover:text-[#B95E3D]"
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      </header>

      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Sửa hồ sơ"
        size="sm"
        panelClassName="!rounded-2xl !border !border-[#E8D8CF] !bg-[#FFFDFB]"
        headerClassName="!border-b-[#F1E3DA] !bg-gradient-to-r !from-[#FFF7F2] !to-[#FFFDFB]"
        titleClassName="!text-[#2A2725]"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#EEDFD4] bg-gradient-to-r from-[#FFF5EF] to-[#FFFDFB] p-3.5">
            <div className="flex items-center gap-3">
              <div className="rounded-full ring-2 ring-[#E7D7CD] ring-offset-2 ring-offset-[#FFF8F3]">
                <Avatar name={displayName || user?.displayName || 'User'} size="lg" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#2B2826]">{displayName || user?.displayName || 'User'}</p>
                <p className="truncate text-xs text-[#7D6F66]">{email || user?.email || 'Chưa đặt email'}</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="topbar-display-name" className="mb-1.5 block text-sm font-medium text-[#4B433D]">
              Tên hiển thị
            </label>
            <div className="relative">
              <UserCircle2
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A98F80]"
                aria-hidden
              />
              <input
                id="topbar-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tên hiển thị của bạn"
                className="h-11 w-full rounded-xl border border-[#E3D4C9] bg-white pl-9 pr-3 text-sm text-[#2C2825] placeholder:text-[#B7A79C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)] focus:border-[#D97853] focus:outline-none focus:ring-4 focus:ring-[#D97853]/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="topbar-email" className="mb-1.5 block text-sm font-medium text-[#4B433D]">
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A98F80]"
                aria-hidden
              />
              <input
                id="topbar-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="h-11 w-full rounded-xl border border-[#E3D4C9] bg-white pl-9 pr-3 text-sm text-[#2C2825] placeholder:text-[#B7A79C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)] focus:border-[#D97853] focus:outline-none focus:ring-4 focus:ring-[#D97853]/15"
              />
            </div>
            <p className="mt-1.5 text-xs text-[#9A8A80]">Các thay đổi hồ sơ được lưu vào phiên địa phương hiện tại của bạn.</p>
          </div>

          <div className="flex justify-end gap-2 pt-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProfileOpen(false)}
              className="!rounded-xl !border-[#DFCEC2] !text-[#6A5E56] hover:!bg-[#F7EFEA]"
            >
              Hủy
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleSaveProfile}
              disabled={!canSaveProfile}
              className="!rounded-xl !px-4"
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
