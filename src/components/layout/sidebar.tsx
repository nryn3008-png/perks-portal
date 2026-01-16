'use client';

/**
 * Sidebar component
 * Main navigation sidebar for the application
 *
 * Branding:
 * - Bridge logo (primary) - links to https://brdg.app/home/
 * - Powered by GetProven (attribution) - links to https://getproven.com
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

// External brand URLs
const BRIDGE_URL = 'https://brdg.app/home/';
const GETPROVEN_URL = 'https://getproven.com';

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
      {/* Bridge Logo - Primary Branding */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <a
          href={BRIDGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label="Bridge - Opens in new tab"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/bridge-icon.png"
            alt=""
            className="h-9 w-9 rounded-lg"
          />
          <span className="text-xl font-bold text-slate-900">Bridge</span>
        </a>
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

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200">
        {/* Portfolio Selector */}
        <div className="p-4 pb-3">
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

        {/* Powered by GetProven - Attribution */}
        <div className="border-t border-slate-100 px-4 py-3">
          <a
            href={GETPROVEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md py-1 text-xs text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            aria-label="Powered by GetProven - Opens in new tab"
          >
            <span>Powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/getproven-logo.png"
              alt="GetProven"
              className="h-3 w-auto"
            />
          </a>
        </div>
      </div>
    </aside>
  );
}
