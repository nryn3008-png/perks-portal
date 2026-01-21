'use client';

/**
 * Offers Grid Component
 * Displays a grid of offer cards with loading and empty states
 */

import { OfferCard } from './offer-card';
import type { GetProvenDeal } from '@/types';

interface OffersGridProps {
  offers: GetProvenDeal[];
  vendorMap?: Record<number, { logo: string | null; name: string; primaryService?: string | null }>;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function OffersGrid({
  offers,
  vendorMap = {},
  isLoading = false,
  emptyMessage = 'No perks available',
}: OffersGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl bg-slate-100"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  // Grid of offers
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {offers.map((offer) => {
        const vendor = vendorMap[offer.vendor_id];
        return (
          <OfferCard
            key={offer.id}
            offer={offer}
            vendorLogo={vendor?.logo}
            vendorName={vendor?.name}
            vendorPrimaryService={vendor?.primaryService}
          />
        );
      })}
    </div>
  );
}
