'use client';

/**
 * Header component
 * Top navigation bar with search and user menu
 */

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, User, LogOut, Settings, Shield } from 'lucide-react';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  isAdmin?: boolean;
}

export function Header({ user, isAdmin = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // TODO: Implement search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="w-full max-w-md">
        <Input
          type="search"
          placeholder="Search perks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          className="w-full"
        />
      </form>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Notification badge */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          {/* TODO: Implement notifications */}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700',
                      'hover:bg-slate-50',
                      'focus:outline-none focus-visible:bg-slate-50'
                    )}
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700',
                      'hover:bg-slate-50',
                      'focus:outline-none focus-visible:bg-slate-50'
                    )}
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Settings
                  </button>
                </div>

                {/* Admin access - subtle, secondary link for platform team */}
                {isAdmin && (
                  <div className="border-t border-slate-100 py-1">
                    <Link
                      href="/admin"
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-500',
                        'hover:bg-slate-50 hover:text-slate-700',
                        'focus:outline-none focus-visible:bg-slate-50'
                      )}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      Platform Admin
                    </Link>
                  </div>
                )}

                <div className="border-t border-slate-100 py-1">
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600',
                      'hover:bg-red-50',
                      'focus:outline-none focus-visible:bg-red-50'
                    )}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
                {/* TODO: Implement auth actions */}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
