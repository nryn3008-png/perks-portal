/**
 * Button component - Arch Design System
 *
 * Implements the unified button design from Figma:
 * https://www.figma.com/design/Jwlx9tJxTcGZW9cB9onSHz/Arch-Design-System?node-id=15543-99065
 *
 * Variants: primary, secondary, outline, ghost, destructive
 * Sizes: sm (default), lg (use sparingly with justification)
 *
 * SIZE RULES:
 * - size="sm" is the DEFAULT for all buttons
 * - size="lg" should ONLY be used for hero CTAs with explicit comment justification
 *
 * VARIANT RULES:
 * - variant="primary" is for the SINGLE most important action on a page/section
 * - Never use multiple primary buttons in the same visual group
 * - Use secondary/outline/ghost for all other actions
 *
 * WCAG 2.1 AA compliant with keyboard navigation and visible focus states
 */

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseButtonProps {}

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement>, BaseButtonProps {
  href: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (Arch Design System)
// ─────────────────────────────────────────────────────────────────────────────

const baseStyles = [
  // Layout - gap-2 (8px) per DESIGN_SYSTEM.md
  'inline-flex items-center justify-center gap-2',
  // Typography - Mulish SemiBold
  'font-mulish font-semibold tracking-[0.4px] leading-6',
  // Shape - Pill (100px radius)
  'rounded-full',
  // Transitions
  'transition-all duration-150',
  // Focus: use focus-visible for keyboard-only focus ring
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  // Disabled: reduced opacity
  'disabled:opacity-30 disabled:cursor-not-allowed',
].join(' ');

const variants: Record<ButtonVariant, string> = {
  // Primary: Blue filled, white text
  primary: [
    'bg-[#0038ff] text-white',
    'hover:bg-[#0030e0]',
    'active:bg-[#0028c0]',
    'focus-visible:ring-[#0038ff]',
  ].join(' '),

  // Secondary: Slate filled, dark text
  secondary: [
    'bg-[#d9dbe1] text-[#0d1531]',
    'hover:bg-[#c9cbd1]',
    'active:bg-[#b9bbc1]',
    'focus-visible:ring-[#b3b7c4]',
  ].join(' '),

  // Outline: Blue border, blue text, transparent bg
  outline: [
    'border border-[#0038ff] bg-transparent text-[#0038ff]',
    'hover:bg-[#0038ff]/5',
    'active:bg-[#0038ff]/10',
    'focus-visible:ring-[#0038ff]',
  ].join(' '),

  // Ghost: No background, dark text
  ghost: [
    'bg-transparent text-[#3d445a]',
    'hover:bg-[#f2f3f5]',
    'active:bg-[#e6e8ed]',
    'focus-visible:ring-[#b3b7c4]',
  ].join(' '),

  // Destructive: Red border, red text
  destructive: [
    'border border-[#e13535] bg-transparent text-[#e13535]',
    'hover:bg-[#e13535]/5',
    'active:bg-[#e13535]/10',
    'focus-visible:ring-[#e13535]',
  ].join(' '),
};

const sizes: Record<ButtonSize, string> = {
  // Small: 16px horizontal, 8px vertical per DESIGN_SYSTEM.md, min-h-[44px] for touch targets
  sm: 'px-4 py-2 text-sm min-h-[44px]',
  // Large: 24px horizontal, 12px vertical (exception for hero CTAs)
  lg: 'px-6 py-3 text-base min-h-[48px]',
};

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SPINNER
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'sm', // Default to small - use size="lg" only with justification comment
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ─────────────────────────────────────────────────────────────────────────────
// LINK BUTTON COMPONENT
// For buttons that navigate (render as <a>)
// ─────────────────────────────────────────────────────────────────────────────

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'sm', // Default to small - use size="lg" only with justification comment
      isLoading = false,
      href,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'opacity-30 pointer-events-none',
          className
        )}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export { Button, LinkButton };
