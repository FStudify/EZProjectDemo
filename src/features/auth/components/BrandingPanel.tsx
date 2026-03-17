import type { LucideIcon } from 'lucide-react';
import { CalendarClock, CheckCircle2, FolderKanban, GraduationCap } from 'lucide-react';

interface BrandingPanelProps {
  compact?: boolean;
}

interface FloatingBadge {
  icon: LucideIcon;
  text: string;
  className: string;
  delay: number;
  greenAccent?: boolean;
  shimmer?: boolean;
}

const floatingBadges: FloatingBadge[] = [
  {
    icon: CheckCircle2,
    text: '12 Nhiệm vụ đã hoàn thành',
    className: 'left-4 top-20 xl:left-8',
    delay: 0,
  },
  {
    icon: FolderKanban,
    text: '3 Dự án đang hoạt động',
    className: 'right-4 top-20 xl:right-10',
    delay: 1.2,
    greenAccent: true,
  },
  {
    icon: GraduationCap,
    text: 'Tiến độ nhóm 78%',
    className: 'left-7 bottom-24 xl:left-12',
    delay: 1.9,
    greenAccent: true,
    shimmer: true,
  },
  {
    icon: CalendarClock,
    text: 'Hạn hạn hôm nay',
    className: 'right-8 bottom-11 xl:right-12',
    delay: 0.7,
  },
];

export default function BrandingPanel({ compact = false }: BrandingPanelProps) {
  if (compact) {
    return (
      <section className="relative z-20 p-0.5">
        <div className="inline-flex items-center gap-2.5 text-[#FFFDF8] drop-shadow-[0_8px_18px_rgba(18,10,7,0.45)]">
          <GraduationCap className="h-6 w-6 text-[#E8B185]" aria-hidden />
          <span className="text-[28px] font-extrabold leading-none tracking-[-0.012em]">EZProject</span>
        </div>

        <h2 className="mt-3.5 max-w-[520px] text-[26px] font-extrabold leading-[1.12] tracking-[-0.01em] text-[#FFFDF8] drop-shadow-[0_8px_18px_rgba(22,14,10,0.5)] sm:text-[31px]">
          Quản lý dự án nhóm một cách rõ ràng
        </h2>

        <p className="mt-2.5 max-w-[500px] text-[16px] leading-relaxed text-[#FCEBDD]">
          Nhiệm vụ, thảo luận và tiến độ - tất cả trong một không gian làm việc cộng tác.
        </p>

        <p className="mt-1.5 max-w-[500px] text-[13px] leading-relaxed text-[#FFE3D0]">
          Xây dựng cho sinh viên muốn làm việc nhóm rõ ràng hơn trong mọi khóa học và hạn chót.
        </p>
      </section>
    );
  }

  return (
    <section className="relative hidden h-full min-h-0 flex-col justify-center lg:flex">
      <div className="pointer-events-none absolute -left-12 top-20 h-52 w-[24rem] rounded-full bg-[rgba(23,18,15,0.1)] blur-3xl" />

      <div className="relative z-20 max-w-[570px] space-y-4.5 pr-6 xl:pr-8">
        <div className="inline-flex items-center gap-3 text-[#FFFDF8] drop-shadow-[0_10px_22px_rgba(18,10,7,0.5)]">
          <GraduationCap className="h-10 w-10 text-[#E8B185]" aria-hidden />
          <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em] xl:text-[56px]">EZProject</span>
        </div>

        <h2 className="whitespace-nowrap text-[26px] font-extrabold leading-[1.1] tracking-[-0.012em] text-[#FFFDF8] drop-shadow-[0_10px_20px_rgba(24,15,11,0.52)] xl:text-[29px]">
          Quản lý dự án nhóm một cách rõ ràng
        </h2>

        <p className="whitespace-nowrap text-[16px] leading-relaxed text-[#FCEBDD] drop-shadow-[0_5px_14px_rgba(24,16,11,0.3)]">
          Nhiệm vụ, thảo luận và tiến độ - tất cả trong một không gian làm việc cộng tác.
        </p>

        <p className="max-w-[500px] text-[15px] leading-relaxed text-[#FFE3D0]">
          Xây dựng cho sinh viên muốn làm việc nhóm rõ ràng hơn trong mọi khóa học và hạn chót.
        </p>
      </div>

      {floatingBadges.map(({ icon: Icon, text, className, delay, greenAccent, shimmer }) => (
        <div
          key={text}
          className={[
            'animate-ez-float absolute z-30 flex items-center gap-3 overflow-hidden rounded-full border border-white/58',
            'bg-[rgba(36,25,20,0.42)] px-3.5 py-1.5 text-[13px] font-semibold text-[#FFFDF8]',
            'shadow-[0_22px_36px_-24px_rgba(10,5,4,0.95)] backdrop-blur-lg',
            greenAccent ? 'ring-1 ring-[#89D364]/62' : '',
            className,
          ].join(' ')}
          style={{ animationDelay: `${delay}s` }}
        >
          {shimmer && (
            <span className="pointer-events-none absolute left-0 top-0 h-px w-full overflow-hidden">
              <span className="animate-ez-green-shimmer block h-full w-20 bg-[linear-gradient(90deg,transparent,rgba(137,211,100,0.95),transparent)]" />
            </span>
          )}

          <Icon className="h-[17px] w-[17px] text-[#E8B185]" aria-hidden />
          <span>{text}</span>

          {greenAccent && (
            <span className="pointer-events-none absolute -right-3 -top-3 inline-flex h-5 w-5 items-center justify-center">
              <span className="animate-ez-green-pulse absolute inline-flex h-5 w-5 rounded-full bg-[#89D364]/52" />
              <span className="relative inline-flex h-3 w-3 rounded-full border border-[#ECF9E5]/85 bg-[#89D364]" />
            </span>
          )}
        </div>
      ))}
    </section>
  );
}