import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { AtSign, Eye, EyeOff, LockKeyhole, UserCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { register } from './authService';
import BrandingPanel from './components/BrandingPanel';

interface RegisterInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  icon: LucideIcon;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  toggleButton?: {
    onClick: () => void;
    label: string;
    icon: ReactNode;
  };
}

function RegisterInput({
  id,
  label,
  type,
  value,
  placeholder,
  icon: Icon,
  onChange,
  autoComplete,
  required,
  minLength,
  toggleButton,
}: RegisterInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[#1F1F1F]">
        {label}
      </label>

      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#A38A77]"
          aria-hidden
        />

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-[#E8C7AE]/80 bg-[#FFFDF9] pl-10 pr-11 text-[14px] text-[#222222] placeholder:text-[#A38A77] transition-all duration-200 focus:border-[#D97853] focus:bg-[#FFFEFC] focus:outline-none focus:ring-4 focus:ring-[#D97853]/22"
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
        />

        {toggleButton && (
          <button
            type="button"
            className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#A38A77] transition hover:bg-[#FCE7D6]/65 hover:text-[#D97853] focus:outline-none focus:ring-2 focus:ring-[#D97853]/28"
            onClick={toggleButton.onClick}
            aria-label={toggleButton.label}
          >
            {toggleButton.icon}
          </button>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    if (password.length < 3) {
      setError('Mật khẩu phải có ít nhất 3 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(username, password, displayName || username, email || `${username}@example.com`);
      if (user) {
        setUser(user);
        navigate('/', { replace: true });
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch {
      setError('Đã xảy ra lỗi không mong muốn.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ez-login-shell relative h-[100dvh] overflow-y-auto bg-[#FFF8F3] lg:overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src="/login.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(27,18,13,0.56)_0%,rgba(81,50,30,0.42)_28%,rgba(243,111,33,0.24)_52%,rgba(35,27,22,0.66)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_34%,rgba(21,14,10,0.46),transparent_44%),radial-gradient(circle_at_14%_16%,rgba(255,248,243,0.3),transparent_30%),radial-gradient(circle_at_80%_22%,rgba(246,165,107,0.22),transparent_34%),radial-gradient(circle_at_72%_16%,rgba(109,190,69,0.16),transparent_22%),radial-gradient(circle_at_20%_84%,rgba(50,39,33,0.26),transparent_45%)]" />

      <div className="relative z-20 mx-auto grid h-full w-full max-w-[1320px] grid-cols-1 items-center gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8 lg:px-8 lg:py-5 xl:py-6">
        <div className="lg:hidden">
          <BrandingPanel compact />
        </div>

        <BrandingPanel />

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[620px]">
            <div className="animate-ez-fade-up rounded-[24px] border border-[#E8C7AE]/80 bg-[rgba(255,249,244,0.95)] p-5 shadow-[0_28px_60px_-40px_rgba(39,24,16,0.42)] backdrop-blur-xl sm:p-6 lg:p-6">
              <div className="mb-4">
                <h1 className="text-[31px] font-extrabold leading-tight tracking-tight text-[#1F1F1F]">Đăng ký</h1>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
                  Tạo tài khoản của bạn để bắt đầu cộng tác thông minh hơn.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3">
                  <RegisterInput
                    id="username"
                    label="Tên đăng nhập"
                    type="text"
                    value={username}
                    onChange={setUsername}
                    placeholder="username"
                    required
                    autoComplete="username"
                    icon={UserCircle2}
                  />

                  <RegisterInput
                    id="displayName"
                    label="Họ và tên"
                    type="text"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="John Doe"
                    autoComplete="name"
                    icon={UserCircle2}
                  />

                  <div className="md:col-span-2">
                    <RegisterInput
                      id="email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="email@example.com"
                      autoComplete="email"
                      icon={AtSign}
                    />
                  </div>

                  <RegisterInput
                    id="password"
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    required
                    minLength={3}
                    autoComplete="new-password"
                    icon={LockKeyhole}
                    toggleButton={{
                      onClick: () => setShowPassword((prev) => !prev),
                      label: showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu',
                      icon: showPassword ? (
                        <EyeOff className="h-[17px] w-[17px]" />
                      ) : (
                        <Eye className="h-[17px] w-[17px]" />
                      ),
                    }}
                  />

                  <RegisterInput
                    id="confirmPassword"
                    label="Xác nhận mật khẩu"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    icon={LockKeyhole}
                    toggleButton={{
                      onClick: () => setShowConfirmPassword((prev) => !prev),
                      label: showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiển thị mật khẩu xác nhận',
                      icon: showConfirmPassword ? (
                        <EyeOff className="h-[17px] w-[17px]" />
                      ) : (
                        <Eye className="h-[17px] w-[17px]" />
                      ),
                    }}
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex h-[46px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#D97853] text-[15px] font-semibold text-white shadow-[0_14px_26px_-16px_rgba(217,120,83,0.78)] transition duration-200 hover:bg-[#C96B48] hover:shadow-[0_18px_30px_-18px_rgba(201,107,72,0.8)] focus:outline-none focus:ring-4 focus:ring-[#D97853]/28 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
                  <span className="relative">{loading ? 'Đang đăng ký...' : 'Đăng ký'}</span>
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-[#6B7280]">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#1F1F1F] transition hover:text-[#D97853] hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
