'use client';

import { cn } from '@/lib/utils';

export default function Label({ className, children, ...props }) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-zinc-700', className)}
      {...props}
    >
      {children}
    </label>
  );
}
