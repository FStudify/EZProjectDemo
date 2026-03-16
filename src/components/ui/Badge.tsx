import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}

const variantStyles = {
  default: 'bg-slate-200 text-slate-800',
  primary: 'bg-primary-50 text-primary',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export default function Badge({
  variant = 'default',
  children,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        transition-colors duration-150
        ${variantStyles[variant]}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </span>
  );
}
