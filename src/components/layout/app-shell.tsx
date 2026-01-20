'use client';

/**
 * App Shell component
 * Main layout wrapper that provides consistent structure across pages
 *
 * Layout:
 * - Sidebar (left) with navigation, user identity, API status
 * - Main content area (right)
 * - No global header - elements moved to sidebar
 */

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
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - includes navigation, user identity, API status */}
      <Sidebar isAdmin={isAdmin} user={user} />

      {/* Main content area - offset by sidebar width */}
      <div className="pl-64">
        {/* Page content - full height since no header */}
        <main className="min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
