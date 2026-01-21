'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, Database } from 'lucide-react';

interface DisclosureProps {
  trigger: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

/**
 * Disclosure / Accordion Component
 * A collapsible section with keyboard navigation and accessibility support
 */
export function Disclosure({
  trigger,
  children,
  defaultOpen = false,
  icon,
}: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
      >
        <span className="flex items-center gap-2">
          {icon || <Database className="h-4 w-4" />}
          {trigger}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="border-t border-slate-200 bg-slate-50 p-4 max-h-[600px] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}
