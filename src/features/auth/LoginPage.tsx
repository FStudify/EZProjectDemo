import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import BrandingPanel from './components/BrandingPanel';
import LoginForm from './components/LoginForm';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) {
        navigate(from, { replace: true });
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
      }
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

      <div className="relative z-20 mx-auto grid h-full w-full max-w-[1320px] grid-cols-1 items-center gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-8 lg:py-6 xl:py-7">
        <div className="lg:hidden">
          <BrandingPanel compact />
        </div>

        <BrandingPanel />

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[500px]">
            <LoginForm
              username={username}
              password={password}
              rememberMe={rememberMe}
              showPassword={showPassword}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onToggleShowPassword={() => setShowPassword((prev) => !prev)}
              onRememberMeChange={setRememberMe}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
