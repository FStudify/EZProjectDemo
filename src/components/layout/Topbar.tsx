import { Search, Bell, LogOut } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { useAuth } from '@/features/auth';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-48 rounded-lg border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Search"
          />
        </div>

        <button
          type="button"
          className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger"
            aria-hidden
          />
        </button>

        <div className="flex items-center gap-2">
          <Avatar name={user?.displayName ?? 'User'} size="sm" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="!p-2"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
