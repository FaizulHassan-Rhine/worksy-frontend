'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TILE_COLORS } from '@/constants/colors';

export default function StatCard({ label, value, icon: Icon, href, color = 'green' }) {
  const palette = TILE_COLORS[color] || TILE_COLORS.green;

  const content = (
    <div
      className={cn(
        'rounded-xl border p-2.5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-3.5',
        palette.tile
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn('text-xs font-medium', palette.subtitle)}>{label}</p>
          <p className={cn('mt-1 text-base font-bold sm:text-lg', palette.title)}>{value}</p>
        </div>
        {Icon && (
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', palette.icon)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
