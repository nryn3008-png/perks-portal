import { AppShell } from '@/components/layout';

/**
 * Dashboard Layout
 * Wraps all authenticated pages with the app shell (sidebar + header)
 *
 * Default: Founder view (isAdmin = false)
 * Admin features are hidden unless explicitly enabled
 */

// TODO: Replace with actual user data from auth
const mockUser = {
  name: 'Jane Founder',
  email: 'jane@acme-startup.com',
  role: 'founder' as const,
};

/**
 * Role flag for conditional UI rendering
 * Set to true to preview admin features during development
 * In production, this would come from auth/session
 */
const isAdmin = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell user={mockUser} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
