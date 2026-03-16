import { Search, Bell, LogOut } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { useAuth } from '@/features/auth';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
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
            placeholder="Search..."
            className="h-10 w-52 rounded-xl border border-[#E8D8CF] bg-[#F8F3EE] pl-9 pr-3 text-sm text-[#1F1F1F] placeholder:text-[#8E857D] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-200 focus:border-[#D97853] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D97853]/16 lg:w-64"
            aria-label="Search"
          />
        </div>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6D6CC] bg-white text-[#4F637F] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#D8C8BE] hover:bg-[#F8F2ED] hover:text-[#163B72]"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden />
          <span
            className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-[#6DBE45]"
            aria-hidden
          />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="rounded-full ring-2 ring-[#DDE7F4]">
            <Avatar name={user?.displayName ?? 'User'} size="sm" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="!h-10 !w-10 !rounded-xl !border !border-[#DCE4F0] !bg-[#EDF3FB] !p-0 !text-[#163B72] hover:!border-[#C8D6E7] hover:!bg-[#E2ECF9]"
            aria-label="Sign out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </header>
  );
}
