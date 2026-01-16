'use client';

/**
 * Perks Listing Page
 * Fetches data from internal API routes (which proxy to GetProven)
 * STRICT: Real API data only. NO mock fallbacks.
 *
 * Category counts are DERIVED from actual perks data, not from raw API.
 * This ensures counts always match the number of displayable perks.
 */

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PerksGrid, CategoryFilter } from '@/components/perks';
import type { PerkListItem, PerkCategory } from '@/types';

const PAGE_SIZE = 24; // Show 24 perks per page

/**
 * Derive category counts from the actual perks list.
 * Counts how many perks exist per category slug.
 */
function deriveCategoryCounts(perks: PerkListItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const perk of perks) {
    const slug = perk.category?.slug;
    if (slug) {
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
  }
  return counts;
}

function PerksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [perks, setPerks] = useState<PerkListItem[]>([]);
  const [allPerks, setAllPerks] = useState<PerkListItem[]>([]); // Unfiltered for counts
  const [categories, setCategories] = useState<PerkCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const categorySlug = searchParams.get('category') || undefined;

  // Fetch categories (structure only, counts will be overridden)
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

  // Fetch ALL perks (with search filter only) to derive accurate category counts
  const fetchAllPerksForCounts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      // No category filter - we want counts across all categories

      const res = await fetch(`/api/perks?${params.toString()}`);
      if (!res.ok) return;

      const data = await res.json();
      setAllPerks(data.data || []);
    } catch (err) {
      console.error('All perks fetch error:', err);
    }
  }, [searchQuery]);

  // Fetch filtered perks for display with pagination
  const fetchPerks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('pageSize', String(PAGE_SIZE));
      if (categorySlug) params.set('category', categorySlug);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/perks?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch perks');
      }

      const data = await res.json();
      setPerks(data.data || []);
      setTotalCount(data.pagination?.totalItems || 0);
      setTotalPages(data.pagination?.totalPages || 0);
    } catch (err) {
      console.error('Perks fetch error:', err);
      setError('Unable to load perks. Please try again.');
      setPerks([]);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, searchQuery, currentPage]);

  // Derive category counts from allPerks (search-filtered, not category-filtered)
  // This ensures counts reflect perks matching current search across ALL categories
  const categoriesWithDerivedCounts = useMemo(() => {
    const counts = deriveCategoryCounts(allPerks);
    return categories.map((cat) => ({
      ...cat,
      perkCount: counts.get(cat.slug) || 0,
    }));
  }, [categories, allPerks]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch perks when filters change
  useEffect(() => {
    fetchPerks();
    fetchAllPerksForCounts();
  }, [fetchPerks, fetchAllPerksForCounts]);

  const handleCategorySelect = (slug: string | undefined) => {
    setCurrentPage(1); // Reset to page 1 when category changes
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
    setCurrentPage(1); // Reset to page 1 when searching
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {categoriesWithDerivedCounts.length > 0 && (
        <CategoryFilter
          categories={categoriesWithDerivedCounts}
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
            onClick={fetchPerks}
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

        {/* Pagination Controls */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages} ({totalCount} perks)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
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
