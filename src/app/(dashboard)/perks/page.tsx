'use client';

/**
 * Perks (Offers) Listing Page
 *
 * STRICT: Uses ONLY GetProven API data
 * - Fetches ALL offers matching filters in one request (page_size=1000)
 * - Filter by offer_categories and investment_levels (comma-separated)
 * - Filter values derived dynamically from API responses
 * - Client-side search by vendor name (works across all ~460 perks)
 * - NO hardcoded filter options
 * - NO claimed/redeemed/expiry/popularity indicators
 *
 * Data Flow:
 * API (filters applied, page_size=1000) → allFilteredOffers → vendor search → finalOffers
 */

import { Suspense, useEffect, useState, useCallback } from 'react';
import { AlertCircle, Filter, X, Search } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { OffersGrid } from '@/components/perks';
import type { GetProvenDeal } from '@/types';

// Fetch all matching offers in one request (total perks ≈ 460)
const PAGE_SIZE = 1000;

interface FilterOptions {
  offerCategories: string[];
  investmentLevels: string[];
}

interface ActiveFilters {
  offerCategories: string[];
  investmentLevels: string[];
}

function PerksPageContent() {
  // Data state - all filtered offers fetched in one request
  const [offers, setOffers] = useState<GetProvenDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vendor map state (vendorId → { logo, name })
  const [vendorMap, setVendorMap] = useState<Record<number, { logo: string | null; name: string }>>({});

  // Totals state for header (from /api/perks/totals)
  const [totals, setTotals] = useState<{ totalOffers: number; totalSavings: string } | null>(null);

  // Search state (filters by vendor name)
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fetch totals for header display
  const fetchTotals = useCallback(async () => {
    try {
      const res = await fetch('/api/perks/totals');
      if (!res.ok) return;
      const data = await res.json();
      setTotals(data);
    } catch (err) {
      console.error('Failed to fetch totals:', err);
    }
  }, []);

  // Fetch all vendors and build vendor map (vendorId → { logo, name })
  const fetchVendors = useCallback(async () => {
    try {
      // Fetch all vendors with a large page size to get all data at once
      const res = await fetch('/api/vendors?page_size=1000');
      if (!res.ok) return;
      const data = await res.json();

      // Build vendorId → { logo, name } map
      const map: Record<number, { logo: string | null; name: string }> = {};
      for (const vendor of data.data || []) {
        if (vendor.id) {
          map[vendor.id] = {
            logo: vendor.logo || null,
            name: vendor.name || '',
          };
        }
      }
      setVendorMap(map);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  }, []);

  // Fetch ALL offers matching current filters in one request
  // This ensures vendor-name search works across the entire catalog
  const fetchOffers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('page_size', String(PAGE_SIZE));

      if (activeFilters.offerCategories.length > 0) {
        params.set('offer_categories', activeFilters.offerCategories.join(','));
      }
      if (activeFilters.investmentLevels.length > 0) {
        params.set('investment_levels', activeFilters.investmentLevels.join(','));
      }

      const res = await fetch(`/api/perks?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch offers');

      const data = await res.json();
      setOffers(data.data || []);
    } catch (err) {
      console.error('Offers fetch error:', err);
      setError('Unable to load perks. Please try again.');
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  // Initial fetch - fetch filter options, vendors, and totals in parallel
  useEffect(() => {
    fetchFilterOptions();
    fetchVendors();
    fetchTotals();
  }, [fetchFilterOptions, fetchVendors, fetchTotals]);

  // Fetch offers when filters change
  useEffect(() => {
    fetchOffers();
  }, [activeFilters, fetchOffers]);

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

  // Derived state for search
  const isSearchActive = searchQuery.trim().length > 0;

  // FINAL OFFERS: Single source of truth for all UI rendering
  // Data flow: API offers (with filters) → client-side search → finalOffers
  const finalOffers = isSearchActive
    ? offers.filter((offer) => {
        const vendorName = vendorMap[offer.vendor_id]?.name || '';
        return vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : offers;

  // Determine appropriate empty message based on current state
  const getEmptyMessage = (): string => {
    if (isSearchActive) {
      return `No perks found for vendor "${searchQuery}"`;
    }
    if (hasActiveFilters) {
      return 'No perks match your filters';
    }
    return 'No perks available';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Perks for Your Startup</h1>
          <p className="text-slate-600">
            {totals ? (
              <>
                Access {totals.totalOffers}+ exclusive offers from trusted partners
                {totals.totalSavings && totals.totalSavings !== 'No data' && (
                  <>, worth over {totals.totalSavings} in total savings for your portfolio companies</>
                )}
                .
              </>
            ) : (
              'Access exclusive offers from trusted partners for your portfolio companies.'
            )}
          </p>
        </div>

        {/* Filter toggle button */}
        {hasFilterOptions && (
          <Button
            variant={showFilters ? 'primary' : 'outline'}
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

      {/* Search Input - filters by vendor name */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Search by vendor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Clear search</span>
          </button>
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
            onClick={() => fetchOffers()}
            className="ml-auto text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Results */}
      <div>
        {/* Results count - always reflects finalOffers */}
        <p className="mb-4 text-sm text-slate-500" aria-live="polite">
          {isLoading
            ? 'Loading perks...'
            : isSearchActive
            ? `${finalOffers.length} ${finalOffers.length === 1 ? 'perk' : 'perks'} found for "${searchQuery}"`
            : `${offers.length} ${offers.length === 1 ? 'perk' : 'perks'} found`}
        </p>

        {/* Offers Grid - uses finalOffers as single source of truth */}
        <OffersGrid
          offers={finalOffers}
          vendorMap={vendorMap}
          isLoading={isLoading}
          emptyMessage={getEmptyMessage()}
        />

        {/* All perks loaded message */}
        {!isLoading && finalOffers.length > 0 && (
          <div className="flex justify-center border-t border-slate-200 pt-6 mt-6">
            <p className="text-sm text-slate-500">
              Showing all {finalOffers.length} perks
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
