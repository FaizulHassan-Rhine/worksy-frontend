'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusLabel } from '@/constants/project';
import { ROUTES } from '@/constants/routes';
import ProjectIcon from './ProjectIcon';

const statusStyles = {
  planning: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  active: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  on_hold: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  completed: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

export default function ProjectCard({ project }) {
  return (
    <Link
      href={ROUTES.projectDetail(project.id)}
      className={cn(
        'group flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md',
        'dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <ProjectIcon icon={project.icon} color={project.color} size="md" />
        <span
          className={cn(
            'rounded-lg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
            statusStyles[project.status] || statusStyles.planning
          )}
        >
          {getStatusLabel(project.status)}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {project.title}
      </h3>

      {project.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {project.description}
        </p>
      ) : (
        <p className="mt-2 text-sm italic text-zinc-400">No description</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-zinc-200/80 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1 font-medium opacity-0 transition-opacity group-hover:opacity-100">
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
