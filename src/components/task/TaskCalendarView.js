'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPriorityColor, getPriorityLabel, getStatusLabel, isOverdue } from '@/constants/task';
import { cn } from '@/lib/utils';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function TaskCalendarView({ tasks, onTaskClick }) {
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { days, tasksByDate, monthLabel } = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const generatedDays = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      generatedDays.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    const grouped = tasks.reduce((acc, task) => {
      if (!task.dueDate) return acc;
      const due = new Date(task.dueDate);
      if (Number.isNaN(due.getTime())) return acc;
      const key = toKey(due);
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        const rank = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4);
      });
    });

    return {
      days: generatedDays,
      tasksByDate: grouped,
      monthLabel: monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    };
  }, [monthDate, tasks]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() =>
              setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="border-b border-zinc-100 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const key = toKey(day);
          const dayTasks = tasksByDate[key] || [];
          const inCurrentMonth = day.getMonth() === monthDate.getMonth();
          const isTodayDate = toKey(day) === toKey(new Date());

          return (
            <div
              key={key}
              className={cn(
                'min-h-[130px] border-b border-r border-zinc-100 p-2 align-top dark:border-zinc-800',
                !inCurrentMonth && 'bg-zinc-50/60 dark:bg-zinc-900/60'
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium',
                    isTodayDate
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-300'
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      'w-full rounded-md border px-1.5 py-1 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800',
                      isOverdue(task.dueDate, task.status)
                        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
                        : 'border-zinc-200/80 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40'
                    )}
                  >
                    <p className="truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-100">
                      {task.title}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                      {getStatusLabel(task.status)} · {getPriorityLabel(task.priority)}
                    </p>
                  </button>
                ))}

                {dayTasks.length > 3 && (
                  <p className={cn('px-1 text-[10px] font-medium', getPriorityColor('low'))}>
                    +{dayTasks.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
