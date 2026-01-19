import { AppShell } from '@/components/layout';

/**
 * Dashboard Layout
 * Wraps all authenticated pages with the app shell (sidebar + header)
 *
 * ACCESS CONTROL:
 * - In production, isAdmin would be determined by auth/session
 * - Admin navigation is conditionally rendered based on isAdmin flag
 */

/**
 * Admin flag for UI rendering
 * TODO: Replace with real auth check (e.g., session.user.role === 'admin')
 */
const isAdmin = true;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
