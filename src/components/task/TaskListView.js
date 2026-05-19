'use client';

import TaskCard from './TaskCard';
import { getStatusColor, getStatusLabel } from '@/constants/task';
import { cn } from '@/lib/utils';

export default function TaskListView({ tasks, onTaskClick }) {
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {});

  const statuses = Object.keys(grouped);

  if (tasks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">No tasks yet. Create one to get started.</p>
    );
  }

  return (
    <div className="space-y-8">
      {statuses.map((status) => (
        <section key={status}>
          <h3
            className={cn(
              'mb-3 inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium',
              getStatusColor(status)
            )}
          >
            {getStatusLabel(status)} ({grouped[status].length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[status].map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
