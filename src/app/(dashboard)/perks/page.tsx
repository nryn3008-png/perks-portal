'use client';

/**
 * Perks Listing Page
 * Fetches data from internal API routes (which proxy to GetProven)
 * STRICT: Real API data only. NO mock fallbacks.
 *
 * Pagination: Uses API-provided 'next' URL with "Load more" pattern.
 * DO NOT calculate pages client-side.
 */

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PerksGrid, CategoryFilter } from '@/components/perks';
import type { PerkListItem, PerkCategory } from '@/types';

const PAGE_SIZE = 24;

function PerksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [perks, setPerks] = useState<PerkListItem[]>([]);
  const [categories, setCategories] = useState<PerkCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  const categorySlug = searchParams.get('category') || undefined;

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  }, []);

  // Fetch perks with "Load more" pattern using API-provided next URL
  const fetchPerks = useCallback(async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      let url: string;

      if (loadMore && nextUrl) {
        url = `/api/perks?next=${encodeURIComponent(nextUrl)}`;
      } else {
        const params = new URLSearchParams();
        params.set('pageSize', String(PAGE_SIZE));
        if (categorySlug) params.set('category', categorySlug);
        if (searchQuery) params.set('search', searchQuery);
        url = `/api/perks?${params.toString()}`;
      }

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
      console.error('Perks fetch error:', err);
      setError('Unable to load perks. Please try again.');
      if (!loadMore) setPerks([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [categorySlug, searchQuery, nextUrl]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch perks when filters change (reset to first page)
  useEffect(() => {
    setPerks([]);
    setNextUrl(null);
    fetchPerks(false);
  }, [categorySlug, searchQuery]);

  const handleCategorySelect = (slug: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/perks?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleLoadMore = () => {
    if (nextUrl && !isLoadingMore) {
      fetchPerks(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Perks</h1>
          <p className="text-slate-600">
            Explore exclusive offers and discounts for your startup
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search perks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
              aria-label="Search perks"
            />
          </form>

          <Button
            variant="outline"
            size="md"
            aria-label="Open filters"
            aria-haspopup="dialog"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
            Filters
          </Button>
        </div>
      </div>

      {/* Category Filter - only show if categories loaded */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={categorySlug}
          onSelect={handleCategorySelect}
        />
      )}

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
            onClick={() => fetchPerks(false)}
            className="ml-auto text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Results */}
      <div>
        {/* Results count */}
        <p className="mb-4 text-sm text-slate-500" aria-live="polite">
          {isLoading
            ? 'Loading perks...'
            : `${totalCount} ${totalCount === 1 ? 'perk' : 'perks'} found`}
        </p>

        {/* Perks Grid */}
        <PerksGrid
          perks={perks}
          isLoading={isLoading}
          emptyMessage={
            error
              ? 'Unable to load perks'
              : categorySlug
              ? 'No perks found in this category'
              : searchQuery
              ? `No perks found for "${searchQuery}"`
              : 'No perks available'
          }
        />

        {/* Load More Button */}
        {nextUrl && !isLoading && (
          <div className="flex flex-col items-center gap-2 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Showing {perks.length} of {totalCount} perks
            </p>
            <Button
              variant="outline"
              onClick={handleLoadMore}
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
          </div>
        )}

        {/* Show count when all loaded */}
        {!nextUrl && !isLoading && perks.length > 0 && (
          <div className="flex justify-center border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Showing all {perks.length} perks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading fallback for Suspense boundary
 */
function PerksPageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

/**
 * Page wrapper with Suspense boundary for useSearchParams
 */
export default function PerksPage() {
  return (
    <Suspense fallback={<PerksPageLoading />}>
      <PerksPageContent />
    </Suspense>
  );
}
