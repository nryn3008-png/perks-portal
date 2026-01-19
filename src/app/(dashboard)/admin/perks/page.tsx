'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Pencil,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { formatPerkValue } from '@/lib/utils';
import type { PerkListItem } from '@/types';

const PAGE_SIZE = 50;

/**
 * Admin Perks Management Page
 * STRICT: Uses real API data only. NO mock fallbacks.
 * Pagination: Uses API-provided 'next' URL with "Load more" pattern.
 */
export default function AdminPerksPage() {
  const [perks, setPerks] = useState<PerkListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPerks = useCallback(async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const url = loadMore && nextUrl
        ? `/api/perks?next=${encodeURIComponent(nextUrl)}`
        : `/api/perks?pageSize=${PAGE_SIZE}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch perks');

      const data = await res.json();

      if (loadMore) {
        setPerks((prev) => [...prev, ...(data.data || [])]);
      } else {
        setPerks(data.data || []);
        setTotalCount(data.pagination?.count || 0);
      }

      setNextUrl(data.pagination?.next || null);
    } catch (err) {
      console.error('Admin perks fetch error:', err);
      setError('Unable to load perks. Please try again.');
      if (!loadMore) setPerks([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [nextUrl]);

  useEffect(() => {
    fetchPerks();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Perks</h1>
          <p className="text-slate-600">
            View, edit, and control which perks are visible to your portfolio
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Perk
        </Button>
        {/* TODO: Implement add custom perk modal */}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search perks..."
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          {/* TODO: Implement filter dropdown */}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p>{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-auto text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-4 text-slate-600">Loading perks...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && perks.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <p className="text-slate-600">No perks available</p>
          </div>
        </Card>
      )}

      {/* Perks Table */}
      {!isLoading && !error && perks.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-500">
                  <th className="px-6 py-4">Perk</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {perks.map((perk) => (
                    <tr key={perk.id} className="hover:bg-slate-50">
                      {/* Perk */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            {perk.provider.logo ? (
                              <img
                                src={perk.provider.logo}
                                alt={perk.provider.name}
                                className="h-6 w-6 object-contain"
                              />
                            ) : perk.provider.faviconUrl ? (
                              <img
                                src={perk.provider.faviconUrl}
                                alt=""
                                className="h-6 w-6 object-contain"
                              />
                            ) : (
                              <span className="text-sm font-medium text-slate-400">
                                {perk.provider.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {perk.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              {perk.provider.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {formatPerkValue(perk.value)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {/* TODO: Implement edit and more actions */}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer with Load more */}
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing {perks.length} of {totalCount} perks
            </p>
            {nextUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPerks(true)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Bulk Actions (shown when items selected) */}
      {/* TODO: Implement bulk selection and actions */}
    </div>
  );
}
