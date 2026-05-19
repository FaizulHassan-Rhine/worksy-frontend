'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border bg-white px-3 text-xs text-zinc-900',
        'placeholder:text-zinc-400 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:border-zinc-300',
        error ? 'border-red-300 focus-visible:ring-red-200' : 'border-zinc-200',
        className
      )}
      {...props}
    />
  );
});

export default Input;
