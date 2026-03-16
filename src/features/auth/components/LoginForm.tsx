import type { FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DemoAccountBox from './DemoAccountBox';

interface LoginFormProps {
  username: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  loading: boolean;
  error: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onRememberMeChange: (checked: boolean) => void;
}

export default function LoginForm({
  username,
  password,
  rememberMe,
  showPassword,
  loading,
  error,
  onSubmit,
  onUsernameChange,
  onPasswordChange,
  onToggleShowPassword,
  onRememberMeChange,
}: LoginFormProps) {
  return (
    <div className="animate-ez-fade-up rounded-[24px] border border-[#E8C7AE]/80 bg-[rgba(255,249,244,0.94)] p-5 shadow-[0_28px_60px_-40px_rgba(39,24,16,0.4)] backdrop-blur-xl sm:p-6 lg:p-7">
      <div className="mb-6">
        <h1 className="text-[34px] font-extrabold tracking-tight text-[#1F1F1F]">Sign in</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">Welcome back. Sign in to continue.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-[#1F1F1F]">
            Username
          </label>
          <div className="relative">
            <UserCircle2
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A38A77]"
              aria-hidden
            />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="h-[50px] w-full rounded-2xl border border-[#E8C7AE]/80 bg-[#FFFDF9] pl-12 pr-4 text-[15px] text-[#222222] placeholder:text-[#A38A77] transition-all duration-200 focus:border-[#D97853] focus:bg-[#FFFEFC] focus:outline-none focus:ring-4 focus:ring-[#D97853]/22"
              placeholder="user123"
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#1F1F1F]">
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A38A77]"
              aria-hidden
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="h-[50px] w-full rounded-2xl border border-[#E8C7AE]/80 bg-[#FFFDF9] pl-12 pr-12 text-[15px] text-[#222222] placeholder:text-[#A38A77] transition-all duration-200 focus:border-[#D97853] focus:bg-[#FFFEFC] focus:outline-none focus:ring-4 focus:ring-[#D97853]/22"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#A38A77] transition hover:bg-[#FCE7D6]/65 hover:text-[#D97853] focus:outline-none focus:ring-2 focus:ring-[#D97853]/28"
              onClick={onToggleShowPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => onRememberMeChange(e.target.checked)}
              className="h-4 w-4 rounded border-[#D8C4B5] text-[#6DBE45] focus:ring-2 focus:ring-[#6DBE45]/30"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-semibold text-[#1F1F1F] transition hover:text-[#D97853]"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex h-[50px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#D97853] text-base font-semibold text-white shadow-[0_14px_26px_-16px_rgba(217,120,83,0.78)] transition duration-200 hover:bg-[#C96B48] hover:shadow-[0_18px_30px_-18px_rgba(201,107,72,0.8)] focus:outline-none focus:ring-4 focus:ring-[#D97853]/28 disabled:cursor-not-allowed disabled:opacity-65"
        >
          <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
          <span className="relative">{loading ? 'Signing in...' : 'Sign in'}</span>
        </button>

        <DemoAccountBox />
      </form>

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-[#1F1F1F] transition hover:text-[#D97853] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
