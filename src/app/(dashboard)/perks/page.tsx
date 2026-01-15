'use client';

/**
 * Perks Listing Page
 * Fetches data from internal API routes (which proxy to GetProven)
 * NO direct mock data imports - all data flows through /api/*
 */

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PerksGrid, CategoryFilter } from '@/components/perks';
import type { PerkListItem, PerkCategory } from '@/types';

// Dev-only indicator component
function DataSourceIndicator({ isLive }: { isLive: boolean }) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg ${
        isLive
          ? 'bg-green-100 text-green-800'
          : 'bg-amber-100 text-amber-800'
      }`}
      role="status"
      aria-live="polite"
    >
      {isLive ? '● Live data' : '○ Mock fallback'}
    </div>
  );
}

export default function PerksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [perks, setPerks] = useState<PerkListItem[]>([]);
  const [categories, setCategories] = useState<PerkCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isLiveData, setIsLiveData] = useState(true);

  const categorySlug = searchParams.get('category') || undefined;

  // Fetch categories from internal API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Categories fetch error:', err);
      // Categories are non-critical, continue without them
    }
  }, []);

  // Fetch perks from internal API
  const fetchPerks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (categorySlug) params.set('category', categorySlug);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/perks?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch perks');
      }

      const data = await res.json();

      // Check if we got real data or fallback
      // Real API typically returns more than mock's 6 items, or has specific markers
      const isMockData = data.pagination?.totalItems === 6 &&
        data.data?.[0]?.id?.startsWith('perk-');
      setIsLiveData(!isMockData);

      setPerks(data.data || []);
      setTotalCount(data.pagination?.totalItems || 0);
    } catch (err) {
      console.error('Perks fetch error:', err);
      setError('Unable to load perks. Please try again.');
      setPerks([]);
      setIsLiveData(false);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch perks when filters change
  useEffect(() => {
    fetchPerks();
  }, [fetchPerks]);

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
    // Search is reactive via state, form submit just prevents page reload
  };

  return (
    <div className="space-y-6">
      {/* Dev-only data source indicator */}
      <DataSourceIndicator isLive={isLiveData} />

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
      </div>
    </div>
  );
}
