'use client';

import { cn } from '@/lib/utils';

const variants = {
  personal: 'bg-blue-50 text-blue-700 border-blue-100',
  team: 'bg-violet-50 text-violet-700 border-violet-100',
  default: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
