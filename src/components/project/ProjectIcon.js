'use client';

import {
  FolderKanban,
  Rocket,
  Target,
  Briefcase,
  Code,
  Palette,
  Zap,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorClass } from '@/constants/project';

const ICON_MAP = {
  'folder-kanban': FolderKanban,
  rocket: Rocket,
  target: Target,
  briefcase: Briefcase,
  code: Code,
  palette: Palette,
  zap: Zap,
  star: Star,
};

export default function ProjectIcon({ icon = 'folder-kanban', color = 'blue', size = 'md', className }) {
  const Icon = ICON_MAP[icon] || FolderKanban;
  const sizes = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-12 w-12 rounded-xl',
  };
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center text-white',
        getColorClass(color),
        sizes[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}
