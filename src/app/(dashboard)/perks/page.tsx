'use client';

/**
 * Perks (Offers) Listing Page
 *
 * STRICT: Uses ONLY GetProven API data
 * - Fetches from /offers/ with page and page_size
 * - Load more using API-provided 'next' URL
 * - Stop fetching when next is null
 * - Filter by offer_categories and investment_levels (comma-separated)
 * - Filter values derived dynamically from API responses
 * - NO hardcoded filter options
 * - NO claimed/redeemed/expiry/popularity indicators
 */

import { Suspense, useEffect, useState, useCallback } from 'react';
import { AlertCircle, Loader2, Filter, X } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { OffersGrid } from '@/components/perks';
import type { GetProvenDeal } from '@/types';

const PAGE_SIZE = 24;

interface FilterOptions {
  offerCategories: string[];
  investmentLevels: string[];
}

interface ActiveFilters {
  offerCategories: string[];
  investmentLevels: string[];
}

function PerksPageContent() {
  // Data state
  const [offers, setOffers] = useState<GetProvenDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    offerCategories: [],
    investmentLevels: [],
  });
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    offerCategories: [],
    investmentLevels: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filter options from API (derived dynamically)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/perks/filters');
      if (!res.ok) return;
      const data = await res.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  }, []);

  // Fetch offers with "Load more" pattern
  const fetchOffers = useCallback(async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      let url: string;

      if (loadMore && nextUrl) {
        // Use API-provided next URL
        url = `/api/perks?next=${encodeURIComponent(nextUrl)}`;
      } else {
        // Initial fetch with page and page_size
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('page_size', String(PAGE_SIZE));

        if (activeFilters.offerCategories.length > 0) {
          params.set('offer_categories', activeFilters.offerCategories.join(','));
        }
        if (activeFilters.investmentLevels.length > 0) {
          params.set('investment_levels', activeFilters.investmentLevels.join(','));
        }

        url = `/api/perks?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch offers');

      const data = await res.json();

      if (loadMore) {
        setOffers((prev) => [...prev, ...(data.data || [])]);
      } else {
        setOffers(data.data || []);
        setTotalCount(data.pagination?.count || 0);
      }

      setNextUrl(data.pagination?.next || null);
    } catch (err) {
      console.error('Offers fetch error:', err);
      setError('Unable to load perks. Please try again.');
      if (!loadMore) setOffers([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [nextUrl, activeFilters]);

  // Initial fetch
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch offers when filters change
  useEffect(() => {
    setOffers([]);
    setNextUrl(null);
    fetchOffers(false);
  }, [activeFilters]);

  // Toggle filter value
  const toggleFilter = (type: 'offerCategories' | 'investmentLevels', value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      offerCategories: [],
      investmentLevels: [],
    });
  };

  const hasActiveFilters =
    activeFilters.offerCategories.length > 0 ||
    activeFilters.investmentLevels.length > 0;

  const hasFilterOptions =
    filterOptions.offerCategories.length > 0 ||
    filterOptions.investmentLevels.length > 0;

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

        {/* Filter toggle button */}
        {hasFilterOptions && (
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {activeFilters.offerCategories.length + activeFilters.investmentLevels.length}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && hasFilterOptions && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-900">Filter Offers</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Investment Levels Filter */}
            {filterOptions.investmentLevels.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Investment Level</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.investmentLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleFilter('investmentLevels', level)}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        activeFilters.investmentLevels.includes(level)
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Offer Categories Filter */}
            {filterOptions.offerCategories.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.offerCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleFilter('offerCategories', cat)}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        activeFilters.offerCategories.includes(cat)
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
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
            onClick={() => fetchOffers(false)}
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

        {/* Offers Grid */}
        <OffersGrid
          offers={offers}
          isLoading={isLoading}
          emptyMessage="No perks available"
        />

        {/* Load More Button */}
        {nextUrl && !isLoading && (
          <div className="flex flex-col items-center gap-2 border-t border-slate-200 pt-6 mt-6">
            <p className="text-sm text-slate-500">
              Showing {offers.length} of {totalCount} perks
            </p>
            <Button
              variant="outline"
              onClick={() => fetchOffers(true)}
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

        {/* All loaded message */}
        {!nextUrl && !isLoading && offers.length > 0 && (
          <div className="flex justify-center border-t border-slate-200 pt-6 mt-6">
            <p className="text-sm text-slate-500">
              Showing all {offers.length} perks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading fallback
 */
function PerksPageLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export default function PerksPage() {
  return (
    <Suspense fallback={<PerksPageLoading />}>
      <PerksPageContent />
    </Suspense>
  );
}
