'use client';

import { Calendar, GripVertical, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TASK_STATUSES,
  formatDueDate,
  getPriorityColor,
  getPriorityLabel,
  isOverdue,
} from '@/constants/task';

export default function TaskCard({
  task,
  onClick,
  draggable = false,
  onDragStart,
  onStatusChange,
  showMobileStatus = false,
}) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className={cn(
        'group w-full rounded-xl border border-zinc-200/80 bg-white p-3 text-left shadow-sm transition-all duration-200',
        'hover:border-zinc-300 hover:shadow-md',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      {showMobileStatus && onStatusChange && (
        <select
          value={task.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(task.id, e.target.value);
          }}
          className="mb-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-medium text-zinc-700 md:hidden"
          aria-label="Change task status"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={onClick}
        draggable={draggable}
        onDragStart={onDragStart}
        className="w-full text-left active:scale-[0.99]"
      >
        <div className="flex items-start gap-2">
          {draggable && (
            <GripVertical className="mt-0.5 hidden h-4 w-4 shrink-0 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 md:block" />
          )}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium text-zinc-900">{task.title}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                  getPriorityColor(task.priority)
                )}
              >
                {getPriorityLabel(task.priority)}
              </span>

              {task.dueDate && (
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
            </div>

            {task.assignee?.name && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{task.assignee.name}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
