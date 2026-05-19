'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-9 text-xs px-3',
};

const Select = forwardRef(function Select(
  {
    value = '',
    onChange,
    onBlur,
    name,
    options = [],
    placeholder,
    disabled = false,
    className,
    size = 'md',
    id,
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const displayLabel = selected?.label ?? placeholder ?? 'Select...';
  const showPlaceholder = !selected && (value === '' || value === undefined || value === null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        if (open) {
          setOpen(false);
          onBlur?.();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onBlur]);

  const emitChange = (nextValue) => {
    onChange?.({ target: { value: nextValue, name } });
    setOpen(false);
    onBlur?.();
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <input type="hidden" ref={ref} name={name} value={value ?? ''} readOnly tabIndex={-1} />

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white',
          'text-zinc-900 transition-all duration-200',
          'hover:border-zinc-300 hover:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-600',
          open && 'border-zinc-300 shadow-sm dark:border-zinc-600',
          sizes[size],
          showPlaceholder && 'text-zinc-500 dark:text-zinc-400'
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute left-0 right-0 z-50 mt-1.5 max-h-56 overflow-y-auto rounded-xl p-1',
              'border border-zinc-200/80 bg-white shadow-lg',
              'dark:border-zinc-700 dark:bg-zinc-900'
            )}
          >
            {placeholder && (
              <li role="option" aria-selected={showPlaceholder}>
                <button
                  type="button"
                  onClick={() => emitChange('')}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    showPlaceholder
                      ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
                  )}
                >
                  <span>{placeholder}</span>
                  {showPlaceholder && <Check className="h-4 w-4 shrink-0 text-zinc-600" />}
                </button>
              </li>
            )}
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => emitChange(opt.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-green-50 font-medium text-green-900 dark:bg-green-950/50 dark:text-green-200'
                        : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Select;
