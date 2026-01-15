'use client';

/**
 * App Shell component
 * Main layout wrapper that provides consistent structure across pages
 */

import { Sidebar } from './sidebar';
import { Header } from './header';

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
      {/* Sidebar */}
      <Sidebar isAdmin={isAdmin} />

      {/* Main content area - offset by sidebar width */}
      <div className="pl-64">
        {/* Header */}
        <Header user={user} isAdmin={isAdmin} />

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
