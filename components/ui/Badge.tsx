import { cn } from '@/lib/utils';

type BadgeVariant = 'crimson' | 'gray' | 'green' | 'yellow' | 'red' | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  crimson: 'bg-crimson-950 text-crimson-300 border border-crimson-800',
  gray: 'bg-obsidian-600 text-silver-900 border border-obsidian-500',
  green: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  yellow: 'bg-yellow-950 text-yellow-400 border border-yellow-800',
  red: 'bg-red-950 text-red-400 border border-red-800',
  gold: 'bg-yellow-900/30 text-yellow-300 border border-yellow-600',
};

export default function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
