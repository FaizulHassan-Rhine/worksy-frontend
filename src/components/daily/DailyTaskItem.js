'use client';

import { useState } from 'react';
import { Calendar, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatDueDate,
  getPriorityColor,
  getPriorityLabel,
  isOverdue,
} from '@/constants/task';

export default function DailyTaskItem({ task, onComplete, onClick, showDueDate = false }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);

  const handleComplete = async (e) => {
    e.stopPropagation();
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border border-zinc-200/80 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200',
        'hover:border-zinc-300 hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
    >
      <button
        type="button"
        onClick={handleComplete}
        disabled={isCompleting}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          'border-zinc-300 text-transparent hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600',
          'group-hover:border-zinc-400',
          isCompleting && 'pointer-events-none opacity-50'
        )}
        aria-label={`Mark "${task.title}" complete`}
      >
        {isCompleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
        ) : (
          <Check className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              getPriorityColor(task.priority)
            )}
          >
            {getPriorityLabel(task.priority)}
          </span>
          {showDueDate && task.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px]',
                overdue ? 'text-red-600' : 'text-zinc-500'
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {task.assignee?.name && (
            <span className="text-[11px] text-zinc-400">{task.assignee.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
