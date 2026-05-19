'use client';

import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('mb-3', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-sm font-semibold text-zinc-900 dark:text-zinc-50', className)}>{children}</h3>;
}

export function CardDescription({ className, children }) {
  return <p className={cn('text-xs text-zinc-500 dark:text-zinc-400', className)}>{children}</p>;
}

export function CardContent({ className, children }) {
  return <div className={cn('', className)}>{children}</div>;
}
