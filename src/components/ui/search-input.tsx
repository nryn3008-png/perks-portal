/**
 * SearchInput component - Arch Design System
 *
 * Implements the unified search input design from Figma:
 * https://www.figma.com/design/Jwlx9tJxTcGZW9cB9onSHz/Arch-Design-System?node-id=16805-26279
 *
 * States:
 * - Default: Gray background (#f9f9fa), gray border (#b3b7c4)
 * - Hover: Gray background, darker border (#81879c)
 * - Focus: White background, blue border (#568fff)
 *
 * IMPORTANT: Border width is CONSTANT (1px) across all states to prevent layout shift.
 * Only border COLOR changes on hover/focus.
 *
 * All visual styling is on the CONTAINER. Input is fully transparent.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Hide the clear button even when value exists */
  hideClearButton?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (Arch Design System - Figma node 16805-26279)
// ─────────────────────────────────────────────────────────────────────────────

// Container handles ALL visual styling
// IMPORTANT: Border width is CONSTANT (1px) to prevent layout shift on hover/focus
const containerStyles = [
  // Layout - flex row with 8px gap per DESIGN_SYSTEM.md
  'flex items-center gap-2',
  // Shape - Pill (fully rounded)
  'rounded-full',
  // Padding - 16px horizontal, 8px vertical per DESIGN_SYSTEM.md
  'px-4 py-2',
  // Background - Default state: slate-05
  'bg-[#f9f9fa]',
  // Border - CONSTANT 1px width, only color changes
  'border border-[#b3b7c4]',
  // Transitions - colors only, not geometry
  'transition-colors duration-150',
  // Hover state - darker border color only (no width change)
  'hover:border-[#81879c]',
  // Focus-within state - white bg, blue border color only (no width change)
  'focus-within:bg-white focus-within:border-[#568fff]',
].join(' ');

// Input is FULLY TRANSPARENT - no visual chrome
const inputStyles = [
  // Fill available space
  'flex-1 min-w-0',
  // Fully transparent - no background, border, outline
  'bg-transparent border-none outline-none',
  // Remove all focus styling - override global focus-visible styles
  'focus:outline-none focus:ring-0 focus:border-none focus:shadow-none',
  'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
  // Remove any browser default styling
  'appearance-none',
  // Typography - Mulish Regular 14px, line-height 23px
  'font-mulish text-sm leading-[23px]',
  // Text color - charcoal
  'text-[#0d1531]',
  // Placeholder - slate-80
  'placeholder:text-[#9a9fb0]',
  // Disabled state
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

// Search icon - slate color
const iconStyles = 'h-4 w-4 text-[#81879c] flex-shrink-0';

// Clear button - minimal styling, no focus ring
const clearButtonStyles = [
  'flex-shrink-0',
  'text-[#81879c] hover:text-[#3d445a]',
  'transition-colors duration-150',
  // Remove all focus styling - override global focus-visible styles
  'focus:outline-none focus:ring-0',
  'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
].join(' ');

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onClear,
      hideClearButton = false,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const hasValue = value !== undefined && value !== '';
    const showClearButton = hasValue && !hideClearButton && !disabled && onClear;

    return (
      <div className={cn(containerStyles, className)}>
        {/* Search icon */}
        <Search className={iconStyles} aria-hidden="true" />

        {/* Input - fully transparent, no visual styling */}
        <input
          ref={ref}
          type="text"
          value={value}
          disabled={disabled}
          aria-label={ariaLabel || 'Search'}
          className={inputStyles}
          {...props}
        />

        {/* Clear button */}
        {showClearButton && (
          <button
            type="button"
            onClick={onClear}
            className={clearButtonStyles}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export { SearchInput };
