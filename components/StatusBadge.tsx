'use client';

import { getStatusTier } from '@/lib/statusLevel';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  statusLevel: number;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export default function StatusBadge({ statusLevel, size = 'md', showLevel = false }: StatusBadgeProps) {
  const tier = getStatusTier(statusLevel);

  const isAdmin = statusLevel >= 99;
  const isElder = tier.level === 4;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        sizeClasses[size],
        isAdmin
          ? 'bg-crimson-950 border-crimson-700 text-crimson-300 shadow-[0_0_8px_rgba(139,0,0,0.5)]'
          : isElder
          ? 'bg-crimson-950/50 border-crimson-800 text-crimson-400'
          : 'bg-obsidian-700 border-obsidian-500 text-silver-900'
      )}
      style={{ color: !isAdmin ? tier.color : undefined }}
    >
      {isAdmin && (
        <svg className="w-2.5 h-2.5 text-crimson-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
      {tier.title}
      {showLevel && !isAdmin && (
        <span className="opacity-60">Lv.{statusLevel}</span>
      )}
    </span>
  );
}
