'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { TASK_STATUSES, getStatusColor, getStatusLabel } from '@/constants/task';
import { cn } from '@/lib/utils';

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const tasksByStatus = TASK_STATUSES.reduce((acc, col) => {
    acc[col.value] = tasks.filter((t) => t.status === col.value);
    return acc;
  }, {});

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDraggingId(null);
    setDragOverColumn(null);

    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== status) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="-mx-3 min-w-0 overflow-x-auto px-3 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
      <div className="flex gap-3 sm:gap-4">
        {TASK_STATUSES.map((column) => {
          const columnTasks = tasksByStatus[column.value] || [];
          const isOver = dragOverColumn === column.value;

          return (
            <div
              key={column.value}
              className="flex w-[min(280px,82vw)] shrink-0 snap-start flex-col sm:w-72"
              onDragOver={(e) => handleDragOver(e, column.value)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, column.value)}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <span
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-medium',
                    getStatusColor(column.value)
                  )}
                >
                  {getStatusLabel(column.value)}
                </span>
                <span className="text-xs text-zinc-400">{columnTasks.length}</span>
              </div>

              <div
                className={cn(
                  'flex min-h-[120px] flex-1 flex-col gap-2 rounded-2xl border border-dashed p-2 transition-colors',
                  isOver ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200/80 bg-zinc-50/50'
                )}
              >
                {columnTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={false}
                    animate={{ opacity: draggingId === task.id ? 0.5 : 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TaskCard
                      task={task}
                      draggable
                      showMobileStatus
                      onStatusChange={onStatusChange}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick(task)}
                    />
                  </motion.div>
                ))}

                {columnTasks.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-zinc-400">
                    <span className="md:hidden">No tasks</span>
                    <span className="hidden md:inline">Drop tasks here</span>
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

