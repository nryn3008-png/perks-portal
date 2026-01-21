/**
 * Badge component
 * For status indicators, categories, and labels
 */

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={cn(
        // px-2 (8px), py-1 (4px) per DESIGN_SYSTEM.md - 4px exception for badge padding
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
