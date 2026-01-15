'use client';

/**
 * Sidebar component
 * Main navigation sidebar for the application
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gift,
  Grid3X3,
  Settings,
  BarChart3,
  Users,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAVIGATION } from '@/lib/constants';

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Gift,
  Grid3X3,
  Settings,
  BarChart3,
  Users,
};

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">
            Perks Portal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {/* Main Navigation */}
        <div className="mb-2">
          <span className="px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Browse
          </span>
        </div>

        {NAVIGATION.main.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.name}
            </Link>
          );
        })}

        {/* Admin Navigation - Only shown for admin users */}
        {isAdmin && (
          <>
            <div className="mb-2 mt-6">
              <span className="px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Admin
              </span>
            </div>

            {NAVIGATION.admin.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Portfolio Selector (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
        <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-600 text-xs font-medium text-white">
              A
            </div>
            <span className="font-medium text-slate-700">Acme Ventures</span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        {/* TODO: Implement portfolio/VC selector dropdown */}
      </div>
    </aside>
  );
}
