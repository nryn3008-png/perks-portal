'use client';

/**
 * App Shell component
 * Main layout wrapper that provides consistent structure across pages
 *
 * Layout:
 * - Mobile: Top header with logo + hamburger menu, slide-in sidebar
 * - Desktop: Fixed sidebar (left) with navigation, user identity, API status
 * - Main content area (right)
 */

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export function AppShell({ children, isAdmin = false, user }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <a
          href="https://brdg.app/home/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Bridge - Opens in new tab"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/bridge-logo.svg"
            alt="Bridge"
            className="h-4 w-auto"
          />
        </a>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar - slide-in on mobile, fixed on desktop */}
      <Sidebar
        isAdmin={isAdmin}
        user={user}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className="pt-14 md:pt-0 md:pl-64">
        {/* Page content */}
        <main className="min-h-screen p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
