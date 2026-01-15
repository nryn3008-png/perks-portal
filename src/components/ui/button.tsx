/**
 * Button component
 * Reusable button with multiple variants and sizes
 * WCAG 2.1 AA compliant with keyboard navigation and visible focus states
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles = [
      // Layout
      'inline-flex items-center justify-center gap-2',
      // Typography
      'font-medium',
      // Shape
      'rounded-lg',
      // Transitions
      'transition-colors duration-150',
      // Focus: use focus-visible for keyboard-only focus ring
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      // Disabled: use cursor and reduced opacity
      'disabled:cursor-not-allowed disabled:opacity-60',
    ].join(' ');

    const variants = {
      primary: [
        'bg-brand-600 text-white',
        'hover:bg-brand-700',
        'active:bg-brand-800',
        'focus-visible:ring-brand-500',
      ].join(' '),
      secondary: [
        'bg-slate-100 text-slate-900',
        'hover:bg-slate-200',
        'active:bg-slate-300',
        'focus-visible:ring-slate-500',
      ].join(' '),
      outline: [
        'border border-slate-300 bg-white text-slate-700',
        'hover:bg-slate-50 hover:text-slate-900',
        'active:bg-slate-100',
        'focus-visible:ring-slate-500',
      ].join(' '),
      ghost: [
        'bg-transparent text-slate-700',
        'hover:bg-slate-100 hover:text-slate-900',
        'active:bg-slate-200',
        'focus-visible:ring-slate-500',
      ].join(' '),
      destructive: [
        'bg-red-600 text-white',
        'hover:bg-red-700',
        'active:bg-red-800',
        'focus-visible:ring-red-500',
      ].join(' '),
    };

    // Minimum touch target: 44px (h-11). Adequate padding for all sizes.
    const sizes = {
      sm: 'min-h-[36px] px-3 text-sm',
      md: 'min-h-[44px] px-4 text-sm',
      lg: 'min-h-[48px] px-6 text-base',
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
