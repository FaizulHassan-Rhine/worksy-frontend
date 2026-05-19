'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TILE_COLORS } from '@/constants/colors';

export default function ColorTile({
  title,
  description,
  icon: Icon,
  color = 'green',
  href,
  onClick,
  className,
  active = false,
}) {
  const palette = TILE_COLORS[color] || TILE_COLORS.green;

  const inner = (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border p-2.5 transition-all duration-200 sm:gap-3 sm:p-3',
        active ? palette.active : palette.tile,
        (href || onClick) && !active && 'cursor-pointer hover:shadow-lg',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
            active ? 'bg-white/20 text-white' : palette.icon
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn('text-xs font-semibold', active ? 'text-white' : palette.title)}>
          {title}
        </p>
        {description && (
          <p
            className={cn(
              'mt-0.5 line-clamp-2 text-[11px] leading-relaxed sm:text-xs',
              active ? 'text-white/85' : palette.subtitle
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return inner;
}