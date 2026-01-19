'use client';

/**
 * Vendors Directory Page
 *
 * STRICT: Uses ONLY GetProven API data
 * - Fetches from /vendors/ with page and page_size
 * - Load more using API-provided 'next' URL
 * - Stop fetching when next is null
 * - Filter by search, service_name, group_name
 * - Filter values derived dynamically from API responses
 * - NO ratings, reviews, or popularity indicators
 */

import { Suspense, useEffect, useState, useCallback } from 'react';
import { AlertCircle, Loader2, Filter, X, Search } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { VendorsGrid } from '@/components/vendors';
import type { GetProvenVendor } from '@/types';

const PAGE_SIZE = 24;

interface FilterOptions {
  services: string[];
  vendorGroups: string[];
}

interface ActiveFilters {
  search: string;
  serviceName: string;
  groupName: string;
}

function VendorsPageContent() {
  // Data state
  const [vendors, setVendors] = useState<GetProvenVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    services: [],
    vendorGroups: [],
  });
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    search: '',
    serviceName: '',
    groupName: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filter options from API
  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/vendors/filters');
      if (!res.ok) return;
      const data = await res.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  }, []);

  // Fetch vendors with "Load more" pattern
  const fetchVendors = useCallback(async (loadMore = false) => {
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
        url = `/api/vendors?next=${encodeURIComponent(nextUrl)}`;
      } else {
        // Initial fetch with page and page_size
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('page_size', String(PAGE_SIZE));

        if (activeFilters.search) {
          params.set('search', activeFilters.search);
        }
        if (activeFilters.serviceName) {
          params.set('service_name', activeFilters.serviceName);
        }
        if (activeFilters.groupName) {
          params.set('group_name', activeFilters.groupName);
        }

        url = `/api/vendors?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch vendors');

      const data = await res.json();

      if (loadMore) {
        setVendors((prev) => [...prev, ...(data.data || [])]);
      } else {
        setVendors(data.data || []);
        setTotalCount(data.pagination?.count || 0);
      }

      setNextUrl(data.pagination?.next || null);
    } catch (err) {
      console.error('Vendors fetch error:', err);
      setError('Unable to load vendors. Please try again.');
      if (!loadMore) setVendors([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [nextUrl, activeFilters]);

  // Initial fetch
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch vendors when filters change
  useEffect(() => {
    setVendors([]);
    setNextUrl(null);
    fetchVendors(false);
  }, [activeFilters]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters((prev) => ({ ...prev, search: searchInput }));
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setActiveFilters((prev) => ({ ...prev, search: '' }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setActiveFilters({
      search: '',
      serviceName: '',
      groupName: '',
    });
  };

  const hasActiveFilters =
    activeFilters.search !== '' ||
    activeFilters.serviceName !== '' ||
    activeFilters.groupName !== '';

  const hasFilterOptions =
    filterOptions.services.length > 0 ||
    filterOptions.vendorGroups.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors Directory</h1>
          <p className="text-slate-600">
            Explore trusted vendors and service providers
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
                {(activeFilters.serviceName ? 1 : 0) + (activeFilters.groupName ? 1 : 0) + (activeFilters.search ? 1 : 0)}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search vendors..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="primary">
          Search
        </Button>
      </form>

      {/* Filters Panel */}
      {showFilters && hasFilterOptions && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-900">Filter Vendors</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Services Filter */}
            {filterOptions.services.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Service</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.services.slice(0, 15).map((service) => (
                    <button
                      key={service}
                      onClick={() =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          serviceName: prev.serviceName === service ? '' : service,
                        }))
                      }
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        activeFilters.serviceName === service
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                  {filterOptions.services.length > 15 && (
                    <span className="px-3 py-1 text-sm text-slate-500">
                      +{filterOptions.services.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Vendor Groups Filter */}
            {filterOptions.vendorGroups.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Group</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.vendorGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          groupName: prev.groupName === group ? '' : group,
                        }))
                      }
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        activeFilters.groupName === group
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {group}
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
            onClick={() => fetchVendors(false)}
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
            ? 'Loading vendors...'
            : `${totalCount} ${totalCount === 1 ? 'vendor' : 'vendors'} found`}
        </p>

        {/* Vendors Grid */}
        <VendorsGrid
          vendors={vendors}
          isLoading={isLoading}
          emptyMessage="No vendors found"
        />

        {/* Load More Button */}
        {nextUrl && !isLoading && (
          <div className="flex flex-col items-center gap-2 border-t border-slate-200 pt-6 mt-6">
            <p className="text-sm text-slate-500">
              Showing {vendors.length} of {totalCount} vendors
            </p>
            <Button
              variant="outline"
              onClick={() => fetchVendors(true)}
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
        {!nextUrl && !isLoading && vendors.length > 0 && (
          <div className="flex justify-center border-t border-slate-200 pt-6 mt-6">
            <p className="text-sm text-slate-500">
              Showing all {vendors.length} vendors
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
function VendorsPageLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<VendorsPageLoading />}>
      <VendorsPageContent />
    </Suspense>
  );
}
