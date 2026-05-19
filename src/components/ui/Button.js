'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm hover:shadow-md active:scale-[0.98]',
  secondary:
    'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm hover:shadow-md active:scale-[0.98]',
  ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 active:scale-[0.98]',
};

const sizes = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-xs',
  lg: 'h-10 px-4 text-sm',
};

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
